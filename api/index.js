// Vercel Serverless Function entry point.
// IMPORTANT: this file stays at the project root in /api/index.js.
// vercel.json routes every /api/* request here, including POST/PUT/DELETE.
import app from "../backend/server.js";

export default function handler(req, res) {
  return app(req, res);
}
