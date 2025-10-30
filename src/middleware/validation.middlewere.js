export const validateSchema = (schema) => {
  return (req, res, next) => {
    try {
      const validationResult = schema.safeParse(req.body);

      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          message: "Datos de entrada inválidos",
          errors: validationResult.error.issues.map(issue => ({
            field: issue.path.join("."),
            message: issue.message,
            code: issue.code
          }))
        })
      }

      req.body = validationResult.data;
      next();
    } catch (error) {
      console.error("Error en validación de esquema:", error);
      return res.status(500).json({
        success: false,
        message: "Error interno en validación",
        error: "VALIDATION_ERROR"
      })
    }
  }
}