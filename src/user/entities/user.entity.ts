import {
  Model,
  Column,
  DataType,
  HasMany,
  IsEmail,
  Table,
} from 'sequelize-typescript';
import { Task } from '../../tasks/entities/task.entity';

@Table({
  tableName: 'USER',
})
export class User extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @IsEmail
  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  declare email: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare password: string;
}
