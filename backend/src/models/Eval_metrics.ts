import { Model, DataTypes } from 'sequelize';
import sequelize from '../db/connection.js';

export interface IEvalMetrics {
  id: bigint;
  problem_solving: number;
  code_quality: number;
  debugging: number;
  roll_number: string;
  count: number;
  skills: {
    skill: string;
    percent: number;
    value: number;
  }[];
}

class EvalMetrics extends Model<IEvalMetrics> implements IEvalMetrics {
  public id!: bigint;
  public problem_solving!: number;
  public code_quality!: number;
  public debugging!: number;
  public roll_number!: string;
  public count!: number;
  public skills!: { skill: string; percent: number; value: number }[];
}

EvalMetrics.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    problem_solving: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    code_quality: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    debugging: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    roll_number: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    count: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    skills: {
      type: DataTypes.JSON, // Stores an array of objects
      allowNull: false,
      defaultValue: [],
    },
  },
  {
    sequelize,
    modelName: 'EvalMetrics',
    tableName: 'eval_metrics',
  }
);

export default EvalMetrics;
