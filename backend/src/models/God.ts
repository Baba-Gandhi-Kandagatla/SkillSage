import { Model, DataTypes } from 'sequelize';
import sequelize from '../db/connection.js';

export interface IGod {
  id: bigint;
  username: string;
  password: string;
}

class God extends Model<IGod> implements IGod {
  public id!: bigint;
  public username!: string;
  public password!: string;
}

God.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'God',
    tableName: 'god',
  }
);

export default God;
