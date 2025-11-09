import jwt from "jsonwebtoken";

export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Authorization header missing" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded; // ✅ attach vendor info
    next();
  } catch (err) {
    console.error("❌ Token verification failed:", err.message);
    res.status(403).json({ error: "Invalid or expired token" });
  }
};
