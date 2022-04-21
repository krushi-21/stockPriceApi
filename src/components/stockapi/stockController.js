import catchAsync from '../../helpers/catchAsync.js';
import axios from 'axios';
import { DateTime } from 'luxon';
import Stocks from './stockModel.js';

async function getChartData(stockData, stockName) {
  var ohlc = [],
    volume = [],
    dataLength = stockData.data['Time Series (5min)'];
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

  const storeInDB = await Stocks.create({
    stockName: stockName,
    data: ohlc,
  });
  return ohlc;
}

const getStockData = catchAsync(async (req, res, next) => {
  console.log('in get stonks');
  const { stockName } = req.body;

  const data = await searchStonksInDB(stockName.toUpperCase());

  if (data) {
    console.log('stock name' + data.stockName);
    var data1 = JSON.stringify(data.data);
    return res.render('homescreen', {
      ohlc: data1,
      error: null,
      name: data.stockName,
    });
  }

  const stockData = await searchStonks(stockName);
  if (!stockData.data['Error Message']) {
    var ohlc = await getChartData(stockData, stockName);
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

export default {
  getStockData,
};

async function searchStonks(stockName) {
  var url = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${stockName}&interval=5min&apikey=${process.env.API_KEY}`;
  var url1 = `https://www.alphavantage.co/query?function=TIME_SERIES_WEEKLY&symbol=${stockName}&apikey=${process.env.API_KEY}`;
  const response = await axios(url);

  return response;
}

async function searchStonksInDB(stockName) {
  const stock = await Stocks.findOne({ stockName });
  return stock;
}
