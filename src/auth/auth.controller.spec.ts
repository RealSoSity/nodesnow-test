import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth/auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';

const mockAuthService = {
  login: jest.fn(),
  register: jest.fn(),
};

describe('AuthController', () => {
  let authController: AuthController;
  let authService: Record<string, jest.Mock>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      email: 'user@example.com',
      password: 'UserPassword',
    };
    it('should register a new user and return the result', async () => {
      const expectUser = {
        id: 'user-uuid-123',
        email: 'user@example.com',
      };

      authService.register.mockResolvedValue(expectUser);

      const result = await authController.register(registerDto);

      expect(result).toEqual(expectUser);
      expect(authService.register).toHaveBeenCalledWith(registerDto);
    });

    it('should throw ConflictException if email already exists', async () => {
      authService.register.mockRejectedValue(
        new ConflictException('User already exist'),
      );

      await expect(authController.register(registerDto)).rejects.toThrow(
        ConflictException,
      );

      expect(authService.register).toHaveBeenCalledWith(registerDto);
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'user@example.com',
      password: 'UserPassword',
    };
    it('should login and return an access token', async () => {
      const expectedResult = { access_token: 'jwt-token' };

      authService.login.mockResolvedValue(expectedResult);

      const result = await authController.login(loginDto);

      expect(result).toEqual(expectedResult);
      expect(result.access_token).toBeDefined();
      expect(authService.login).toHaveBeenCalledWith(loginDto);
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      authService.login.mockRejectedValue(
        new UnauthorizedException('Invalid credentials'),
      );

      await expect(authController.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(authService.login).toHaveBeenCalledWith(loginDto);
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      const invalidLoginDto: LoginDto = {
        email: 'nobody@example.com',
        password: 'BadPassword',
      };

      authService.login.mockRejectedValue(
        new UnauthorizedException('User not found'),
      );

      await expect(authController.login(invalidLoginDto)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(authService.login).toHaveBeenCalledWith(invalidLoginDto);
    });
  });
});
