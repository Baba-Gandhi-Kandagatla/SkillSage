import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();


let sequelize: Sequelize;
if(process.env.DATABASE_ONLINE !== 'true') {
    sequelize = new Sequelize(
        process.env.DB_NAME as string,  
        process.env.DB_USER as string,   
        process.env.DB_PASSWORD as string,  
        {
            host: process.env.DB_HOST,     
            dialect: 'postgres',           
            port: Number(process.env.DB_PORT), 
            logging: false,         
            //logging:console.log,  
            pool: {
                max: 20,            // Maximum number of connections in pool
                min: 5,             // Minimum number of connections in pool
                acquire: 30000,     // Time in ms that pool will try to get connection before throwing error
                idle: 10000         // Time in ms that connection can be idle before being released
            }    
        }
    );
}
else{
    // sequelize = new Sequelize(
    //     process.env.DATABASE_URL as string, 
    //     {
    //         dialect: 'postgres',
    //         dialectOptions: {
    //             ssl: {
    //                 require: true,  
    //                 rejectUnauthorized: false,
    //             },
    //         },
    //         logging: false,
    //     }
    // );
    sequelize = new Sequelize(
        process.env.PGDATABASE as string,
        process.env.PGUSER as string,
        process.env.PGPASSWORD as string,
        {
            host: process.env.PGHOST,
            dialect: 'postgres',
            dialectOptions: {
                ssl: {
                    require: true,  
                    rejectUnauthorized: false,
                },
            },
            logging: false,
            pool: {
                max: 20,            // Maximum number of connections in pool
                min: 5,             // Minimum number of connections in pool
                acquire: 30000,     // Time in ms that pool will try to get connection before throwing error
                idle: 10000         // Time in ms that connection can be idle before being released
            }   
        }
    );
}
export const connectDB = async (): Promise<void> => {
try {
    await sequelize.authenticate();
} catch (err) {
    console.error('Unable to connect to the database:', err); 
}
};



export default sequelize;