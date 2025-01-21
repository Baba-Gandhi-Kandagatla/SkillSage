import { Router } from "express";
import { addCollege, addAdmin, getColleges, deleteCollege, getCollegeAdmins, upsertAdmin } from "../controllers/god-controller.js";
const godRouter = Router();

godRouter.post("/addAdmin/:id",upsertAdmin);
godRouter.post("/addCollege", addCollege);
godRouter.get("/getAllColleges", getColleges);
godRouter.delete("/deleteCollege/:id", deleteCollege);
godRouter.get("/getCollegeAdmins/:id", getCollegeAdmins);

export default godRouter;