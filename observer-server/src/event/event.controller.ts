import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  // UseGuards,
  Request,
} from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
// import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
// import { RolesGuard } from '../authentication/guards/roles.guard';
import { Roles } from '../authentication/decorators/roles.decorator';
import { UserRole } from '../user/entities/user.entity';
import { Public } from '../authentication/decorators/public.decorator';

@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  // @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZER)
  create(@Body() createEventDto: CreateEventDto, @Request() req) {
    return this.eventService.create(createEventDto, req.user.id);
  }

  @Public()
  @Get()
  findAll() {
    return this.eventService.findAll();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ORGANIZER)
  update(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
    @Request() req,
  ) {
    return this.eventService.update(id, updateEventDto, req.user.id);
  }

  @Delete(':id')
  @Roles(UserRole.ORGANIZER)
  remove(@Param('id') id: string, @Request() req) {
    return this.eventService.remove(id, req.user.id);
  }

  @Get('organizer/:id')
  findByOrganizer(@Param('id') id: string) {
    return this.eventService.findByOrganizer(id);
  }

  @Post(':id/register')
  @Roles(UserRole.PARTICIPANT)
  registerForEvent(@Param('id') id: string, @Request() req) {
    return this.eventService.registerForEvent(id, req.user.id);
  }

  @Get('user/registered')
  getRegisteredEvents(@Request() req) {
    return this.eventService.getRegisteredEvents(req.user.id);
  }

  @Public()
  @Get(':id/available-spots')
  getAvailableSpots(@Param('id') id: string) {
    return this.eventService.getAvailableSpots(id);
  }
}
