import { ObjectId } from "mongodb";
import { ERRORS } from "../constants/global.constants.js";
import users from "../model/user.model.js";
import {
  extractTokenFromHeader,
  verifyAccessToken,
} from "../services/jwt.service.js";

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token de autorización no proporcionado",
        error: ERRORS.UNAUTHORIZED,
      });
    }

    let decodedToken;
    try {
      decodedToken = verifyAccessToken(token);
      // Adjuntar info del usuario para handlers posteriores
      req.user = decodedToken;
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: err.message,
        error: ERRORS.UNAUTHORIZED,
      });
    }

    const userCollection = await users();

    const user = await userCollection.findOne(
      { _id: new ObjectId(decodedToken.id) },
      {
        projection: { password: 0, twoFactorCode: 0, twoFactorExpires: 0 },
      }
    );
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Usuario no encontrado o inactivo",
        error: ERRORS.USER_NOT_FOUND,
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Usuario inactivo",
        error: ERRORS.FORBIDDEN,
      });
    }

    req.user = user;
    req.userId = user._id;

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({
      success: false,
      message: "No autorizado",
      error: ERRORS.UNAUTHORIZED,
    });
  }
};
