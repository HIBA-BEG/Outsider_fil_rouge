import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { CreateAuthenticationDto } from './dto/create-authentication.dto';
import { LoginAuthenticationDto } from './dto/login-authentication.dto';

describe('AuthenticationController', () => {
  let controller: AuthenticationController;
  let authService: AuthenticationService;

  const mockAuthService = {
    register: jest.fn(),
    verifyEmail: jest.fn(),
    resendVerificationEmail: jest.fn(),
    login: jest.fn(),
    verifyToken: jest.fn(),
    sendPasswordResetEmail: jest.fn(),
    resetPassword: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthenticationController],
      providers: [
        {
          provide: AuthenticationService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthenticationController>(AuthenticationController);
    authService = module.get<AuthenticationService>(AuthenticationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const mockRequest = {
        body: {
          firstName: { value: 'hiba' },
          lastName: { value: 'eytch' },
          email: { value: 'hiba@gmail.com' },
          password: { value: 'hiba123' },
          city: { value: 'rabat' },
          role: { value: 'organizer' },
          interests: {
            value: '["67c0d99afb341de127df228b", "67c0d9d1fb341de127df228d"]',
          },
          file: {
            toBuffer: jest.fn().mockResolvedValue(Buffer.from('mock-file')),
            filename: 'liloandstitch.jpg',
            mimetype: 'image/jpeg',
          },
        },
      };

      const expectedDto: CreateAuthenticationDto = {
        firstName: 'hiba',
        lastName: 'eytch',
        email: 'hiba@gmail.com',
        password: 'hiba123',
        city: 'rabat',
        role: 'organizer',
        interests: ['67c0d99afb341de127df228b', '67c0d9d1fb341de127df228d'],
      };

      mockAuthService.register.mockResolvedValue({ id: 1, ...expectedDto });

      await controller.register(mockRequest as any);

      expect(authService.register).toHaveBeenCalledWith(
        expectedDto,
        expect.objectContaining({
          buffer: expect.any(Buffer),
          originalname: 'liloandstitch.jpg',
          mimetype: 'image/jpeg',
        }),
      );
    });
  });

  describe('verifyEmail', () => {
    it('should verify email successfully', async () => {
      const token = 'valid-token';
      mockAuthService.verifyEmail.mockResolvedValue({
        message: 'Email verified',
      });

      await controller.verifyEmail(token);
      expect(authService.verifyEmail).toHaveBeenCalledWith(token);
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const loginDto: LoginAuthenticationDto = {
        email: 'hiba@gmail.com',
        password: 'hiba123',
      };
      const expectedResponse = { token: 'jwt-token' };

      mockAuthService.login.mockResolvedValue(expectedResponse);

      const result = await controller.login(loginDto);

      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('verifyToken', () => {
    it('should verify token successfully', () => {
      const token = 'Bearer jwt-token';
      const expectedResponse = { valid: true };

      mockAuthService.verifyToken.mockReturnValue(expectedResponse);

      const result = controller.verifyToken(token);

      expect(authService.verifyToken).toHaveBeenCalledWith('jwt-token');
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('forgotPassword', () => {
    it('should handle forgot password request successfully', async () => {
      const email = 'hiba@gmail.com';
      mockAuthService.sendPasswordResetEmail.mockResolvedValue(undefined);

      const result = await controller.forgotPassword({ email });

      expect(authService.sendPasswordResetEmail).toHaveBeenCalledWith(email);
      expect(result).toEqual({
        message: 'Password reset email sent successfully',
      });
    });

    it('should handle forgot password request for non-existent email gracefully', async () => {
      const email = 'holaGracias@gmail.com';
      mockAuthService.sendPasswordResetEmail.mockRejectedValue(new Error());

      const result = await controller.forgotPassword({ email });

      expect(result).toEqual({
        message:
          'If an account exists with this email, a password reset link will be sent',
      });
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      const resetData = {
        token: 'reset-token',
        newPassword: 'eytch123',
      };
      mockAuthService.resetPassword.mockResolvedValue(undefined);

      const result = await controller.resetPassword(resetData);

      expect(authService.resetPassword).toHaveBeenCalledWith(
        resetData.token,
        resetData.newPassword,
      );
      expect(result).toEqual({ message: 'Password reset successfully' });
    });
  });
});
