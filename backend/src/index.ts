import app from "./app.js";
import { connectDB } from './db/connection.js';
import Interview from './models/Interview.js';
import InterviewInstance from './models/Interview_ins.js';
import sequelize from './db/connection.js';
import setupAssociations from "./models/associations.js";


const PORT = process.env.PORT || 5000;
try {
  await connectDB().then(() => console.log("Connected to the database successfully."));

  console.log("Syncing models...");

  setupAssociations();
  await sequelize.sync({ alter: true })
      .then(() => console.log('Database synced'))
      .catch((err) => console.error('Error syncing database:', err));

  console.log("Models synced successfully.");
  
  app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });
} catch (err) {
  console.error("Error during startup:", err);
  process.exit(1);
}