import mongoose from 'mongoose';

const stocksSchema = new mongoose.Schema(
  {
    stockName: {
      type: String,
      uppercase: true,
      required: true,
    },
    data: [
      {
        x: String,
        o: String,
        h: String,
        l: String,
        c: String,
      },
    ],
  },
  { timestamps: true }
);

const Stocks = mongoose.model('Stocks', stocksSchema);

export default Stocks;
