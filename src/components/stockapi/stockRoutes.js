import express from 'express';
import stockController from './stockController.js';
import checkUserAuth from '../../middlewares/checkAuth.js';
const router = express.Router();

router
  .post('/stockapi', checkUserAuth, stockController.getStockData)
  .get('/stockapi', checkUserAuth, function (req, res) {
    res.render('homescreen', { ohlc: null, error: null, name: null });
  });

export default router;
