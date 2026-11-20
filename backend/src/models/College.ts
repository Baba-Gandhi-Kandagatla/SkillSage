import { Model, DataTypes } from 'sequelize';
import sequelize from '../db/connection.js';

export interface ICollege {
  id: bigint;
  name: string;
  defaultPassword: string;
}

class College extends Model<ICollege> implements ICollege {
  public id!: bigint;
  public name!: string;
  public defaultPassword!: string;
}

College.init(
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
    defaultPassword: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'College',
    tableName: 'college',
  }
);

export default College;
