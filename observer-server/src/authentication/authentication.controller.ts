import {
  Controller,
  Post,
  Body,
  Get,
  Headers,
  BadRequestException,
  Req,
} from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { CreateAuthenticationDto } from './dto/create-authentication.dto';
import { LoginAuthenticationDto } from './dto/login-authentication.dto';
import { FastifyRequest } from 'fastify';
import { FileUpload } from '../types/file-upload.interface';
import { Public } from './decorators/public.decorator';

@Controller('auth')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Public()
  @Post('register')
  async register(@Req() request: FastifyRequest) {
    const data = await request.file();
    // console.log('Received file data:', data);

    if (!data) {
      throw new BadRequestException('No file uploaded');
    }

    const getFieldValue = (field: any): any => {
      if (!field) return '';
      if (Array.isArray(field)) return field.map((f) => f.value);
      return field.value;
    };

    console.log('All form fields:', data.fields);

    console.log('Raw interests field:', data.fields.interests);

    const interestsValue = getFieldValue(data.fields.interests);
    let interests: string[] = [];

    console.log('Interests value after getFieldValue:', interestsValue);

    if (interestsValue) {
      try {
        if (interestsValue.startsWith('[')) {
          interests = JSON.parse(interestsValue);
        } else {
          interests = interestsValue
            .split(',')
            .map((id) => id.trim())
            .filter((id) => id.length > 0);
        }
      } catch (error) {
        console.error('Error parsing interests:', error);
        throw new BadRequestException('Invalid interests format');
      }
    }

    // console.log('Parsed interests:', interests);

    const createAuthenticationDto: CreateAuthenticationDto = {
      firstName: getFieldValue(data.fields.firstName),
      lastName: getFieldValue(data.fields.lastName),
      email: getFieldValue(data.fields.email),
      password: getFieldValue(data.fields.password),
      city: getFieldValue(data.fields.city),
      role: getFieldValue(data.fields.role),
      interests: interests,
    };

    // console.log('Parsed DTO:', createAuthenticationDto);

    const chunks: any[] = [];
    for await (const chunk of data.file) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    const fileUpload: FileUpload = {
      buffer,
      originalname: data.filename,
      mimetype: data.mimetype,
    };

    return await this.authenticationService.register(
      createAuthenticationDto,
      fileUpload,
    );
  }

  @Public()
  @Post('login')
  login(@Body() loginAuthDto: LoginAuthenticationDto) {
    return this.authenticationService.login(loginAuthDto);
  }

  @Public()
  @Get('verify')
  verifyToken(@Headers('authorization') token: string) {
    const tokenValue = token.replace('Bearer ', '');
    return this.authenticationService.verifyToken(tokenValue);
  }

  // @Public()
  // @Post('forgot-password')
  // forgotPassword(@Body() body: { email: string }) {
  //   return this.authenticationService.forgotPassword(body.email);
  // }

  // @Public()
  // @Post('reset-password')
  // resetPassword(@Body() resetPasswordDto: { token: string; password: string }) {
  //   return this.authenticationService.resetPassword(
  //     resetPasswordDto.token,
  //     resetPasswordDto.password,
  //   );
  // }
}
