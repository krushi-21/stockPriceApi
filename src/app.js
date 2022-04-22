import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import path from 'path';
import bodyParser from 'body-parser';
import logger from './config/logger.js';
import db from './connections/db.js';
import scanner from './connections/scanner.js';
import AppRoutes from './components/routes.js';

//create express app
const app = express();
//config dotenv
dotenv.config();
//get port with args
const port = process.argv[2] || process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());
app.use(cookieParser());
app.use(morgan('dev'));
//set static path
const pubpath = path.join(process.cwd().toString(), 'src/public');

app.use(express.static(pubpath));
//set js-css folder path
app.use('/js', express.static(pubpath));
app.use('/css', express.static(pubpath));

//set view engine
app.set('views', path.join(process.cwd().toString(), '/views'));
app.set('view engine', 'ejs');

//set routes
app.use('/api/v1', AppRoutes);

//404 error
app.all('*', (req, res, next) => {
  return next(
    res.status(404).send(`Can't find ${req.originalUrl} on this server!`)
  );
});

//listen to server
app.listen(port, () =>
  logger.info('> Server is up and running on port : ' + port)
);
