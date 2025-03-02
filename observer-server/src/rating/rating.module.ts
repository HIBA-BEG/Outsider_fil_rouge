import { Module } from '@nestjs/common';
import { RatingService } from './rating.service';
import { RatingController } from './rating.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Rating, RatingSchema } from './entities/rating.entity';
import { EventSchema } from 'src/event/entities/event.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Rating.name, schema: RatingSchema },
      { name: Event.name, schema: EventSchema },
    ]),
  ],
  controllers: [RatingController],
  providers: [RatingService],
})
export class RatingModule {}
