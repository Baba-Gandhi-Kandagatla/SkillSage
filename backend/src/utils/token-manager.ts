import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const COOKIE_NAME = process.env.COOKIE_NAME;
export const createToken = (rollnumber: string, role: string, expiresIn: string) => {
  const payload = { rollnumber,role};
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn,
  });
  return token;
};


export const verifyToken = async (
  
  req: Request,
  res: Response,
  next: NextFunction
) => {
    const token = req.signedCookies[process.env.COOKIE_NAME];
  
  if (!token || token.trim() === "") {
    return res.status(401).json({ message: "Token Not Received" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);

    res.locals.jwtData = decoded;

    next();
  } catch (error) {
    console.error("JWT verification error:", error);

    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: "Token Expired" });
    } else if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: "Invalid Token" });
    } else {
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
};


export const verifyTokenStudent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.signedCookies[process.env.COOKIE_NAME];

  if (!token || token.trim() === "") {
    return res.status(401).json({ message: "Token Not Received" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    res.locals.jwtData = decoded;

    if (res.locals.jwtData.role!== 'student') {
      return res.status(403).json({ message: "Access denied. Not a student." });
    }
    next();
  } catch (error) {
    console.error("JWT verification error:", error);

    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: "Token Expired" });
    } else if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: "Invalid Token" });
    } else {
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
};

export const verifyTokenAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.signedCookies[process.env.COOKIE_NAME];

  if (!token || token.trim() === "") {
    return res.status(401).json({ message: "Token Not Received" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);

    res.locals.jwtData = decoded;

    if (res.locals.jwtData.role !== 'admin') {
      return res.status(403).json({ message: "Access denied. Not an Admin." });
    }

    next();
  } catch (error) {
    console.error("JWT verification error:", error);

    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: "Token Expired" });
    } else if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: "Invalid Token" });
    } else {
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
};