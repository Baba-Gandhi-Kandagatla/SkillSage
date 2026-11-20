import { Model, DataTypes } from 'sequelize';
import sequelize from '../db/connection.js';
import Interview from './Interview.js';
import Student from './student.js';
import { json } from 'sequelize';

export interface IFeedBack{
  strengths: string,
  weaknesses: string,
  summary: string,
}
export interface IInterviewInstance {
  id: bigint;
  interview_ref: bigint;
  student_roll: string;
  marks: number;
  feedback: IFeedBack;
  violation : number;
  ip: string;
  boolIpChange: boolean;
  status: "submitted"|"not submitted";
}

class InterviewInstance extends Model<IInterviewInstance> implements IInterviewInstance {
  public id!: bigint;
  public interview_ref!: bigint;
  public student_roll!: string;
  public marks!: number;
  public feedback!: IFeedBack;
  public violation!: number;
  public ip!: string;
  public boolIpChange!: boolean;
  public status!: "submitted"|"not submitted";
}

InterviewInstance.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    interview_ref: {
      type: DataTypes.BIGINT,
      allowNull: false,
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    student_roll: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    marks: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: false,
    },
    feedback: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: null,
    },
    violation: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    ip: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '',
    },
    boolIpChange: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    status: {
      type: DataTypes.ENUM('submitted', 'not submitted'),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'InterviewInstance',
    tableName: 'interview_instances',
  }
);


export default InterviewInstance;