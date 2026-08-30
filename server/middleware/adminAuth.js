import user from "../models/auth.js";

// Chain after `auth` — relies on req.userid already being set from the JWT.
const adminAuth = async (req, res, next) => {
  try {
    const found = await user.findById(req.userid).select("role");
    if (!found || found.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export default adminAuth;