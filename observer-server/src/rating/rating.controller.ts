import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Request,
  Delete,
} from '@nestjs/common';
import { RatingService } from './rating.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { Public } from '../authentication/decorators/public.decorator';

@Controller('ratings')
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}

  @Post('event/:id')
  create(
    @Param('id') eventId: string,
    @Request() req,
    @Body() createRatingDto: CreateRatingDto,
  ) {
    return this.ratingService.create(eventId, req.user.id, createRatingDto);
  }

  @Get('event/:id/average')
  @Public()
  getEventAverageRating(@Param('id') eventId: string) {
    return this.ratingService.getEventAverageRating(eventId);
  }

  @Get('event/:id')
  @Public()
  getEventRatings(@Param('id') eventId: string) {
    return this.ratingService.getEventRatings(eventId);
  }

  @Delete('event/:id')
  cancelRating(
    @Param('id') eventId: string, 
    @Request() req
  ) {
    return this.ratingService.cancelRating(eventId, req.user.id);
  }
}
