import { Model, DataTypes } from 'sequelize';
import sequelize from '../db/connection.js';
import Student from './student.js';

export interface IResume {
  id: bigint;
  resume_loc: string;
  resume_context: string;
  roll_number: string;
}

class Resume extends Model<IResume> implements IResume {
  public id!: bigint;
  public resume_loc!: string;
  public resume_context!: string;
  public roll_number!: string;
}

Resume.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    resume_loc: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    resume_context: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: ''
    },
    roll_number: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Resume',
    tableName: 'resume',
  }
);

Resume.belongsTo(Student, { foreignKey: 'roll_number' });

export default Resume;
