export const authorize = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ error: "Unauthorized: No user found" });
    }

    // Debug log for clarity
    console.log(`🔍 Authorizing role: ${req.user.role}, allowed: ${allowedRoles}`);

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied: ${req.user.role} not permitted for this action.`,
      });
    }

    next();
  };
};
