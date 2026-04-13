import mongoose from 'mongoose';

const StockItemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  qty: { type: Number, required: true, default: 0 },
  unit: { type: String, required: true }
});

const StockCategorySchema = new mongoose.Schema({
  categoryId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  sub: { type: String, required: true },
  items: [StockItemSchema]
}, { timestamps: true });

export default mongoose.models.StockCategory || mongoose.model('StockCategory', StockCategorySchema);
