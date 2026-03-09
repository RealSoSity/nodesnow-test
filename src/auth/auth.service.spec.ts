import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';

const mockUser = {
  id: 'user-uuid-1234',
  email: 'example@gmail.com',
  password: 'userhashedPassword',
  task: [],
};

const mockLoginDto = {
  email: 'example@gmail.com',
  password: 'examplePassword',
};

const mockRegisterDto = {
  email: 'example@gmail.com',
  password: 'examplePassword',
};

const invalidUserDto = {
  email: 'unknown@gmail.com',
  password: 'unknownPassword',
};

const mockUserService = {
  findByEmail: jest.fn(),
  create: jest.fn(),
};

const mockJwtService = {
  verifyAsync: jest.fn(),
  signAsync: jest.fn(),
};

const mockConfigService = {
  get: jest.fn(),
};

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let userService: Record<string, jest.Mock>;
  let jwtService: Record<string, jest.Mock>;
  let configService: Record<string, jest.Mock>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get(UserService);
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('login()', () => {
    it('should return an access token for valid credentials', async () => {
      const expectedToken = 'headers.payload.signature';
      userService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.signAsync.mockResolvedValue(expectedToken);

      const resultToken = await authService.login(mockLoginDto);

      expect(resultToken).toEqual({ access_token: expectedToken });
      expect(userService.findByEmail).toHaveBeenCalledWith(mockLoginDto.email);
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
      });
    });

    it('should throw UnauthorizedException when user not found', async () => {
      userService.findByEmail.mockResolvedValue(null);

      await expect(authService.login(invalidUserDto)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when password is wrong', async () => {
      userService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(authService.login(invalidUserDto)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });
  });

  describe('register()', () => {
    it('should create a user when return user data', async () => {
      const hashedPassword = 'userhashedPassword';
      const saltRounds = 1;
      userService.findByEmail.mockResolvedValue(null);
      configService.get.mockReturnValue(saltRounds);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      userService.create.mockResolvedValue(mockUser);

      const createdUser = await authService.register(mockRegisterDto);

      expect(createdUser).toEqual({ id: mockUser.id, email: mockUser.email });
      expect(bcrypt.hash as jest.Mock).toHaveBeenCalled();
      expect(userService.create).toHaveBeenCalledWith({
        email: mockRegisterDto.email,
        password: hashedPassword,
      });
    });

    it('should throw ConflictException when return existing user', async () => {
      const existingUser = {
        email: mockUser.email,
        password: 'newExamplePassword',
      };
      userService.findByEmail.mockResolvedValue(mockUser);

      await expect(authService.register(existingUser)).rejects.toThrow(
        ConflictException,
      );

      expect(bcrypt.hash as jest.Mock).not.toHaveBeenCalled();
      expect(userService.create).not.toHaveBeenCalled();
    });
  });
});
