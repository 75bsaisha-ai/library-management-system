import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me-in-production";
const TOKEN_EXPIRY = "24h";

export function hashPassword(plain) {
  return bcrypt.hashSync(plain, 10);
}

export function verifyPassword(plain, hash) {
  return bcrypt.compareSync(plain, hash);
}

export function signToken(userId) {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export function toPublicUser(user) {
  const { passwordHash, ...publicUser } = user;
  return publicUser;
}

/** Express middleware requiring a valid Bearer token. Attaches req.userId. */
export function requireAuth(users) {
  return (req, res, next) => {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    const payload = token ? verifyToken(token) : null;

    if (!payload) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = users.find((u) => u.id === payload.sub);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.userId = user.id;
    next();
  };
}
