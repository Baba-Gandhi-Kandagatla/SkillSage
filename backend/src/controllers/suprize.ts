import { Request, Response } from "express";
import bcrypt from 'bcryptjs';
import Student from "../models/student.js";
import Admin from "../models/Admin.js";
import { createToken } from "../utils/token-manager.js";
const COOKIE_NAME = process.env.COOKIE_NAME;
const NODE_ENV = process.env.NODE_ENV;

const {compare} = bcrypt;

if (!COOKIE_NAME) {
  throw new Error("COOKIE_NAME environment variable is not defined");
}

const findUserByRollNumber = async (rollNumber: string) => {
  return (
    (await Student.findOne({ where: { roll_number: rollNumber } })) ||
    (await Admin.findOne({ where: { roll_number: rollNumber } }))
  );
};

const clearAndSetCookie = (res: Response, token: string) => {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    domain: "localhost",
    signed: true,
    path: "/",
  });

  const cookieOptions = {
    httpOnly: true,
    signed: true,
    secure: NODE_ENV === "production",
    maxAge: 3600000,
    path: "/",
  };

  res.cookie(COOKIE_NAME, token, cookieOptions);
};

export const login = async (req: Request, res: Response) => {
  const { rollNumber, password } = req.body;
  try {
    const user = await findUserByRollNumber(rollNumber);
    console.log(user);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const userData = user.get();

    // if (user instanceof Student) {
    //   if (password !== userData.password) {
    //     return res.status(401).json({ message: 'Invalid credentials.' });
    //   }
      const isPasswordValid = await compare(password, userData.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials." });
      }
    // } else if (user instanceof Admin) {
    //   const isPasswordValid = await compare(password, userData.password);
    //   if (!isPasswordValid) {
    //     return res.status(401).json({ message: "Invalid credentials." });
    //   }
    // }

    const token = createToken(
      userData.roll_number,
      user instanceof Student ? "student" : "admin",
      "1h"
    );

    clearAndSetCookie(res, token);

    const userInfo = {
      rollNumber: userData.roll_number,
      username: userData.username,
      role: user instanceof Student ? "student" : "admin",
    };
    console.log("Abcd");

    res.status(200).json({ ...userInfo, message: "Login successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const logout = (req: Request, res: Response) => {
  const cookieOptions = {
    httpOnly: true,
    signed: true,
    secure: NODE_ENV === "production",
    path: "/",
  };

  try {
    res.clearCookie(COOKIE_NAME, cookieOptions);
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const verifyUser = async (req: Request, res: Response) => {
  const rollNumber = res.locals.jwtData.rollnumber;

  try {
    const user = await findUserByRollNumber(rollNumber);
    if (!user) {
      return res.status(401).json({ message: "User not found." });
    }
    res
      .status(200)
      .json({
        rollNumber: user.dataValues.roll_number,
        role: user instanceof Student ? "student" : "admin",
        username: user.dataValues.username,
      });
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  const rollNumber = res.locals.jwtData.rollnumber;

  try {
    const user = await findUserByRollNumber(rollNumber);

    if (!user) {
      return res.status(401).json({ message: "User not found." });
    }

    const { password, ...userWithoutPassword } = user.get();

    res.status(200).json({ user: userWithoutPassword });
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
