import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthenticationModule } from './authentication/authentication.module';
import { UserModule } from './user/user.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { InterestModule } from './interest/interest.module';
import { CityModule } from './city/city.module';
import { EventModule } from './event/event.module';
import { RatingModule } from './rating/rating.module';
import { CommentModule } from './comment/comment.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './authentication/guards/jwt-auth.guard';
import { RolesGuard } from './authentication/guards/roles.guard';
import { AdminModule } from './admin/admin.module';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri:
          configService.get<string>('MONGO_URI') ||
          'mongodb://localhost:27017/Observer',
      }),
    }),
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get('MAIL_HOST'),
          port: 465,
          secure: true,
          auth: {
            user: configService.get('MAIL_USER'),
            pass: configService.get('MAIL_PASS'),
          },
        },
        defaults: {
          from: `"${configService.get('MAIL_USERNAME')}" <${configService.get('MAIL_FROM')}>`,
        },
        template: {
          dir: process.cwd() + '/src/mail/templates',
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),

    AuthenticationModule,
    UserModule,
    CloudinaryModule,
    InterestModule,
    CityModule,
    EventModule,
    RatingModule,
    CommentModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
