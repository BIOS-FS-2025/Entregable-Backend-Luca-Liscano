import { getDB } from '../db.js';

const users = async () => {
  const db = getDB();
  return db.collection('users');
}

export default users;