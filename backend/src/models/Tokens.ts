import { Model, DataTypes } from 'sequelize';
import sequelize from '../db/connection.js';

export interface IToken {
    id: bigint;
    inputToken:number;
    outputToken:number;
    totalToken:number;
    cost:number;
    taskName: string;
}

class Token extends Model<IToken> implements IToken {
    public id!: bigint;
    public inputToken!: number;
    public outputToken!: number;
    public totalToken!: number;
    public cost!: number;
    public taskName!: string;
}

Token.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    inputToken: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    outputToken: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    totalToken: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    cost: {
      type:DataTypes.DECIMAL(10, 6),
      allowNull: false,
    },
    taskName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Token',
    tableName: 'token',
  }
);

export default Token;
