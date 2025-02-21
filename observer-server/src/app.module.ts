import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AuthenticationModule } from './authentication/authentication.module';
import { UserModule } from './user/user.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { InterestModule } from './interest/interest.module';
import { CityModule } from './city/city.module';
import { EventModule } from './event/event.module';
import { RatingModule } from './rating/rating.module';
import { CommentModule } from './comment/comment.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://localhost:27017/observer'),
    AuthenticationModule,
    UserModule,
    CloudinaryModule,
    InterestModule,
    CityModule,
    EventModule,
    RatingModule,
    CommentModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
  ],
})
export class AppModule {}