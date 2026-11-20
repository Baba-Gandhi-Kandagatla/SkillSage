import { Model, DataTypes } from 'sequelize';
import sequelize from '../db/connection.js';
import Admin from './Admin.js';
import Student from './student.js';

export interface IAuditLog {
  id: number;
  roll_number: string;
  ipaddress: string;
  route: string;
  status: string;
  data: object;
  time: Date;
}

class AuditLog extends Model<IAuditLog> implements IAuditLog {
  public id!: number;
  public roll_number!: string;
  public ipaddress!: string;
  public route!: string;
  public status!: string;
  public data!: object;
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
    route: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    data: {
      type: DataTypes.JSONB, // Use JSONB for PostgreSQL or JSON for MySQL
      allowNull: false,
    },
    time: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'AuditLog',
    tableName: 'audit_logs',
  }
);

// Relationships
AuditLog.belongsTo(Student, { foreignKey: 'roll_number', constraints: false });
AuditLog.belongsTo(Admin, { foreignKey: 'roll_number', constraints: false });

export default AuditLog;
