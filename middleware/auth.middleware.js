// middleware/auth.middleware.js
import jwt from "jsonwebtoken";

export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ attach vendorId and role
    req.user = {
      vendorId: decoded.vendorId || decoded.id, // support both
      role: decoded.role,
    };

    if (!req.user.vendorId)
      return res.status(400).json({ error: "Invalid token payload" });

    next();
  } catch (err) {
    console.error("❌ Invalid or expired token:", err);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};
