import { Model, DataTypes } from 'sequelize';
import sequelize from '../db/connection.js';

export interface IDepartment {
  id: bigint;
  name: string;
  college_id: bigint;
}

class Department extends Model<IDepartment> implements IDepartment {
  public id!: bigint;
  public name!: string;
  public college_id!: bigint;
}

Department.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    college_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    }
  },
  {
    sequelize,
    modelName: 'Department',
    tableName: 'department',
  }
);

export default Department;
