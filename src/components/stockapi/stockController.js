import catchAsync from '../../helpers/catchAsync.js';
import axios from 'axios';
import { DateTime } from 'luxon';

const getStockData = catchAsync(async (req, res, next) => {
  const { stockName } = req.body;
  console.log(stockName);
  const stockData = await searchStonks(stockName);

  //ohlc graph
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
  res.status(200).json(ohlc);
});

export default {
  getStockData,
};

async function searchStonks(stockName) {
  var url = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${stockName}&interval=5min&apikey=${process.env.API_KEY}`;
  const response = await axios(url);
  return response;
}
