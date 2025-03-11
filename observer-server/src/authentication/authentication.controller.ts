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
    try {
      const body = request.body as any;

      console.log('Request body:', body);

      if (!body || !body.file) {
        throw new BadRequestException('No form data or file received');
      }

      const createAuthenticationDto: CreateAuthenticationDto = {
        firstName: body.firstName?.value || '',
        lastName: body.lastName?.value || '',
        email: body.email?.value || '',
        password: body.password?.value || '',
        city: body.city?.value || '',
        role: body.role?.value || '',
        interests: [],
      };

      if (body.interests?.value) {
        try {
          createAuthenticationDto.interests = JSON.parse(body.interests.value);
        } catch (error) {
          console.error('Error parsing interests:', error);
          throw new BadRequestException('Invalid interests format');
        }
      }

      const fileData = body.file;
      const fileUpload: FileUpload = {
        buffer: await fileData.toBuffer(),
        originalname: fileData.filename,
        mimetype: fileData.mimetype,
      };

      return await this.authenticationService.register(
        createAuthenticationDto,
        fileUpload,
      );
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
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
