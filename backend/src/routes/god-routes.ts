import { Router } from "express";
import {
    addCollege,
    deleteCollege,
    getCollegeAdmins,
    getColleges,
    updateCollege,
    upsertAdmin,
    deleteAdmin,
    godLogin,
    updateAdmin  // <-- import updateAdmin
} from "../controllers/god-controller.js";
const godRouter = Router();

godRouter.post("/godLogin",godLogin);
godRouter.post("/addCollege", addCollege);
godRouter.get("/getAllColleges", getColleges);
godRouter.delete("/deleteCollege/:id", deleteCollege);
godRouter.post("/updateCollege", updateCollege);

godRouter.post("/addAdmin/:id", upsertAdmin);
godRouter.get("/getCollegeAdmins/:id", getCollegeAdmins);
godRouter.delete("/deleteAdmin/:roll_number", deleteAdmin);
godRouter.post("/updateAdmin/:roll_number", updateAdmin);

export default godRouter;
