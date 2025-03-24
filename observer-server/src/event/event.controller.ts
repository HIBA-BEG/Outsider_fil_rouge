import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Delete,
  Request,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { EventService } from './event.service';
import { Roles } from '../authentication/decorators/roles.decorator';
import { UserRole } from '../user/entities/user.entity';
import { Public } from '../authentication/decorators/public.decorator';
import { FileUpload } from '../types/file-upload.interface';
import { FastifyRequest } from 'fastify';

@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  @Roles(UserRole.ORGANIZER)
  async create(@Req() request: FastifyRequest, @Request() req) {
    try {
      const body = request.body as any;

      console.log('Request body:', body);

      if (!body) {
        throw new BadRequestException('No form data received');
      }

      const eventData = {
        title: body.title?.value || '',
        description: body.description?.value || '',
        startDate: body.startDate?.value || '',
        endDate: body.endDate?.value || '',
        location: body.location?.value || '',
        city: body.city?.value || '',
        maxParticipants: parseInt(body.maxParticipants?.value) || 0,
        price: parseFloat(body.price?.value) || 0.0,
        interests: body.interests?.value
          ? JSON.parse(body.interests.value)
          : [],
        isPublic: body.isPublic?.value === 'true',
      };

      const processedFiles: FileUpload[] = [];

      if (Array.isArray(body.poster)) {
        for (const file of body.poster) {
          if (file.type === 'file') {
            const buffer = await file.toBuffer();
            processedFiles.push({
              buffer,
              mimetype: file.mimetype,
              originalname: file.filename,
            });
          }
        }
      } else if (body.poster?.type === 'file') {
        const buffer = await body.poster.toBuffer();
        processedFiles.push({
          buffer,
          mimetype: body.poster.mimetype,
          originalname: body.poster.filename,
        });
      }

      console.log('Processed files:', processedFiles.length);

      return this.eventService.create(eventData, req.user.id, processedFiles);
    } catch (error) {
      console.error('Event creation error:', error);
      throw error;
    }
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
  async update(@Param('id') id: string, @Request() req) {
    console.log('Update event request body:', req.body);

    const eventData = {
      title: req.body.title?.value || req.body.title,
      description: req.body.description?.value || req.body.description,
      startDate: req.body.startDate?.value || req.body.startDate,
      endDate: req.body.endDate?.value || req.body.endDate,
      location: req.body.location?.value || req.body.location,
      city: req.body.city?.value || req.body.city,
      maxParticipants: req.body.maxParticipants?.value
        ? parseInt(req.body.maxParticipants.value)
        : req.body.maxParticipants
          ? parseInt(req.body.maxParticipants)
          : undefined,
      price: req.body.price?.value
        ? parseFloat(req.body.price.value)
        : req.body.price
          ? parseFloat(req.body.price)
          : undefined,
      interests: req.body.interests?.value
        ? req.body.interests.value.split(',')
        : req.body.interests
          ? req.body.interests.split(',')
          : [],
      isPublic:
        req.body.isPublic?.value === 'true' || req.body.isPublic === 'true',
    };

    const processedFiles: FileUpload[] = [];

    if (Array.isArray(req.body.poster)) {
      for (const file of req.body.poster) {
        if (file.type === 'file') {
          const buffer = await file.toBuffer();
          processedFiles.push({
            buffer,
            mimetype: file.mimetype,
            originalname: file.filename,
          });
        }
      }
    } else if (req.body.poster?.type === 'file') {
      const buffer = await req.body.poster.toBuffer();
      processedFiles.push({
        buffer,
        mimetype: req.body.poster.mimetype,
        originalname: req.body.poster.filename,
      });
    }

    console.log('Processed files for update:', processedFiles.length);

    return this.eventService.update(id, eventData, req.user.id, processedFiles);
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
