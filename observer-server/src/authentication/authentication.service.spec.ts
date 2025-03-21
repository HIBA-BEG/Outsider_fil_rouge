import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationService } from './authentication.service';
import { getModelToken } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import { InterestService } from '../interest/interest.service';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { User } from '../user/entities/user.entity';
import * as bcrypt from 'bcryptjs';
import { Types } from 'mongoose';

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}));

describe('AuthenticationService - Login', () => {
  let service: AuthenticationService;
  let userModel: any;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthenticationService,
        {
          provide: getModelToken(User.name),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('jwt_token'),
          },
        },
        {
          provide: MailerService,
          useValue: {
            sendMail: jest.fn(),
          },
        },
        {
          provide: InterestService,
          useValue: {},
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthenticationService>(AuthenticationService);
    userModel = module.get(getModelToken(User.name));
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should throw UnauthorizedException when user is not found', async () => {
      const loginDto = { email: 'hiba@gmail.com', password: 'hiba123' };
      userModel.findOne.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(userModel.findOne).toHaveBeenCalledWith({ email: loginDto.email });
    });

    it('should throw UnauthorizedException when user is not verified', async () => {
      const loginDto = { email: 'hiba@gmail.com', password: 'hiba123' };
      const user = {
        _id: new Types.ObjectId().toString(),
        email: loginDto.email,
        password: 'hashed_password',
        isVerified: false,
        isBanned: false,
      };

      userModel.findOne.mockResolvedValue(user);

      await expect(service.login(loginDto)).rejects.toThrow(
        new UnauthorizedException('Please verify your email before logging in'),
      );
    });

    it('should throw UnauthorizedException when user is banned', async () => {
      const loginDto = { email: 'hiba@gmail.com', password: 'hiba123' };
      const user = {
        _id: new Types.ObjectId().toString(),
        email: loginDto.email,
        password: 'hashed_password',
        isVerified: true,
        isBanned: true,
      };

      userModel.findOne.mockResolvedValue(user);

      await expect(service.login(loginDto)).rejects.toThrow(
        new UnauthorizedException(
          'Your account has been banned. Please contact support for more information.',
        ),
      );
    });

    it('should return a token when login is successful', async () => {
      const loginDto = { email: 'hiba@gmail.com', password: 'hiba123' };
      const user = {
        _id: new Types.ObjectId().toString(),
        email: loginDto.email,
        password: 'hashed_password',
        isVerified: true,
        isBanned: false,
        role: 'user',
      };
      const token = 'jwt_token';

      userModel.findOne.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwtService.sign as jest.Mock).mockReturnValue(token);

      const result = await service.login(loginDto);

      expect(result).toEqual({ token });
      expect(userModel.findOne).toHaveBeenCalledWith({ email: loginDto.email });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginDto.password,
        user.password,
      );
      expect(jwtService.sign).toHaveBeenCalledWith({
        id: user._id,
        email: user.email,
        role: user.role,
        isBanned: user.isBanned,
      });
    });

    it('should propagate errors from database operations', async () => {
      const loginDto = { email: 'hiba@gmail.com', password: 'hiba123' };
      const dbError = new Error('Database connection error');

      userModel.findOne.mockRejectedValue(dbError);

      await expect(service.login(loginDto)).rejects.toThrow(dbError);
    });

    it('should handle bcrypt comparison errors', async () => {
      const loginDto = { email: 'hiba@gmail.com', password: 'hiba123' };
      const user = {
        _id: new Types.ObjectId().toString(),
        email: loginDto.email,
        password: 'hashed_password',
        isVerified: true,
        isBanned: false,
      };
      (bcrypt.compare as jest.Mock).mockRejectedValue(
        new Error('Bcrypt error'),
      );

      userModel.findOne.mockResolvedValue(user);

      await expect(service.login(loginDto)).rejects.toThrow(
        new Error('Bcrypt error'),
      );
    });
  });
});
