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
      console.log('File received:', body.file);

      if (!body) {
        throw new BadRequestException('No form data received');
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
  @Post('verify-email')
  async verifyEmail(@Body('token') token: string) {
    return this.authenticationService.verifyEmail(token);
  }

  @Public()
  @Post('resend-verification')
  async resendVerificationEmail(@Body('email') email: string) {
    return this.authenticationService.resendVerificationEmail(email);
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

  @Public()
  @Post('forgot-password')
  async forgotPassword(@Body() body: { email: string }) {
    try {
      await this.authenticationService.sendPasswordResetEmail(body.email);
      return { message: 'Password reset email sent successfully' };
    } catch (error) {
      console.log('Error sending password reset email:', error);
      return {
        message:
          'If an account exists with this email, a password reset link will be sent',
      };
    }
  }

  @Public()
  @Post('reset-password')
  async resetPassword(@Body() body: { token: string; newPassword: string }) {
    await this.authenticationService.resetPassword(
      body.token,
      body.newPassword,
    );
    return { message: 'Password reset successfully' };
  }
}
