import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(
    process.env.DB_NAME as string,  
    process.env.DB_USER as string,   
    process.env.DB_PASSWORD as string,  
    {
        host: process.env.DB_HOST,     
        dialect: 'postgres',           
        port: Number(process.env.DB_PORT), 
        logging: false,         
        //logging:console.log,      
    }
);


export const connectDB = async (): Promise<void> => {
try {
    await sequelize.authenticate();
} catch (err) {
    console.error('Unable to connect to the database:', err); 
}
};



export default sequelize;