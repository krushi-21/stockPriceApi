import mongoose from 'mongoose';

const stocksSearchSchema = new mongoose.Schema(
  {
    stockName: {
      type: String,
      uppercase: true,
      required: true,
    },
    data: {
      type: mongoose.Types.ObjectId,
      ref: 'Stocks',
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

const StockSearch = mongoose.model('StockSearch', stocksSearchSchema);

export default StockSearch;
