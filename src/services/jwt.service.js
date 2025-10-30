import jwt from "jsonwebtoken";

/**
 * Genera un token de acceso JWT de acceso con informacion del user.
 * @param {Object} payload - La carga útil que se incluirá en el token (por ejemplo, id, email, role).
 * @param {string} payload.userId - El ID del usuario.
 * @param {string} payload.email - El email del usuario.
 * @param {string} payload.role - El rol del usuario.
 * @returns {string} - El token JWT generado.
 */
export const generateAccessToken = (payload) => {
  const token = jwt.sign(
    payload,
    process.env.JWT_ACCESS_SECRET,
    {
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
      issuer: 'proyect-api',
      audience: 'proyect-users',
    }
  )

  return token;
}

export const verifyAccessToken = (token) => {
  const verifyOptions = {
    issuer: 'proyect-api',
    audience: 'proyect-users',
  };

  try {
    // Usar la clave de acceso desde process.env
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET, verifyOptions);
  } catch (accessTokenError) {
    // Intentar verificar con refresh secret si existe (opcional)
    try {
      if (!process.env.JWT_REFRESH_SECRET) throw accessTokenError;
      return jwt.verify(token, process.env.JWT_REFRESH_SECRET, verifyOptions);
    } catch (refreshTokenError) {
      if ((accessTokenError && accessTokenError.name === 'TokenExpiredError') ||
          (refreshTokenError && refreshTokenError.name === 'TokenExpiredError')) {
        throw new Error('Token expirado');
      } else if ((accessTokenError && accessTokenError.name === 'JsonWebTokenError') ||
                 (refreshTokenError && refreshTokenError.name === 'JsonWebTokenError')) {
        throw new Error('Token inválido');
      } else {
        throw new Error('Error al verificar token');
      }
    }
  }
}

export const generateRefreshToken = (payload) => {
  return jwt.sign(
    { userId: payload.userId },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_ACCESS_SECRET,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '6d',
      issuer: 'proyect-api',
      audience: 'proyect-users',
    }
  )
}


export const extractTokenFromHeader = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  return authHeader.split(' ')[1];
}
