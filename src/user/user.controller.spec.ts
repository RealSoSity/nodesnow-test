import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { JwtService } from '@nestjs/jwt';

const mockUserService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  findByEmail: jest.fn(),
  findOneWithoutPassword: jest.fn(),
};

const mockJwtService = {
  verifyAsync: jest.fn(),
};

const mockExpectUser = {
  id: 'user-uuid-123',
  email: 'user@example.com',
};

const mockRequest = {
  user: {
    sub: 'user-uuid-123',
  },
};

describe('UserController', () => {
  let userController: UserController;
  let userService: Record<string, jest.Mock>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        { provide: UserService, useValue: mockUserService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    userController = module.get<UserController>(UserController);
    userService = module.get(UserService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(userController).toBeDefined();
  });

  it('should return 200 OK and the user data for an authenticated request', async () => {
    userService.findOneWithoutPassword.mockResolvedValue(mockExpectUser);

    const result = await userController.findOne(mockRequest);

    expect(result).toEqual(mockExpectUser);
  });
});
