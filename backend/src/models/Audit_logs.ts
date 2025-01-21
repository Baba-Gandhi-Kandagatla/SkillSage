import { Model, DataTypes } from 'sequelize';
import sequelize from '../db/connection.js';
import Admin from './Admin.js';
import Student from './student.js';

export interface IAuditLog {
  id: bigint;
  roll_number: string;
  ipaddress: string;
  event: string;
  message: string;
  useragent: string;
  time: Date;
}

class AuditLog extends Model<IAuditLog> implements IAuditLog {
  public id!: bigint;
  public roll_number!: string;
  public ipaddress!: string;
  public event!: string;
  public message!: string;
  public useragent!: string;
  public time!: Date;
}

AuditLog.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    roll_number: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ipaddress: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    event: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    useragent: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    time: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'AuditLog',
    tableName: 'audit_logs',
  }
);


AuditLog.belongsTo(Student, { foreignKey: 'roll_number' });
AuditLog.belongsTo(Admin, { foreignKey: 'roll_number' });

export default AuditLog;
