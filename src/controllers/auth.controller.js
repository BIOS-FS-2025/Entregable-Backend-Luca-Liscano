import { getDB } from "../db.js";
import bcrypt from "bcryptjs";
import { sendByEmailJS } from "../services/email.service.js";
import { ERRORS } from "../constants/global.constants.js";
import {
  generateTwoFactorCode,
  getTwoFactorExpirationTime,
  verify2FACode,
} from "../services/TwoFactor.service.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../services/jwt.service.js";
import users from "../model/user.model.js";
import { ObjectId } from "mongodb";

export const register = async (req, res, next) => {
  const { name, email, password } = req.body;

  try {
    const db = getDB();
    const usersCollection = db.collection("users");

    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Ya existe una cuenta con este email",
        error: ERRORS.USER_EXISTS,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      isVerified: false,
      twoFactorCode: null,
      twoFactorExpires: null,
      loginAttempts: 0,
      lockUntil: null,
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await usersCollection.insertOne(newUser);

    const userResponse = {
      _id: result.insertedId,
      name: newUser.name,
      email: newUser.email,
      isVerified: newUser.isVerified,
      createdAt: newUser.createdAt,
    };

    try {
      const templateId = process.env.EMAILJS_WELCOME_TEMPLATE_ID;
      const options = { user_name: newUser.name };
      await sendByEmailJS(newUser.email, options, templateId);
    } catch (emailError) {
      console.error("Failed to send email:", emailError);
    }

    res.status(201).json({
      success: true,
      message: "Usuario creado correctamente",
      data: userResponse,
    });
  } catch (error) {
    console.error("Failed to create user:", error);
    res.status(500).json({
      success: false,
      message: "Error interno en el servidor",
      error: ERRORS.SERVER_ERROR,
    });
  }
};

export const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
   const usersCollection = await users();

    const user = await usersCollection.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Credenciales inválidas",
        error: "INVALID_CREDENTIALS",
      });
    }

    if (user.lockUntil && user.lockUntil > new Date()) {
      const remainingTime = Math.ceil((user.lockUntil - new Date()) / 60000); // en minutos

      return res.status(423).json({
        success: false,
        message: `Cuenta bloqueada temporalmente. Inténtalo de nuevo en ${remainingTime} minutos.`,
        error: "ACCOUNT_LOCKED",
        data: {
          remainingTime,
        },
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      const loginAttempts = (user.loginAttempts || 0) + 1;
      const updateData = {
        loginAttempts,
        updateAt: new Date(),
      };

      if (loginAttempts >= 3) {
        updateData.lockUntil = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos bloqueado
        updateData.loginAttempts = 0;
      }
      await usersCollection.updateOne({ _id: user._id }, { $set: updateData });

      return res.status(401).json({
        success: false,
        message: "Credenciales inválidas",
        error: "INVALID_CREDENTIALS",
      });
    }

    const twoFactorCode = generateTwoFactorCode();
    const twoFactorExpires = getTwoFactorExpirationTime();

    console.log("Generated 2FA code:", twoFactorCode);

    await usersCollection.updateOne(
      { _id: user._id },
      {
        $set: {
          twoFactorCode,
          twoFactorExpires,
          loginAttempts: 0,
          lockUntil: null,
          updatedAt: new Date(),
        },
      }
    );

    try {
      const templateId = process.env.EMAILJS_2FA_TEMPLATE_ID;
      const options = { user_name: user.name, code: twoFactorCode };
      await sendByEmailJS(user.email, options, templateId);
    } catch (error) {
      console.error("Failed to send 2FA email:", error);
      return res.status(500).json({
        success: false,
        message: "Error al enviar el código de verificación",
        error: "TWO_FACTOR_EMAIL_FAILED",
      });
    }

    res.status(200).json({
      success: true,
      message: "Codigo de verificación enviado al email",
      data: {
        email: user.email,
        codeExpires: 10,
      },
    });
  } catch (error) {
    console.error("Failed to login:", error);
    res.status(500).json({
      success: false,
      message: "Error interno en el servidor",
      error: "SERVER_ERROR",
    });
  }
};

export const verify2FA = async (req, res, next) => {
  const { email, code } = req.body;

  try {
    const db = getDB();
    const usersCollection = db.collection("users");
    const user = await usersCollection.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
        error: ERRORS.USER_NOT_FOUND,
      });
    }

    if (!user.twoFactorCode || !user.twoFactorExpires) {
      return res.status(400).json({
        message: "No hay código de verificación pendiente",
      });
    }

    const validationResult = await verify2FACode(
      code,
      user.twoFactorCode,
      user.twoFactorExpires
    );

    if (!validationResult.isValid) {
      return res.status(400).json({
        success: false,
        message: validationResult.message,
        error: validationResult.error,
      });
    }

    await usersCollection.updateOne(
      { _id: user._id },
      {
        $set: {
          isVerified: true,
          updatedAt: new Date(),
        },
        $unset: {
          twoFactorCode: "",
          twoFactorExpires: "",
        },
      }
    );

    // Convertir el ObjectId a string antes de generar tokens
    const tokenPayload = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    const userResponse = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      isVerified: true,
      createdAt: user.createdAt,
    };

    res.status(200).json({
      success: true,
      message: "Verificación 2FA exitosa",
      data: {
        user: userResponse,
        token: {
          accessToken,
          refreshToken,
          tokenType: "Bearer",
          expiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? "15m",
        },
      },
    });
  } catch (error) {
    // Mostrar traza real para depuración
    console.error("verify2FA error:", error);
    res.status(500).json({
      success: false,
      message: "Error interno en el servidor",
      error: ERRORS.SERVER_ERROR,
    });
  }
};

export const profile = async (req, res, next) => {
  const userId = req.params.id;

  try {
    const db = getDB();
    const usersCollection = db.collection("users");
    const user = await usersCollection.findOne({ _id: new ObjectId(userId)});

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
        error: ERRORS.USER_NOT_FOUND,
      });
    }

    res.status(200).json({
      success: true,
      message: "Perfil obtenido correctamente",
      data: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Failed to get user profile:", error);
    res.status(500).json({
      success: false,
      message: "Error interno en el servidor",
      error: ERRORS.SERVER_ERROR,
    });
  }
};
