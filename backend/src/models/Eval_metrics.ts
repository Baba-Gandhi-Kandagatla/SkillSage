import { Model, DataTypes } from 'sequelize';
import sequelize from '../db/connection.js';
import Student from './student.js';

export interface IEvalMetrics {
  id: bigint;
  problem_solving: number;
  code_quality: number;
  debugging: number;
  roll_number: string;
  count: number;
}

class EvalMetrics extends Model<IEvalMetrics> implements IEvalMetrics {
  public id!: bigint;
  public problem_solving!: number;
  public code_quality!: number;
  public debugging!: number;
  public roll_number!: string;
  public count!: number;
}

EvalMetrics.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    problem_solving: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    code_quality: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    debugging: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    roll_number: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    count: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'EvalMetrics',
    tableName: 'eval_metrics',
  }
);

export default EvalMetrics;
