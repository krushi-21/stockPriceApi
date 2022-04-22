import catchAsync from '../../helpers/catchAsync.js';
import axios from 'axios';
import { DateTime } from 'luxon';
import Stocks from './stockModel.js';
import StockSearchDB from './stockSearchModel.js';
import logger from '../../config/logger.js';

//get chart data function
async function getChartData(stockData, stockName, userId) {
  var ohlc = [],
    volume = [],
    dataLength = stockData.data['Time Series (5min)'];
  //remove unnecessary data from api response
  for (var time in dataLength) {
    var stock_info = dataLength[time];
    var date = DateTime.fromSQL(time).ts;
    var open = Number(stock_info['1. open']);
    var close = Number(stock_info['2. high']);
    var high = Number(stock_info['3. low']);
    var low = Number(stock_info['4. close']);
    ohlc.push({
      x: date,
      o: open,
      h: high,
      l: low,
      c: close,
    });

    volume.push([
      time, // the date
      Number(stock_info['5. volume']), // the volume
    ]);
  }
  //store data in db
  const storeInDB = await Stocks.create({
    stockName: stockName,
    data: ohlc,
  });
  //store search history in db
  await storeSearchInDB(stockName, storeInDB.id, userId);
  return ohlc;
}

const getStockData = catchAsync(async (req, res, next) => {
  logger.info('in get stonks');
  const { stockName } = req.body;

  const data = await searchStonksInDB(stockName.toUpperCase());

  if (data) {
    await storeSearchInDB(data.stockName, data.id, req.user);
    logger.info('stock name' + data.stockName);
    var data1 = JSON.stringify(data.data);
    return res.render('homescreen', {
      ohlc: data1,
      error: null,
      name: data.stockName,
    });
  }

  const stockData = await searchStonks(stockName);
  if (!stockData.data['Error Message']) {
    var ohlc = await getChartData(stockData, stockName, req.user.id);
    var data1 = JSON.stringify(ohlc);
    return res.render('homescreen', {
      ohlc: data1,
      error: null,
      name: stockName,
    });
  }

  return res.render('homescreen', {
    ohlc: null,
    error: 'Invalid name',
    name: null,
  });
});

//search stocks data from api
async function searchStonks(stockName) {
  //for intraday
  var url = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${stockName}&interval=5min&apikey=${process.env.API_KEY}`;
  //for 7days
  var url1 = `https://www.alphavantage.co/query?function=TIME_SERIES_WEEKLY&symbol=${stockName}&apikey=${process.env.API_KEY}`;
  const response = await axios(url);
  //return response
  return response;
}

//search data in DB
async function searchStonksInDB(stockName) {
  const stock = await Stocks.findOne({ stockName });
  return stock;
}

//store search data in db
async function storeSearchInDB(stockName, dataId, userId) {
  console.log('user id ' + userId);
  //check if data already availble
  const stock = await StockSearchDB.findOne({ stockName, user: userId });
  if (stock) {
    return;
  }
  //if not store in db
  const storeSearchInDB = await StockSearchDB.create({
    stockName: stockName,
    user: userId,
    data: dataId,
  });
  return;
}

export default {
  getStockData,
};
