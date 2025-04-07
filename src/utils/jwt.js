// src/utils/jwt.js
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export function signJwt(payload, options = {}) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "7d",
    ...options,
  });
}
