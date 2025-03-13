import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import fastifyMultipart from '@fastify/multipart';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  await app.register(fastifyMultipart, {
    limits: {
      fileSize: 10 * 1024 * 1024, 
      files: 10,
      fieldSize: 2 * 1024 * 1024, 
    },
    attachFieldsToBody: true,
  });

  const staticPath = join(process.cwd(), 'uploads-profile');
  console.log('Serving static files from:', staticPath);
  app.useStaticAssets({
    root: staticPath,
    prefix: '/uploads-profile/',
    decorateReply: false
  });
  
  const staticPathEvent = join(process.cwd(), 'uploads-event');
  console.log('Serving static files from:', staticPathEvent);
  app.useStaticAssets({
    root: staticPathEvent,
    prefix: '/uploads-event/',
    decorateReply: false
  });

  const uploadsPath = join(__dirname, '..', 'uploads');
  console.log('Serving static files from:', uploadsPath);
  app.useStaticAssets({
    root: uploadsPath,
    prefix: '/uploads/',
    decorateReply: false
  });

  app.enableCors({
    origin: [
      'http://192.168.8.116:8081',
      'exp://192.168.8.116:8081',
      '0.0.0.0',
    ].filter((url): url is string => !!url),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}

bootstrap();






 





