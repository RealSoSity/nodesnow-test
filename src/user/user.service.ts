import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { InjectModel } from '@nestjs/sequelize';

@Injectable()
export class UserService {
  constructor(@InjectModel(User) private userModel: typeof User) {}

  async create(createUserDto: CreateUserDto) {
    const user = await this.findByEmail(createUserDto.email);

    if (user) {
      throw new ConflictException('Email already exist.');
    }

    const newUser = await this.userModel.create({ ...createUserDto });
    return newUser;
  }

  async findOne(id: string) {
    const user = await this.userModel.findOne({ where: { id: id } });
    if (!user) {
      throw new NotFoundException('User is not found.');
    }
    return user;
  }

  async findByEmail(email: string) {
    const user = await this.userModel.findOne({ where: { email: email } });
    return user;
  }

  async findOneWithoutPassword(id: string) {
    const user = await this.findOne(id);
    return { id: user.id, email: user.email };
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);
    const updatedUser = user.update(updateUserDto);
    return updatedUser;
  }

  async remove(id: string) {
    const user = await this.findOne(id);
    return user.destroy();
  }
}
