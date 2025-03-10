import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import fastifyMultipart from '@fastify/multipart';
import { join } from 'path';
import fastifyStatic from '@fastify/static';
import { FastifyInstance } from 'fastify';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  const fastifyInstance: FastifyInstance = app.getHttpAdapter().getInstance();

  await fastifyInstance.register(fastifyMultipart, {
    limits: {
      fileSize: 10 * 1024 * 1024,
      files: 10,
      fieldSize: 2 * 1024 * 1024
    },
    attachFieldsToBody: true
  });

  await app.register(fastifyStatic as any, {
    root: join(__dirname, '..', 'uploads'),
    prefix: '/uploads/',
    decorateReply: false,
  });

  await app.register(fastifyStatic as any, {
    root: join(__dirname, '..', 'uploads-profile'),
    prefix: '/uploads-profile/',
    decorateReply: false,
  });

  await app.register(fastifyStatic, {
    root: join(__dirname, '..', 'uploads-event'),
    prefix: '/uploads-event/',
    decorateReply: false,
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

  // await app.listen(process.env.PORT ?? 3000);
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
