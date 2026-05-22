import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtUser } from '../auth/interfaces/jwt-user.interface';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { OverrideTicketDto } from './dto/override-ticket.dto';
import { ReplyTicketDto } from './dto/reply-ticket.dto';
import { TicketFilterDto } from './dto/ticket-filter.dto';

@Controller('tickets')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  // Employee: submit a ticket
  @Post()
  @Roles('employee')
  create(@Body() dto: CreateTicketDto, @CurrentUser() user: JwtUser) {
    return this.ticketsService.create(dto, user.id);
  }

  // Employee: view own tickets
  @Get('mine')
  @Roles('employee')
  findMine(@CurrentUser() user: JwtUser) {
    return this.ticketsService.findMine(user.id);
  }

  // Agent: view all tickets with filters
  @Get()
  @Roles('agent')
  findAll(@Query() filters: TicketFilterDto) {
    return this.ticketsService.findAll(filters);
  }

  // Agent: get ticket detail
  @Get(':id')
  @Roles('agent')
  findOne(@Param('id') id: string) {
    return this.ticketsService.findOne(id);
  }

  // Agent: get AI draft reply for a ticket
  @Get(':id/draft')
  @Roles('agent')
  getDraft(@Param('id') id: string) {
    return this.ticketsService.getDraftReply(id);
  }

  // Agent: override AI-suggested category/priority
  @Patch(':id/override')
  @Roles('agent')
  override(
    @Param('id') id: string,
    @Body() dto: OverrideTicketDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.ticketsService.override(id, dto, user.id);
  }

  // Agent: send reply and resolve ticket
  @Post(':id/reply')
  @Roles('agent')
  reply(
    @Param('id') id: string,
    @Body() dto: ReplyTicketDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.ticketsService.reply(id, dto, user.id);
  }
}
