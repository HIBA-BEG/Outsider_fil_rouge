import { Controller, Post, Body, Param, Get, Request } from '@nestjs/common';
import { RatingService } from './rating.service';
import { CreateRatingDto } from './dto/create-rating.dto';

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
  getEventAverageRating(@Param('id') eventId: string) {
    return this.ratingService.getEventAverageRating(eventId);
  }

}