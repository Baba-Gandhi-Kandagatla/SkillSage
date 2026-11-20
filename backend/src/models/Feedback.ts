import { Model, DataTypes } from 'sequelize';
import sequelize from '../db/connection.js';

export interface IFeedback {
  id: bigint;
  roll_number: string;
  interview_id: bigint;
  feedback_text: string;
}

class Feedback extends Model<IFeedback> implements IFeedback {
  public id!: bigint;
  public roll_number!: string;
  public interview_id!: bigint;
  public feedback_text!: string;
}

Feedback.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    roll_number: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    interview_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    feedback_text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Feedback',
    tableName: 'feedback',
  }
);

export default Feedback;
