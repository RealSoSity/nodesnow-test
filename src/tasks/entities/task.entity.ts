import {
  Model,
  Column,
  DataType,
  ForeignKey,
  Table,
} from 'sequelize-typescript';
import { User } from '../../user/entities/user.entity';
import { TaskStatus } from '../enums/task-status.enum';

@Table({
  tableName: 'TASK',
})
export class Task extends Model {
  @Column({
    primaryKey: true,
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  declare id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare title: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare description: string;

  @Column({
    type: DataType.ENUM(...Object.values(TaskStatus)),
    defaultValue: TaskStatus.PENDING,
  })
  declare status: TaskStatus;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare userId: string;
}
