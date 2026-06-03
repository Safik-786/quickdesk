import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MetricsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary() {
    const [tickets, auditLogs, topAgents] = await Promise.all([
      this.prisma.ticket.findMany({
        select: {
          status: true,
          aiCategory: true,
          aiPriority: true,
          aiConfidence: true,
          agentCategory: true,
          agentPriority: true,
          createdAt: true,
          resolvedAt: true,
        },
      }),
      this.prisma.auditLog.findMany({
        select: { field: true },
      }),
      this.prisma.ticket.groupBy({
        by: ['resolvedById'],
        where: { resolvedById: { not: null } },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 5,
      }),
    ]);

    const totalTickets = tickets.length;

    // ── Status counts ──
    const openCount = tickets.filter((t) => t.status === 'open').length;
    const resolvedCount = tickets.filter((t) => t.status === 'resolved').length;
    const resolutionRate =
      totalTickets > 0 ? Math.round((resolvedCount / totalTickets) * 100) : 0;

    // ── By Category ──
    const byCategory = tickets.reduce<Record<string, number>>((acc, t) => {
      const cat = t.agentCategory ?? t.aiCategory ?? 'Other';
      acc[cat] = (acc[cat] ?? 0) + 1;
      return acc;
    }, {});

    // ── By Priority ──
    const byPriority = tickets.reduce<Record<string, number>>((acc, t) => {
      const pri = t.agentPriority ?? t.aiPriority ?? 'Low';
      acc[pri] = (acc[pri] ?? 0) + 1;
      return acc;
    }, {});

    // ── Resolution time calculations ──
    const resolvedTimes = tickets
      .filter((t) => t.status === 'resolved' && t.resolvedAt)
      .map((t) => t.resolvedAt!.getTime() - t.createdAt.getTime())
      .sort((a, b) => a - b);

    let medianResolutionMinutes: number | null = null;
    let avgResolutionMinutes: number | null = null;

    if (resolvedTimes.length > 0) {
      const mid = Math.floor(resolvedTimes.length / 2);
      const medianMs =
        resolvedTimes.length % 2 === 0
          ? (resolvedTimes[mid - 1] + resolvedTimes[mid]) / 2
          : resolvedTimes[mid];
      medianResolutionMinutes = Math.round(medianMs / 60000);

      const avgMs =
        resolvedTimes.reduce((sum, t) => sum + t, 0) / resolvedTimes.length;
      avgResolutionMinutes = Math.round(avgMs / 60000);
    }

    // ── Override rates ──
    const categoryOverrides = auditLogs.filter(
      (l) => l.field === 'category',
    ).length;
    const priorityOverrides = auditLogs.filter(
      (l) => l.field === 'priority',
    ).length;
    const categoryOverrideRate =
      totalTickets > 0
        ? Math.round((categoryOverrides / totalTickets) * 100)
        : 0;
    const priorityOverrideRate =
      totalTickets > 0
        ? Math.round((priorityOverrides / totalTickets) * 100)
        : 0;

    // ── AI Confidence analytics ──
    const confidenceValues = tickets
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      .map((t) => t.aiConfidence)
      .filter((c): c is number => c !== null && c !== undefined);

    const aiConfidence = {
      average:
        confidenceValues.length > 0
          ? Math.round(
              (confidenceValues.reduce((s, v) => s + v, 0) /
                confidenceValues.length) *
                100,
            ) / 100
          : null,
      min: confidenceValues.length > 0 ? Math.min(...confidenceValues) : null,
      max: confidenceValues.length > 0 ? Math.max(...confidenceValues) : null,
      total: confidenceValues.length,
      distribution: this.buildConfidenceDistribution(confidenceValues),
    };

    // ── Tickets by day (last 30 days) ──
    const ticketsByDay = this.buildTicketsByDay(tickets);

    // ── Top resolving agents ──
    const agentIds = topAgents
      .filter((a) => a.resolvedById)
      .map((a) => a.resolvedById as string);

    let agentMap: Record<string, string> = {};
    if (agentIds.length > 0) {
      const agents = await this.prisma.user.findMany({
        where: { id: { in: agentIds } },
        select: { id: true, name: true },
      });
      agentMap = agents.reduce(
        (acc, a) => {
          acc[a.id] = a.name;
          return acc;
        },
        {} as Record<string, string>,
      );
    }

    const topResolvingAgents = topAgents
      .filter((a) => a.resolvedById)
      .map((a) => ({
        agentId: a.resolvedById,
        name: agentMap[a.resolvedById as string] || 'Unknown',
        resolved: a._count.id,
      }));

    return {
      totalTickets,
      openCount,
      resolvedCount,
      resolutionRate,
      medianResolutionMinutes,
      avgResolutionMinutes,
      byCategory,
      byPriority,
      categoryOverrideRate,
      priorityOverrideRate,
      aiConfidence,
      ticketsByDay,
      topResolvingAgents,
    };
  }

  private buildConfidenceDistribution(values: number[]) {
    const buckets = [
      { label: '0-20%', min: 0, max: 0.2, count: 0 },
      { label: '20-40%', min: 0.2, max: 0.4, count: 0 },
      { label: '40-60%', min: 0.4, max: 0.6, count: 0 },
      { label: '60-80%', min: 0.6, max: 0.8, count: 0 },
      { label: '80-100%', min: 0.8, max: 1.01, count: 0 },
    ];

    for (const val of values) {
      for (const bucket of buckets) {
        if (val >= bucket.min && val < bucket.max) {
          bucket.count++;
          break;
        }
      }
    }

    return buckets.map((b) => ({ label: b.label, count: b.count }));
  }

  private buildTicketsByDay(
    tickets: { createdAt: Date }[],
  ): { date: string; count: number }[] {
    const now = new Date();
    const days: { date: string; count: number }[] = [];

    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      days.push({ date: dateStr, count: 0 });
    }

    for (const ticket of tickets) {
      const dateStr = ticket.createdAt.toISOString().slice(0, 10);
      const entry = days.find((d) => d.date === dateStr);
      if (entry) {
        entry.count++;
      }
    }

    return days;
  }
}
