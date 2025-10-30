import { z } from "zod";

/**
 * Validación para registrar un nuevo usuario
 * Valida que el nombre tenga al menos 3 caracteres y menos de 50
 * el email tenga un formato de email válido y sea en minúsculas
 * y la contraseña sea segura
 */
export const registerValidation = z.object({
  name: z.string()
    .min(3, { message: "El nombre debe tener al menos 3 caracteres" })
    .max(50, { message: "El nombre debe tener menos de 50 caracteres" })
    .trim(),
  email: z.email({ message: "El email no es válido" })
    .toLowerCase()
    .trim(),
  password: z.string()
    .min(8, { message: "La contraseña debe tener al menos 8 caracteres" })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
      message: "La contraseña debe tener al menos una letra mayúscula, una letra minúscula y un número"
    })
    .trim(),
});

export const loginValidation = z.object({
  email: z.email({ message: "Debe ser un email válido" })
    .toLowerCase()
    .trim(),
  password: z.string()
    .min(3, { message: "La contraseña es requerida" })
});

export const verify2FAValidation = z.object({
  email: z.email({ message: "Debe ser un email válido" })
    .toLowerCase()
    .trim(),
  code: z.string()
    .length(6, { message: "El código debe tener 6 dígitos" })
    .regex(/^\d+$/, { message: "El código debe contener solo números" })
});