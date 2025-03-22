import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../user/entities/user.entity';
import * as bcrypt from 'bcryptjs';
import { MailerService } from '@nestjs-modules/mailer';
import { LoginAuthenticationDto } from './dto/login-authentication.dto';
import { join, extname } from 'path';
import { mkdir, writeFile } from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import { FileUpload } from '../types/file-upload.interface';
import { CreateAuthenticationDto } from './dto/create-authentication.dto';
import { InterestService } from '../interest/interest.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthenticationService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private configService: ConfigService,
    private jwtService: JwtService,
    private mailerService: MailerService,
    private interestService: InterestService,
  ) {}

  async register(
    createAuthDto: CreateAuthenticationDto,
    file: FileUpload,
  ): Promise<{ message: string }> {
    try {
      let imageUrl: string | null = null;

      if (file && file.buffer && file.buffer.length > 0) {
        imageUrl = await this.uploadUserImage(file);
      }

      const existingUser = await this.userModel.findOne({
        email: createAuthDto.email,
      });

      if (existingUser) {
        throw new BadRequestException('User with this email already exists');
      }

      console.log('Received interests:', createAuthDto.interests);

      const interests = await Promise.all(
        createAuthDto.interests.map(async (interestId) => {
          try {
            const interest = await this.interestService.findOne(interestId);
            if (!interest) {
              throw new BadRequestException(`Interest ${interestId} not found`);
            }
            return interest._id.toString();
          } catch (error) {
            console.error('Error validating interest:', error);
            throw new BadRequestException(`Invalid interest ID: ${interestId}`);
          }
        }),
      );

      console.log('Validated interests:', interests);
      console.log('Profile picture URL:', imageUrl);

      const hashedPassword = await bcrypt.hash(createAuthDto.password, 10);

      const user = await this.userModel.create({
        ...createAuthDto,
        password: hashedPassword,
        profilePicture: imageUrl,
        interests: interests,
        isVerified: false,
      });

      await this.sendVerificationEmail(user);

      return {
        message:
          'Registration successful. Please check your email to verify your account.',
      };
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  }

  async verifyEmail(token: string) {
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_SECRET'),
      });

      if (payload.type !== 'email_verification') {
        throw new UnauthorizedException('Invalid verification token');
      }

      const user = await this.userModel.findOne({ email: payload.email });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (user.isVerified) {
        return { message: 'Email already verified' };
      }

      await this.userModel.updateOne({ _id: user._id }, { isVerified: true });

      return { message: 'Email verified successfully' };
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Verification token expired');
      } else if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid verification token');
      } else if (
        error instanceof UnauthorizedException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Email verification failed');
    }
  }

  async sendVerificationEmail(user: User) {
    const verificationToken = this.jwtService.sign(
      { email: user.email, type: 'email_verification' },
      { expiresIn: '24h' },
    );

    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Verify Your Email Address',
      template: 'email-verification',
      context: {
        name: user.firstName,
        token: verificationToken,
        from: process.env.MAIL_FROM,
      },
    });
  }

  async resendVerificationEmail(email: string) {
    try {
      const user = await this.userModel.findOne({ email });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (user.isVerified) {
        throw new BadRequestException('Email already verified');
      }

      await this.sendVerificationEmail(user);
      return { message: 'Verification email sent successfully' };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to resend verification email',
      );
    }
  }

  async uploadUserImage(file: FileUpload): Promise<string> {
    try {
      const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new BadRequestException(
          'Invalid file type. Only JPEG, PNG, and GIF are allowed.',
        );
      }

      const uploadDir = join(process.cwd(), 'uploads-profile');
      try {
        await mkdir(uploadDir, { recursive: true });
      } catch (err) {
        if (err.code !== 'EEXIST') throw err;
      }

      const fileExt = extname(file.originalname || '.jpg');
      const fileName = `${uuidv4()}${fileExt}`;
      const filePath = join(uploadDir, fileName);

      await writeFile(filePath, file.buffer);
      console.log('Service: File written successfully:', filePath);
      return `/uploads-profile/${fileName}`;
    } catch (error) {
      throw new Error(`Failed to upload image: ${error.message}`);
    }
  }

  async login(
    loginAuthDto: LoginAuthenticationDto,
  ): Promise<{ token: string }> {
    try {
      const user = await this.userModel.findOne({ email: loginAuthDto.email });
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      if (!user.isVerified) {
        throw new UnauthorizedException(
          'Please verify your email before logging in',
        );
      }

      if (user.isBanned) {
        throw new UnauthorizedException(
          'Your account has been banned. Please contact support for more information.',
        );
      }

      const isPasswordValid = await bcrypt.compare(
        loginAuthDto.password,
        user.password,
      );
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const payload = {
        id: user._id,
        email: user.email,
        role: user.role,
        isBanned: user.isBanned,
      };

      // console.log('Login payload:', payload);

      const token = this.jwtService.sign(payload);

      return { token };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.isBanned) {
      throw new ForbiddenException(
        'Your account has been banned. Please contact support for assistance.',
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async verifyToken(token: string) {
    try {
      const decoded = this.jwtService.verify(token);
      const user = await this.userModel
        .findOne({ email: decoded.email })
        .select('-password');

      if (!user) throw new UnauthorizedException('User not found');

      return {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      };
    } catch (error) {
      console.error('Verify token error:', error);
      throw error;
    }
  }

  async sendPasswordResetEmail(email: string): Promise<void> {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const resetToken = this.jwtService.sign(
      { email: user.email, type: 'password_reset' },
      { expiresIn: '1h' },
    );

    await this.mailerService.sendMail({
      to: user.email,
      from: process.env.MAIL_FROM,
      subject: 'Password Reset Request',
      template: 'password-reset',
      context: {
        name: user.firstName,
        token: resetToken,
        from: process.env.MAIL_FROM,
      },
    });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      const decoded = this.jwtService.verify(token);
      if (decoded.type !== 'password_reset') {
        throw new UnauthorizedException('Invalid reset token');
      }

      const user = await this.userModel.findOne({ email: decoded.email });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedException('Reset token has expired');
      }
      throw error;
    }
  }
}
