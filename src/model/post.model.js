import { getDB } from '../db.js';

const posts = () => {
  const db = getDB();
  return db.collection('posts');
}

export default posts;