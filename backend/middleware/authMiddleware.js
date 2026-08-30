import { verifyJwt } from "../utils/auth.js";

export function authenticate(req, res, next) {
  try {
    // Sesuai kebutuhan: token dibaca dari req.header.authorization.
    const authorization = req.header("Authorization");

    if (!authorization) {
      return res.status(401).json({
        success: false,
        message: "Authorization header wajib diisi.",
      });
    }

    const [scheme, token] = authorization.split(" ");

    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({
        success: false,
        message: "Format Authorization harus: Bearer <token>.",
      });
    }

    const decoded = verifyJwt(token);

    if (decoded.type !== "access") {
      return res.status(401).json({
        success: false,
        message: "Token bukan access token.",
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Token tidak valid atau sudah kedaluwarsa.",
    });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Anda tidak memiliki akses.",
      });
    }
    next();
  };
}
