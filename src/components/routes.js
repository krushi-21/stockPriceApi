import express from 'express';
import user from './users/userRoutes.js';

const router = express.Router();

router.use('/users', user);

export default router;
