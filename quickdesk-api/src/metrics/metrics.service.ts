import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MetricsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary() {
    const [tickets, auditLogs] = await Promise.all([
      this.prisma.ticket.findMany({
        select: {
          status: true,
          aiCategory: true,
          agentCategory: true,
          createdAt: true,
          resolvedAt: true,
        },
      }),
      this.prisma.auditLog.findMany({ select: { field: true } }),
    ]);

    // Tickets by status
    const byStatus = tickets.reduce<Record<string, number>>((acc, t) => {
      acc[t.status] = (acc[t.status] ?? 0) + 1;
      return acc;
    }, {});

    // Tickets by effective category (agent override takes precedence)
    const byCategory = tickets.reduce<Record<string, number>>((acc, t) => {
      const cat = t.agentCategory ?? t.aiCategory ?? 'Other';
      acc[cat] = (acc[cat] ?? 0) + 1;
      return acc;
    }, {});

    // Median resolution time (ms → minutes)
    const resolvedTimes = tickets
      .filter((t) => t.status === 'resolved' && t.resolvedAt)
      .map((t) => t.resolvedAt!.getTime() - t.createdAt.getTime())
      .sort((a, b) => a - b);

    let medianResolutionMinutes: number | null = null;
    if (resolvedTimes.length > 0) {
      const mid = Math.floor(resolvedTimes.length / 2);
      const medianMs =
        resolvedTimes.length % 2 === 0
          ? (resolvedTimes[mid - 1] + resolvedTimes[mid]) / 2
          : resolvedTimes[mid];
      medianResolutionMinutes = Math.round(medianMs / 60000);
    }

    // AI override rate for category
    const categoryOverrides = auditLogs.filter(
      (l) => l.field === 'category',
    ).length;
    const totalTickets = tickets.length;
    const overrideRate =
      totalTickets > 0
        ? Math.round((categoryOverrides / totalTickets) * 100)
        : 0;

    return {
      byStatus,
      byCategory,
      medianResolutionMinutes,
      categoryOverrideRate: overrideRate,
      totalTickets,
    };
  }
}
