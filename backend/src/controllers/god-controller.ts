import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import Admin from "../models/Admin.js";
import College from "../models/College.js";
import { Hashing } from "../utils/hash.js";

export const addCollege = async (req: Request, res: Response) => {
  const { name, defaultPassword } = req.body;
  try {
    const existingCollege = await College.findOne({ where: { name } });
    if (existingCollege) {
      return res.status(409).json({ error: "College already exists." });
    }
    const newCollege = await College.create({
      name,
      defaultPassword,
    });
    res.status(201).json(newCollege);
  } catch (error) {
    res.status(500).json({ error: "Internal server error: " + error.message });
  }
};


export const getColleges = async (req: Request, res: Response) => {
  try {
    const colleges = await College.findAll();
    const allColleges = colleges.map((college) => {
      const { defaultPassword, ...rest } = college.get();
      return rest;
    });
    res.status(200).json(allColleges);
  } catch (error) {
    res.status(500).json({ error: "Internal server error: " + error.message });
  }
};

export const deleteCollege = async (req: Request, res: Response) => {
  const id = req.params.id;
  try {
    const college = await College.findByPk(id);
    if (!college) {
      return res.status(404).json({ error: "College not found." });
    }
    await college.destroy();
    res.status(200).json({ message: "College deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: "Internal server error: " + error.message });
  }
}

export const getCollegeAdmins = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const college = await College.findByPk(id);
    if (!college) {
      return res.status(404).json({ error: "College not found." });
    }
    const admins = await Admin.findAll({ where: { college_id: id } });
    const allAdmins = admins.map((admin) => {
      const { preferences, ...rest } = admin.get();
      return rest;
    });
    res.status(200).json(allAdmins);
  } catch (error) {
    res.status(500).json({ error: "Internal server error: " + error.message });
  }
}

export const addAdmin = async (req: Request, res: Response) => {
  const { rollNumber, name, password, college } = req.body;
  try {
    const existingUser = await Admin.findOne({ where: { roll_number: rollNumber } });
    if (existingUser) {
      return res.status(409).json({ error: "Roll number already exists." });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await Admin.create({
      roll_number: rollNumber,
      username: name,
      password: hashedPassword,
      college_id: college,
    });
    const { password: _, ...userWithoutPassword } = newUser.get();
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: "Internal server error: " + error.message });
  }
};

export const upsertAdmin = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const { rollNumber, name } = req.body;
    const foundCollege = await College.findByPk(id);
    if (!foundCollege) {
      return res.status(404).json({ error: "College not found." });
    }
    const gotCollege = foundCollege.get();
    const admin = await Admin.findOne({
      where: { roll_number: rollNumber, college_id: gotCollege.id }
    });

    if (admin) {
      await Admin.upsert({
        roll_number: rollNumber,
        username: name,
        password: await Hashing(gotCollege.defaultPassword),
        college_id: gotCollege.id,
      })
      return res.status(201).json({ message: "admin updated successfully" });
    } else {
      const hashedPassword = await Hashing(gotCollege.defaultPassword);
      const newAdmin = await Admin.create({
        roll_number: rollNumber,
        username: name,
        password: hashedPassword,
        college_id: gotCollege.id,
      });
      const { password: __, ...userWithoutPassword } = newAdmin.get();
      return res.status(201).json(userWithoutPassword);
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// [
//   {
//       "roll_number": "kmitadmin1",
//       "username": "skillsagekmit admin",
//       "password": "$2b$10$/7VI2d/TPYhYerpK88COBOVHa240Ouz.I2S68WIr9eBBARVoLbGBC",
//       "college_id": "1",
//       "createdAt": "2025-01-04T11:53:39.515Z",
//       "updatedAt": "2025-01-13T06:20:14.483Z"
//   }
// ]

// export interface IAdmin {
  //     roll_number: string;
  //     username: string;
  //     password: string;
  //     college_id: bigint;
  //     preferences: IAdminPreferences;
  // }
