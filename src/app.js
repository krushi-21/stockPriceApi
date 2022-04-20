import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import path from 'path';
import logger from './config/logger.js';
import db from './connections/db.js';
import AppRoutes from './components/routes.js';

const app = express();
dotenv.config();
const port = process.argv[2] || process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(morgan('dev'));
const pubpath = path.join(process.cwd().toString(), 'src/public');

app.use(express.static(pubpath));
app.use('/js', express.static(pubpath));
app.use('/css', express.static(pubpath));

app.set('views', path.join(process.cwd().toString(), '/views'));
app.set('view engine', 'ejs');

app.use('/api/v1', AppRoutes);

app.all('*', (req, res, next) => {
  return next(
    res.status(404).send(`Can't find ${req.originalUrl} on this server!`)
  );
});

app.listen(port, () =>
  logger.info('> Server is up and running on port : ' + port)
);
