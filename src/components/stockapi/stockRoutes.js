import express from 'express';
import stockController from './stockController.js';

const router = express.Router();

router
  .post('/stockapi', stockController.getStockData)
  .get('/stockapi', function (req, res) {
    res.render('chart');
  });

export default router;
