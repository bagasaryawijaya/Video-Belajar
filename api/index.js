// Vercel Serverless Function entry point.
// This file intentionally lives at the ROOT /api/index.js so Vercel
// deploys the Express API when the project is deployed from the root.
import app from "../backend/server.js";

export default function handler(req, res) {
  return app(req, res);
}
