import crypto from 'crypto';

const EXPIRATION_TIME_MINUTES_DEFAULT = 10;

export const generateTwoFactorCode = () => {    
  const code = crypto.randomInt(100000, 1000000).toString();
  return code.toString();
};

export const getTwoFactorExpirationTime = (minutesToExpire = EXPIRATION_TIME_MINUTES_DEFAULT) => {
    const expirationTime = new Date();
    expirationTime.setMinutes(expirationTime.getMinutes() + minutesToExpire);
    return expirationTime;
};

export const isTwoFactorCodeExpired = (expirationTime) => {
    return new Date() > expirationTime;
};

export const verify2FACode = async (inputCode, storedCode, expirationTime) => {
  if (isTwoFactorCodeExpired(expirationTime)) {
    return { isValid: false, error: "TWO_FACTOR_CODE_EXPIRED", message: "El código de verificación ha expirado" };
  }

  if (inputCode !== storedCode) {
    return { isValid: false, error: "INVALID_2FA_CODE", message: "El código de verificación es inválido" };
  }

  return { isValid: true, mesage: "Código de verificación válido" };
}