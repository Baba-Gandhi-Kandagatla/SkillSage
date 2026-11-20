import { Model, DataTypes } from 'sequelize';
import sequelize from '../db/connection.js';
import Interview from './Interview.js';
import Department from './Department.js';

export interface IInterviewToDepartment {
  id: bigint;
  interview_id: bigint;
  department_id: bigint;
}

class InterviewToDepartment extends Model<IInterviewToDepartment> implements IInterviewToDepartment {
  public id!: bigint;
  public interview_id!: bigint;
  public department_id!: bigint;
}

InterviewToDepartment.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    interview_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    department_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'InterviewToDepartment',
    tableName: 'interviewToDepartments',
  }
);


export default InterviewToDepartment;
