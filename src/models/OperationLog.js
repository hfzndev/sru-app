import mongoose from 'mongoose';

const HighlightSchema = new mongoose.Schema({
  id: { type: String, required: true },
  text: { type: String, required: true },
  done: { type: Boolean, default: false },
}, { _id: false });

const OperationLogSchema = new mongoose.Schema({
  // Date key (YYYY-MM-DD, WIB UTC+7) — one record per day
  date: { type: String, required: true, unique: true, index: true },

  // ── UNIT 90 ──────────────────────────────────────────────
  u90Condition: { type: String, default: 'Normal Operations' },

  // ── UNIT 91 ──────────────────────────────────────────────
  u91Condition:              { type: String, default: 'Normal Operations' },
  u91Feed:                   { type: String, default: '' }, // ton/day, normal = 600
  u91AmineStrength:          { type: String, default: '' }, // %
  u91AmineInventory:         { type: String, default: '' }, // m3
  u91AcidGasToSRU:           { type: String, default: '' }, // ton/day
  u91AcidGasToFlare:         { type: String, default: '' }, // ton/day
  u91TreatedGasToLPG:        { type: String, default: '' }, // ton/day
  u91TreatedGasToFGS:        { type: String, default: '' }, // ton/day
  u91LiquidCondensateToSWS:  { type: String, default: '' }, // ton/day

  // ── UNIT 92 ──────────────────────────────────────────────
  u92Condition:   { type: String, default: 'Normal Operations' },
  u92Feed:        { type: String, default: '' }, // ton/day, normal = 506
  u92FuelGas:     { type: String, default: '' }, // ton/day
  u92LpgTo47T103: { type: String, default: '' }, // ton/day
  u92Condensate:  { type: String, default: '' }, // ton/day

  // ── UNIT 93 ──────────────────────────────────────────────
  u93Condition:        { type: String, default: 'Normal Operations' },
  u93Feed:             { type: String, default: '' }, // ton/day, normal = 84
  u93FuelGasTo93:      { type: String, default: '' },
  u93T401LevelMm:      { type: String, default: '' }, // mm input
  u93T402LevelMm:      { type: String, default: '' }, // mm input
  // Computed ton values and net stock are React-only; cumulative loading stored:
  u93TotalLoadingT401: { type: String, default: '0' }, // cumulative ton this month
  u93TotalLoadingT402: { type: String, default: '0' }, // cumulative ton this month

  // ── UNIT 94 ──────────────────────────────────────────────
  u94Condition:    { type: String, default: 'Normal Operations' }, // + Thermox On
  u94TempThermox:  { type: String, default: '' }, // °C

  // ── UNIT 95 ──────────────────────────────────────────────
  u95Condition: { type: String, default: 'Normal Operations' },

  // ── UNIT 47 IPAL ─────────────────────────────────────────
  u47Condition:      { type: String, default: 'Normal Operations' },
  u47FlowDafA:       { type: String, default: '' }, // m3/hr
  u47FlowDafB:       { type: String, default: '' }, // m3/hr
  u47SwsFeed:        { type: String, default: '' }, // m3/hr
  u47DesalterFeed:   { type: String, default: '' }, // m3/hr
  // u47Feed is auto-computed React-side (SWS + Desalter), not stored
  u47SlopOilTo43T:   { type: String, default: '' }, // ton/day
  u47CleanWaterToHB: { type: String, default: '' }, // m3/hr
  u47AerationAph:    { type: String, default: '' },
  u47AerationAmlss:  { type: String, default: '' },
  u47AerationBph:    { type: String, default: '' },
  u47AerationBmlss:  { type: String, default: '' },
  u47ChemTsp:        { type: String, default: '' }, // kg
  u47ChemCaustic:    { type: String, default: '' }, // kg
  u47ChemSobi:       { type: String, default: '' }, // kg

  // ── UNIT 166 WWTP ─────────────────────────────────────────
  u166Condition:          { type: String, default: 'Normal Operations' },
  u166Feed:               { type: String, default: '' }, // m3/hr, normal = 76
  u166AerationPh:         { type: String, default: '' },
  u166AerationMlss:       { type: String, default: '' },
  u166ChemTsp:            { type: String, default: '' }, // kg
  u166ChemCaustic:        { type: String, default: '' }, // kg
  u166ChemSobi:           { type: String, default: '' }, // kg
  u166FeedPh:             { type: String, default: '' },
  u166FeedTss:            { type: String, default: '' },
  u166FeedCod:            { type: String, default: '' },
  u166FeedOil:            { type: String, default: '' },
  u166FeedAmmoniaOutlet:  { type: String, default: '' },

  // ── CLEAN WATER ANALYSIS ──────────────────────────────────
  // Design column is hardcoded in UI, not stored
  cwWwtPh:      { type: String, default: '' },
  cwWwtCod:     { type: String, default: '' },
  cwWwtOil:     { type: String, default: '' },
  cwWwtPhenol:  { type: String, default: '' },
  cwWwtAmmonia: { type: String, default: '' },
  cwIpalPh:     { type: String, default: '' },
  cwIpalCod:    { type: String, default: '' },
  cwIpalOil:    { type: String, default: '' },
  cwIpalPhenol: { type: String, default: '' },
  cwIpalAmmonia:{ type: String, default: '' },

  // ── CPI CONDITION ─────────────────────────────────────────
  cpiAocSruLevel:   { type: String, default: '' }, // %
  cpi47T501Level:   { type: String, default: '' }, // %
  cpi166Pit505Level:{ type: String, default: '' }, // %

  // ── HB 49/66 ──────────────────────────────────────────────
  hb49Condition:         { type: String, default: 'Clean' },
  hb66TimurCondition:    { type: String, default: 'Clean' },
  aerationTimurCondition:{ type: String, default: 'Clean' },
  hb66BaratCondition:    { type: String, default: 'Clean' },
  aerationBaratCondition:{ type: String, default: 'Clean' },
  secondTrapCondition:   { type: String, default: 'Clean' },
  sumpit49Level:  { type: String, default: '' }, // %
  sumpit66Level:  { type: String, default: '' }, // %
  sumpit301Level: { type: String, default: '' }, // %

  // ── HIGHLIGHTS (persistent, not reset daily) ──────────────
  // Stored on the latest record and carried forward on each submit
  highlights: { type: [HighlightSchema], default: [] },

}, { timestamps: true });

export default mongoose.models.OperationLog || mongoose.model('OperationLog', OperationLogSchema);
