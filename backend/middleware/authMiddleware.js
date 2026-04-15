import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // 1. check token format
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized" });
    }

    // 2. extract token
    const token = authHeader.split(" ")[1];

    // 3. verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. get user WITHOUT password
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    // 5. attach user
    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorized" });
  }
};