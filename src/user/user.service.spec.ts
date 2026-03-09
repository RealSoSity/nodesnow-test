import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getModelToken } from '@nestjs/sequelize';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';

const mockExpectUser = {
  id: 'user-uuid-123',
  email: 'user@example.com',
  password: 'hashedUserPassword',
};

const mockCreateUserDto: CreateUserDto = {
  email: 'user@example.com',
  password: 'hashedUserPassword',
};

const mockUserId = 'user-uuid-123';

describe('UserService', () => {
  let userService: UserService;
  const userModel = {
    findOne: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken(User),
          useValue: userModel,
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  it('should return a new user when provided data is valid', async () => {
    userModel.findOne.mockResolvedValue(null);
    userModel.create.mockResolvedValue(mockExpectUser);

    const result = await userService.create(mockCreateUserDto);

    expect(result).toEqual(mockExpectUser);
    expect(userModel.findOne).toHaveBeenCalledWith({
      where: { email: mockCreateUserDto.email },
    });

    expect(userModel.create).toHaveBeenCalledWith({ ...mockCreateUserDto });
  });

  it('should throw ConflictException when user email already exist', async () => {
    userModel.findOne.mockResolvedValue(mockExpectUser);

    await expect(userService.create(mockCreateUserDto)).rejects.toThrow(
      ConflictException,
    );

    expect(userModel.create).not.toHaveBeenCalled();
  });

  it('should return a user when matching ID is exists', async () => {
    userModel.findOne.mockResolvedValue(mockExpectUser);

    const result = await userService.findOne(mockUserId);

    expect(result).toEqual(mockExpectUser);
    expect(userModel.findOne).toHaveBeenCalledWith({
      where: { id: mockUserId },
    });
  });

  it('should throw NotFoundException when user does not exist', async () => {
    const mockInvalidUserId = 'invalid-uuid-1234';
    userModel.findOne.mockResolvedValue(null);

    await expect(userService.findOne(mockInvalidUserId)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should return user without Password when a matching ID is exists', async () => {
    const expectUserWithoutPass = {
      id: mockExpectUser.id,
      email: mockExpectUser.email,
    };
    userModel.findOne.mockResolvedValue(mockExpectUser);

    const result = await userService.findOneWithoutPassword(mockUserId);

    expect(result).toEqual(expectUserWithoutPass);
    expect(userModel.findOne).toHaveBeenCalledWith({
      where: { id: mockUserId },
    });
  });

  it('should return the updated user record with the new values', async () => {
    const mockOriginalUser = {
      id: 'user-uuid-123',
      email: 'user@example.com',
      password: 'hashedPassword',
      update: jest.fn(),
    };

    const mockUpdatedUser = {
      id: 'user-uuid-123',
      email: 'user@example.com',
      password: 'newHashedPassword',
    };

    const mockUpdatedUserDto: UpdateUserDto = {
      password: 'NewHashedPassword',
    };
    userModel.findOne.mockResolvedValue(mockOriginalUser);
    mockOriginalUser.update.mockResolvedValue(mockUpdatedUser);

    const result = await userService.update(mockUserId, mockUpdatedUserDto);

    expect(result).toEqual(mockUpdatedUser);
    expect(mockOriginalUser.update).toHaveBeenCalledWith(mockUpdatedUserDto);
  });

  it('should remove the user when matching ID is exist', async () => {
    const mockRemoveUser = {
      id: 'user-uuid-123',
      email: 'user@example.com',
      password: 'hashedPassword',
      destroy: jest.fn(),
    };

    userModel.findOne.mockResolvedValue(mockRemoveUser);
    mockRemoveUser.destroy.mockResolvedValue(undefined);

    const result = await userService.remove(mockUserId);

    expect(result).toBe(undefined);
  });
});
