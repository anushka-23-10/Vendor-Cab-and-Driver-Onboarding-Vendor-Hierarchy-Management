// middleware/auth.middleware.js
import jwt from "jsonwebtoken";

/**
 * authenticate middleware
 * - verifies Bearer token
 * - attaches a safe `req.user` object
 */
export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "Authorization header missing" });
    }

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(401).json({ error: "Malformed authorization header" });
    }

    const token = parts[1];
    if (!token) return res.status(401).json({ error: "Token missing" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach only safe fields
    req.user = {
      id: decoded.id,
      username: decoded.username,
      role: decoded.role,
      vendorId: decoded.vendorId,
      parentVendorId: decoded.parentVendorId || null,
    };

    next();
  } catch (err) {
    console.error("❌ Authentication failed:", err.message);
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};

// Export default too, so both `import authenticate from ...` and
// `import { authenticate } from ...` will work in your routes.
export default authenticate;
