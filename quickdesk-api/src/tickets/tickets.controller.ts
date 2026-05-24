import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
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
import { TicketRateLimitGuard } from './guards/ticket-rate-limit.guard';

@Controller('tickets')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  // Employee: submit a ticket
  @Post()
  @Roles('EMPLOYEE')
  @UseGuards(TicketRateLimitGuard)
  @UseInterceptors(
    FilesInterceptor('screenshots', 5, {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = uuidv4() + extname(file.originalname);
          cb(null, uniqueSuffix);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          return cb(
            new BadRequestException('Only image files are allowed!'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  create(
    @Body() dto: CreateTicketDto,
    @CurrentUser() user: JwtUser,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const filenames = files?.map((f) => f.filename) || [];
    return this.ticketsService.create(dto, user.id, filenames);
  }

  // Employee: view own tickets
  @Get('mine')
  @Roles('EMPLOYEE')
  findMine(@Query() filters: TicketFilterDto, @CurrentUser() user: JwtUser) {
    return this.ticketsService.findMine(user.id, filters);
  }

  // Agent: view all tickets with filters
  @Get()
  @Roles('AGENT')
  findAll(@Query() filters: TicketFilterDto) {
    return this.ticketsService.findAll(filters);
  }

  // Agent or Employee: get ticket detail
  @Get(':id')
  @Roles('AGENT', 'EMPLOYEE')
  findOne(@Param('id') id: string) {
    return this.ticketsService.findOne(id);
  }

  // Agent: get AI draft reply for a ticket
  @Get(':id/draft')
  @Roles('AGENT')
  getDraft(@Param('id') id: string) {
    return this.ticketsService.getDraftReply(id);
  }

  // Agent: override AI-suggested category/priority
  @Patch(':id/override')
  @Roles('AGENT')
  override(
    @Param('id') id: string,
    @Body() dto: OverrideTicketDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.ticketsService.override(id, dto, user.id);
  }

  // Agent or Employee: send reply in the thread
  @Post(':id/reply')
  @Roles('AGENT', 'EMPLOYEE')
  reply(
    @Param('id') id: string,
    @Body() dto: ReplyTicketDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.ticketsService.reply(id, dto, user.id);
  }

  // Employee: Resolve the ticket
  @Patch(':id/resolve')
  @Roles('EMPLOYEE', 'AGENT')
  resolve(
    @Param('id') id: string,
    @CurrentUser() user: JwtUser,
  ) {
    return this.ticketsService.resolveTicket(id, user.id);
  }
}
