import mongoose from 'mongoose';

const DashboardDataSchema = new mongoose.Schema({
  key: { type: String, default: "singleton", unique: true },

  // Landing Page Generic Operations Summary
  sulfurProduction: { type: String, default: '7.19' },
  feedGasTotal: { type: String, default: '3505' },
  sulfurInventory: { type: String, default: '390.58' },
  activeCrew: { type: String, default: '8' },

  // SRU UNIT 91
  u91FeedGasCapacity: { type: String, default: '14.2' },

  // SRU UNIT 92
  u92TreatedGas: { type: String, default: '45.0' },
  u92GasToFuel: { type: String, default: '1,200' },
  u92LpgProduct: { type: String, default: '3,105' },
  u92Condensate: { type: String, default: '500' },

  // SRU UNIT 93 / 94
  u93AcidGasTotal: { type: String, default: '1,061' },
  u93Capacity: { type: String, default: '30.16' },
  u94So2Cems: { type: String, default: '120' },

  // IPAL WWT
  ipalCapacity: { type: String, default: '78.0' },
  ipalPhA: { type: String, default: '7.2' },
  ipalMlssA: { type: String, default: '2,500' },
  ipalPhB: { type: String, default: '7.4' },
  ipalMlssB: { type: String, default: '2,450' },

  wwtCapacity: { type: String, default: '60.5' },
  wwtPhPit: { type: String, default: '6.8' },
  wwtMlssPit: { type: String, default: '1,800' },

  // Status
  hbStatus: { type: String, default: 'clean', enum: ['clean', 'warn', 'danger', 'cleaning'] },

}, { timestamps: true });

export default mongoose.models.DashboardData || mongoose.model('DashboardData', DashboardDataSchema);
