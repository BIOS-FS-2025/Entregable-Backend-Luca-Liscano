import { ObjectId } from "mongodb";
import { getDB } from "../db.js";
import posts from "../model/post.model.js";

export const getPostById = async (postId) => {
  const db = getDB();
  const postsCollection = posts();
  const post = await postsCollection.findOne({
    _id: new ObjectId(postId),
    IsAvailable: true,
  });

  if (!post) {
    throw new Error("Post no encontrado o no disponible");
  }
  return post;
};

export const createPost = async (postData, userId) => {
  const db = getDB();
  const postsCollection = posts();

  const newPost = {
    title: postData.title, // Limpiamos espacios innecesarios
    content: postData.content,
    category: postData.category || "General",
    image: postData.image || null,
    price: postData.price || 0,
    IsAvailable: true,
    comments: [],
    likes: [],
    likesCount: 0,
    commentsCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    author: {
      userId: new ObjectId(userId),
    },
  };

  const result = await postsCollection.insertOne(newPost);
  const post = await getPostById(result.insertedId);

  return {
    success: true,
    message: "Post creado correctamente",
    data: post,
  };
};

export const editPost = async (post, postData, userId) => {
  const db = getDB();
  const postsCollection = posts();
  const oldPost = post;

  if (!oldPost) {
    throw new Error("Post no encontrado");
  }

  
  if (oldPost.author.userId.toString() !== userId.toString()) {
    throw new Error("No tienes permiso para editar este post");
  }

  const updatedPost = {
    title: postData.title?.trim() || oldPost.title,
    content: postData.content || oldPost.content,
    category: postData.category || oldPost.category,
    image: postData.image || oldPost.image,
    price: postData.price ?? oldPost.price,
    IsAvailable: true,
    updatedAt: new Date(),
  };

  await postsCollection.updateOne(
    { _id: oldPost._id },
    { $set: updatedPost }
  );

  return {
    success: true,
    message: "Post editado correctamente",
    data: updatedPost,
  };
};

export const eliminatePost = async (post, userId) => {
  const db = getDB();
  const postsCollection = posts();

  if (!post) {
    throw new Error("Post no encontrado");
  }

  if (post.author.userId.toString() !== userId.toString()) {
    throw new Error("No tienes permiso para eliminar este post");
  }

  await postsCollection.deleteOne({ _id: post._id });

  return {
    success: true,
    message: "Post eliminado correctamente",
};
};

export const getPosts = async (filters) => {
  const db = getDB();
  const postsCollection = db.collection("posts");
  const usersCollection = db.collection("users");

  const {
    page = 1,
    limit = 10,
    category,
    search,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = filters;

  const query = { IsAvailable: true };

  if (category) query.category = category;

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { content: { $regex: search, $options: "i" } },
    ];
  }

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

  const posts = await postsCollection
    .find(query)
    .sort(sortOptions)
    .skip((page - 1) * limit)
    .limit(limit)
    .toArray();

  const userIds = [
    ...new Set(posts.map((post) => post.author?.userId?.toString())),
  ];
  const users = await usersCollection
    .find(
      { _id: { $in: userIds.map((id) => new ObjectId(id)) } },
      { projection: { name: 1, email: 1, _id: 1 } }
    )
    .toArray();

  const usersMap = new Map(users.map((user) => [user._id.toString(), user]));

  const populatedPosts = posts.map((post) => ({
    ...post,
    author: {
      name: usersMap.get(post.author?.userId?.toString())?.name ?? "Anónimo",
      email:
        usersMap.get(post.author?.userId?.toString())?.email ??
        "email@eliminado.com",
    },
  }));

  const totalPosts = await postsCollection.countDocuments(query);
  const totalPages = Math.ceil(totalPosts / limit);

  return {
    posts: populatedPosts,
    pagination: {
      currentPage: page,
      totalPages,
      totalPosts,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
};
