import jwt from "jsonwebtoken";

export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res.status(401).json({ error: "Authorization header missing" });

    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Token missing" });

    // ✅ Verify token using the same secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    console.log(`✅ Verified JWT for ${req.user.username} (${req.user.role})`);
    next();
  } catch (err) {
    console.error("❌ Token verification failed:", err.message);
    if (err.name === "TokenExpiredError") {
      return res.status(403).json({ error: "Session expired. Please login again." });
    }
    res.status(403).json({ error: "Invalid or expired token" });
  }
};
