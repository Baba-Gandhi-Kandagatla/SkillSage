import { Model, DataTypes } from 'sequelize';
import sequelize from '../db/connection.js';
import College from './College.js';
import bcrypt from 'bcryptjs';


export interface IAdminSubject {
  name: string;
  subtopics: string[];
}




export interface IAdmin {
    roll_number: string;
    username: string;
    password: string;
    college_id: bigint;
    preferences: IAdminPreferences;
}

export interface IAdminPreferences {
  total_questions: number;
  no_of_coding_questions: number;
  default_password: string;
  subjects: IAdminSubject[];
}

class Admin extends Model<IAdmin> implements IAdmin {
  public roll_number!: string;
  public username!: string;
  public password!: string;
  public college_id!: bigint;
  public preferences!: IAdminPreferences;
}

Admin.init(
  {
    roll_number: {
      type: DataTypes.STRING,
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
    college_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
    preferences: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {
        total_questions: 10,
        no_of_coding_questions: 5,
        default_password: 'Kmit@123',
        subjects: [],
      },
    },
  },
  {
    sequelize,
    modelName: 'Admin',
    tableName: 'admin',
    // hooks: {
    //   async beforeCreate(admin: Admin) {
    //     if (admin.password) {
    //       admin.password = await bcrypt.hash(admin.password, 10);
    //     }
    //   },
    //   async beforeUpdate(admin: Admin) {
    //     if (admin.password && admin.changed('password')) {
    //       admin.password = await bcrypt.hash(admin.password, 10);
    //     }
    //   },
    // },
  }
);
Admin.belongsTo(College, { foreignKey: 'college_id' });


export default Admin;
