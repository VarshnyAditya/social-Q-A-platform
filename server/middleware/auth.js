import jwt from "jsonwebtoken";
const auth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }
    const token = authHeader.split(" ")[1];
    // Pin the algorithm explicitly — without this, jwt.verify will accept
    // whatever algorithm the token's own header claims (e.g. "none", or an
    // asymmetric alg where a public key could be smuggled in as the HMAC
    // secret). Not currently exploitable here since the app only ever signs
    // with HS256 and JWT_SECRET is never a public key, but there's no reason
    // to leave that door unlocked.
    const decodedata = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });
    req.userid = decodedata?.id;
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
export default auth;