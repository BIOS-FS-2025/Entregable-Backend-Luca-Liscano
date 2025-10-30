import z from "zod";

export const createPostValidation = z.object({
  title: z
    .string()
    .min(2, "Título demasiado corto")
    .max(100, "Título demasiado largo"),
  content: z
    .string()
    .min(10, "Contenido demasiado corto")
    .max(1000, "Contenido demasiado largo"),
  category: z
    .string()
    .min(2, "Categoría demasiado corta")
    .max(50, "Categoría demasiado larga")
    .optional(),
  image: z.union([
    z.string().url("URL de imagen inválida"),
    z.null(),
    z.undefined()
  ]).optional(),
  price: z.number().min(0, "El precio no puede ser negativo").optional(),
});

export const postIdValidation = z.object({
  id: z.string().min(1, { message: "ID del post es requerido" }).trim(),
});

export const getPostsQueryValidation = z.object({
  page: z
    .string()
    .regex(/^\d+$/, { message: "La página debe ser un número" })
    .transform(Number)
    .refine((n) => n > 0, { message: "La página debe ser mayor a 0" })
    .optional()
    .default(1),
    limit: z.string()
    .regex(/^\d+$/, { message: "El límite debe ser un número" })
    .transform(Number)
    .refine(n => n > 0 && n <= 50, { message: "El límite debe ser mayor a 0 y menor a 50" })
    .optional()
    .default(10),
  category: z.string()
    .min(1)
    .max(30)
    .optional(),
  tags: z.string()
    .optional()
    .transform(str => str ? str.split(',').map(tag => tag.trim()) : []),
  search: z.string()
    .min(1)
    .max(100)
    .optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'title', 'likes'])
    .optional()
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc'])
    .optional()
    .default('desc'),
});

export const editPostValidation = z.object({
  title: z
    .string()
    .min(2, "Título demasiado corto")
    .max(100, "Título demasiado largo")
    .optional(),
  content: z
    .string()
    .min(10, "Contenido demasiado corto")
    .max(1000, "Contenido demasiado largo")
    .optional(),
  category: z
    .string()
    .min(2, "Categoría demasiado corta")
    .max(50, "Categoría demasiado larga")
    .optional(),
  image: z.union([
    z.string().url("URL de imagen inválida"),
    z.null(),
    z.undefined()
  ]).optional(),
  price: z.number().min(0, "El precio no puede ser negativo").optional(),
});
