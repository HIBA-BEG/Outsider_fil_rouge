import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
} from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Roles } from '../authentication/decorators/roles.decorator';
import { UserRole } from '../user/entities/user.entity';
import { Public } from '../authentication/decorators/public.decorator';
import { FileUpload } from '../types/file-upload.interface';

@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  @Roles(UserRole.ORGANIZER)
    async create(
    @Body() createEventDto: CreateEventDto,
    @Request() req,
  ) {
    console.log('Request body:', req.body);

    const eventData = {
      title: req.body.title?.value,
      description: req.body.description?.value,
      startDate: req.body.startDate?.value,
      endDate: req.body.endDate?.value,
      location: req.body.location?.value,
      city: req.body.city?.value,
      maxParticipants: parseInt(req.body.maxParticipants?.value),
      price: parseFloat(req.body.price?.value),
      interests: req.body.interests?.value?.split(',') || [],
      isPublic: req.body.isPublic?.value === 'true'
    };

    const processedFiles: FileUpload[] = [];

    if (Array.isArray(req.body.poster)) {
      for (const file of req.body.poster) {
        if (file.type === 'file') {
          const buffer = await file.toBuffer();
          processedFiles.push({
            buffer,
            mimetype: file.mimetype,
            originalname: file.filename
          });
        }
      }
    } else if (req.body.poster?.type === 'file') {
      const buffer = await req.body.poster.toBuffer();
      processedFiles.push({
        buffer,
        mimetype: req.body.poster.mimetype,
        originalname: req.body.poster.filename
      });
    }

    // console.log('Received files:', processedFiles);

    console.log('Processed files:', processedFiles.length);

    return this.eventService.create(
      eventData,
      req.user.id,
      processedFiles,
    );
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

  @Get('organizer/me')
  @Roles(UserRole.ORGANIZER)
  findMyEvents(@Request() req) {
    return this.eventService.findByOrganizer(req.user.id);
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

  @Delete(':id/register')
  cancelRegistration(@Param('id') id: string, @Request() req) {
    return this.eventService.cancelRegistration(id, req.user.id);
  }

  @Get('personalized')
  getPersonalizedEvents(@Request() req) {
    return this.eventService.getPersonalizedEvents(req.user.id);
  }
}
