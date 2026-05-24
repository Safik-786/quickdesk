import { Controller, Get, UseGuards } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ROLE } from '../auth/constants/roles.constant';

@Controller('metrics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ROLE.AGENT)
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  getSummary() {
    return this.metricsService.getSummary();
  }
}
