import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET belum diatur pada environment.");
}

export async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export function createAccessToken(user) {
  return jwt.sign(
    {
      sub: String(user.id),
      email: user.email,
      role: user.role || "student",
      type: "access",
    },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

export function createEmailVerificationToken(user) {
  return jwt.sign(
    {
      sub: String(user.id),
      email: user.email,
      type: "email_verification",
    },
    JWT_SECRET,
    { expiresIn: "30m" }
  );
}

export function createPasswordResetToken(user) {
  return jwt.sign(
    {
      sub: String(user.id),
      email: user.email,
      type: "password_reset",
    },
    JWT_SECRET,
    { expiresIn: "10m" }
  );
}

export function verifyJwt(token) {
  // Secret yang dipakai di sini SAMA dengan secret saat token dibuat.
  return jwt.verify(token, JWT_SECRET);
}
