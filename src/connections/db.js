import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import logger from '../config/logger.js';

const DB = process.env.MONGO_PATH;
const db = mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => logger.info('DB connected Successfully!'));

export default db;
