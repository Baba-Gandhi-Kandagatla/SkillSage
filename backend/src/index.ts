import app from "./app.js";
import sequelize, { connectDB } from './db/connection.js';
import setupAssociations from "./models/associations.js";

const PORT = Number(process.env.PORT) || 5000;
// const HOST = '23.23.1.0';

try {
  await connectDB().then(() => console.log("Connected to the database successfully."));

  console.log("Syncing models...");

  setupAssociations();
  await sequelize.sync({ alter: true })
      .then(() => console.log('Database synced'))
      .catch((err) => console.error('Error syncing database:', err));

  console.log("Models synced successfully.");
  
  app.listen(PORT,'0.0.0.0', () => {
    console.log(`Server started on ${PORT}`);
  });
} catch (err) {
  console.error("Error during startup:", err);
  process.exit(1);
}