import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
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

@Injectable()
export class AuthenticationService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private mailerService: MailerService,
    private interestService: InterestService,
  ) {}

  async register(
    createAuthDto: CreateAuthenticationDto,
    file: FileUpload,
  ): Promise<{ token: string }> {
    try {
      if (!file.buffer || file.buffer.length === 0) {
        throw new Error('Invalid file buffer');
      }

      const imageUrl = await this.uploadUserImage(file);

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

      const hashedPassword = await bcrypt.hash(createAuthDto.password, 10);

      const user = await this.userModel.create({
        ...createAuthDto,
        password: hashedPassword,
        profilePicture: imageUrl,
        interests: interests,
      });

      const token = this.jwtService.sign({
        id: user._id,
        email: user.email,
        role: user.role,
      });

      return { token };
    } catch (error) {
      console.error('Register error:', error);
      throw error;
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
      const serverUrl = process.env.SERVER_URL || 'http://localhost:3000';
      return `${serverUrl}/uploads-profile/${fileName}`;
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

  // async forgotPassword(email: string): Promise<{ email: string }> {
  //   try {
  //     console.log('Starting password reset process for:', email);

  //     const user = await this.userModel.findOne({ email });
  //     if (!user) {
  //       throw new UnauthorizedException('User with this email does not exist');
  //     }

  //     console.log('User found:', user.email);

  //     const resetToken = this.jwtService.sign(
  //       { id: user._id, email: user.email },
  //       { secret: process.env.JWT_SECRET, expiresIn: '1h' },
  //     );

  //     const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
  //     console.log('Reset link generated:', resetLink);

  //     const mailConfig = {
  //       host: process.env.MAIL_HOST,
  //       port: process.env.MAIL_PORT,
  //       user: process.env.MAIL_USER,
  //       hasPassword: !!process.env.MAIL_PASS,
  //     };
  //     console.log('Mail configuration:', mailConfig);

  //     try {
  //       console.log('Attempting to send email...');

  //       const mailResult = await this.mailerService.sendMail({
  //         to: user.email,
  //         subject: 'Password Reset Request',
  //         html: `
  //         <h3>Password Reset Request</h3>
  //         <p>You requested to reset your password.</p>
  //         <p>Please click the link below to reset your password:</p>
  //         <a href="${resetLink}">Reset Password</a>
  //         <p>This link will expire in 1 hour.</p>
  //         <p>If you didn't request a password reset, please ignore this email.</p>
  //       `,
  //       });
  //       console.log('Email sent successfully:', mailResult);

  //     } catch (emailError) {
  //       console.error('Email sending error:', emailError);
  //       throw new Error('Failed to send reset email. Please try again later.');
  //     }

  //     return { email: user.email };
  //   } catch (error) {
  //     console.error('Forgot password error:', error);
  //     throw error;
  //   }
  // }

  // async resetPassword(
  //   resetToken: string,
  //   newPassword: string,
  // ): Promise<{ message: string }> {
  //   try {
  //     const decoded = this.jwtService.verify(resetToken, {
  //       secret: process.env.JWT_SECRET,
  //     });
  //     const user = await this.userModel.findById(decoded.id);

  //     if (!user) {
  //       throw new UnauthorizedException('User not found');
  //     }

  //     const saltRounds = 10;
  //     user.password = await bcrypt.hash(newPassword, saltRounds);
  //     await user.save();

  //     return { message: 'Password has been successfully reset' };
  //   } catch (error) {
  //     console.error('Reset password error:', error);
  //     throw error;
  //   }
  // }
}
