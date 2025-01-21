import { Model, DataTypes } from 'sequelize';
import sequelize from '../db/connection.js';
import InterviewExchange from './InterviewExchanges.js';
import InterviewToDepartment from './InterviewToDepartments.js';
import Department from './Department.js';

export interface IInterview {
  id: bigint;
  name: string;
  collage_id: bigint;
  subject: string;
  topic: string;
  no_of_questions: number;
  no_of_coding_questions: number;
  status: 'scheduled' | 'paused' | 'active';
}

class Interview extends Model<IInterview> implements IInterview {
  public id!: bigint;
  public name!: string;
  public collage_id!: bigint;
  public subject!: string;
  public topic!: string;
  public no_of_questions!: number;
  public no_of_coding_questions: number;
  public status!: 'scheduled' | 'paused' | 'active';
}

Interview.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    collage_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    subject: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    topic: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    no_of_questions: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 2
    },
    no_of_coding_questions: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 2
    },
    status: {
      type: DataTypes.ENUM('scheduled', 'paused', 'active'),
      allowNull: false,
      defaultValue: 'scheduled',
    },
  },
  {
    sequelize,
    modelName: 'Interview',
    tableName: 'interview',
  }
);

Interview.hasMany(InterviewExchange, { foreignKey: 'interview_id' });
Interview.hasMany(InterviewToDepartment, { foreignKey: 'interview_id' });

Interview.belongsToMany(Department, {
  through: InterviewToDepartment,
  foreignKey: 'interview_id',
  otherKey: 'department_id',
  as: 'departments'
});

Department.belongsToMany(Interview, {
  through: InterviewToDepartment,
  foreignKey: 'department_id',
  otherKey: 'interview_id'
});

export default Interview;

