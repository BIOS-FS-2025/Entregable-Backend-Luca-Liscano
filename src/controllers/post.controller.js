import { ERRORS } from "../constants/global.constants.js";
import { createPost, editPost, eliminatePost, getPostById, getPosts } from "../services/post.service.js";
import { getPostsQueryValidation, postIdValidation } from "../validations/post.validations.js";

export const createPostController = async (req, res, next) => {
  const postData = req.body;
  const userId = req.userId;

  try {
    const newPost = await createPost(postData, userId);

    res.status(201).json({
      success: true,
      message: "Post creado correctamente",
      data: newPost,
    });
  } catch (error) {
    console.error("Failed to create post:", error);
    res.status(500).json({
      success: false,
      message: "Error interno en el servidor",
      error: ERRORS.SERVER_ERROR,
    });
  }
};

export const editPostController = async (req, res, next) => {
const postData = req.body;
const userId = req.userId;
const post = await getPostById(req.params.id);


  try {
    const updatedPost = await editPost(post, postData, userId);

    res.status(200).json({
      success: true,
      message: "Post editado correctamente",
      data: updatedPost,
    });
  } catch (error) {
    console.error("Failed to edit post:", error);
    res.status(500).json({
      success: false,
      message: "Error interno en el servidor",
      error: ERRORS.SERVER_ERROR,
    });
  }
}

export const deletePostController = async (req, res, next) => {
const userId = req.userId;
const post = await getPostById(req.params.id);

  try {
    const updatedPost = await eliminatePost(post, userId);

    res.status(200).json({
      success: true,
      message: "Post eliminado correctamente",
      data: updatedPost,
    });
  } catch (error) {
    console.error("Failed to delete post:", error);
    res.status(500).json({
      success: false,
      message: "Error interno en el servidor",
      error: ERRORS.SERVER_ERROR,
    });
  }
}

export const getPostController = async (req, res, next) => {
  try {
    const validationResult = postIdValidation.safeParse(req.params);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "ID de post inválido",
        error: validationResult.error,
      });
    }
    const { id } = validationResult.data;
    const post = await getPostById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post no encontrado",
        error: ERRORS.POST_NOT_FOUND,
      });
    }

    res.status(200).json({
      success: true,
      message: "Post obtenido correctamente",
      data: {
        post,
      },
    });
  } catch (error) {
    console.error("Failed to get post:", error);
    res.status(500).json({
      success: false,
      message: "Error interno en el servidor",
      error: ERRORS.SERVER_ERROR,
    });
  }
};

export const getPostsController = async (req, res, next) => {
  try {
    const validationResult = getPostsQueryValidation.safeParse(req.query);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Parámetros de consulta inválidos",
        errors: validationResult.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
          code: issue.code
        }))
      });
    }

    const filters = validationResult.data;
    const results = await getPosts(filters);

    res.status(200).json({
      success: true,
      message: "Posts obtenidos correctamente",
      data: results,
    });

  } catch (error) {
    console.error("Failed to get posts:", error);
    res.status(500).json({
      success: false,
      message: "Error interno en el servidor",
      error: ERRORS.SERVER_ERROR,
    });
  }
};