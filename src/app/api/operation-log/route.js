import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import OperationLog from "@/models/OperationLog";
import DashboardData from "@/models/DashboardData";

/**
 * GET /api/operation-log?date=YYYY-MM-DD
 * Returns the log for the given date (WIB).
 * If no date param → uses today's WIB date.
 * If record not found → returns the most recent record for pre-filling.
 */
export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    let date = searchParams.get("date");

    if (!date) {
      // Today in WIB (UTC+7)
      const now = new Date();
      const wib = new Date(now.getTime() + 7 * 60 * 60 * 1000);
      date = wib.toISOString().slice(0, 10);
    }

    let record = await OperationLog.findOne({ date });

    if (!record) {
      // Pre-fill with the most recent record if today has none
      record = await OperationLog.findOne().sort({ date: -1 }).lean();
      if (record) {
        // Return with the requested date so the form knows it's a new day
        record = { ...record, date, _isNewDay: true };
      }
    }

    return NextResponse.json(record || { date, _isEmpty: true }, { status: 200 });
  } catch (error) {
    console.error("GET OperationLog Error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

/**
 * POST /api/operation-log
 * Upserts the operation log for the given date.
 * Also syncs key values into the DashboardData singleton.
 */
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role === "pending") {
      return NextResponse.json({ message: "Unauthorized." }, { status: 403 });
    }

    const body = await req.json();
    const { date, _id, __v, ...fields } = body;

    if (!date) {
      return NextResponse.json({ message: "date is required" }, { status: 400 });
    }

    await dbConnect();

    const record = await OperationLog.findOneAndUpdate(
      { date },
      { $set: { date, ...fields } },
      { new: true, upsert: true }
    );

    // ── Sync key values to DashboardData singleton for public dashboard ──
    // Map from new fields → old singleton fields as needed
    const dashboardSync = {};

    // ── U91 ──
    if (fields.u91Feed !== undefined) {
      dashboardSync.u91FeedGasCapacity = (((parseFloat(fields.u91Feed) || 0) / 600) * 100).toFixed(1);
    }
    if (fields.u91AcidGasToSRU !== undefined) dashboardSync.u93AcidGasTotal = fields.u91AcidGasToSRU;

    // ── U92 ──
    if (fields.u92Feed !== undefined) {
      dashboardSync.u92TreatedGas = (((parseFloat(fields.u92Feed) || 0) / 506) * 100).toFixed(1);
    }
    if (fields.u92FuelGas !== undefined) dashboardSync.u92GasToFuel = fields.u92FuelGas;
    if (fields.u92LpgTo47T103 !== undefined) dashboardSync.u92LpgProduct = fields.u92LpgTo47T103;
    if (fields.u92Condensate !== undefined) dashboardSync.u92Condensate = fields.u92Condensate;

    // ── U93 ──
    if (fields.u93Feed !== undefined) {
      dashboardSync.u93Capacity = (((parseFloat(fields.u93Feed) || 0) / 84) * 100).toFixed(1);
      dashboardSync.sulfurProduction = fields.u93Feed;
    }
    if (fields.u93T401LevelMm !== undefined && fields.u93T402LevelMm !== undefined) {
      const t401 = parseFloat(fields.u93T401LevelMm) || 0;
      const t402 = parseFloat(fields.u93T402LevelMm) || 0;
      const inventory = (t401 * 0.0884881043745203) + (t402 * 0.0884877754301238);
      dashboardSync.sulfurInventory = inventory.toFixed(2);
    }

    // ── U94 ──
    if (fields.u94TempThermox !== undefined) dashboardSync.u94ThermoxTemp = fields.u94TempThermox;

    // ── IPAL (Unit 47) ──
    if (fields.u47SwsFeed !== undefined && fields.u47DesalterFeed !== undefined) {
      const feed = (parseFloat(fields.u47SwsFeed) || 0) + (parseFloat(fields.u47DesalterFeed) || 0);
      dashboardSync.ipalCapacity = ((feed / 167) * 100).toFixed(1);
    }
    if (fields.u47AerationAph !== undefined) dashboardSync.ipalPhA = fields.u47AerationAph;
    if (fields.u47AerationAmlss !== undefined) dashboardSync.ipalMlssA = fields.u47AerationAmlss;
    if (fields.u47AerationBph !== undefined) dashboardSync.ipalPhB = fields.u47AerationBph;
    if (fields.u47AerationBmlss !== undefined) dashboardSync.ipalMlssB = fields.u47AerationBmlss;

    // ── WWT (Unit 166) ──
    if (fields.u166Feed !== undefined) {
      dashboardSync.wwtCapacity = (((parseFloat(fields.u166Feed) || 0) / 76) * 100).toFixed(1);
    }
    if (fields.u166AerationPh !== undefined) dashboardSync.wwtPhPit = fields.u166AerationPh;
    if (fields.u166AerationMlss !== undefined) dashboardSync.wwtMlssPit = fields.u166AerationMlss;

    // ── HB 49/66 — aggregate worst condition ──
    const hbFields = [fields.hb49Condition, fields.hb66TimurCondition, fields.hb66BaratCondition];
    if (hbFields.some(c => c !== undefined)) {
      const hasDirty = hbFields.some(c => c === 'Dirty');
      const hasLittle = hbFields.some(c => c === 'Little Dirty');
      const hasCleaning = hbFields.some(c => c === 'Cleaning');
      dashboardSync.hbStatus = hasDirty ? 'danger' : hasCleaning ? 'cleaning' : hasLittle ? 'warn' : 'clean';
    }

    if (Object.keys(dashboardSync).length > 0) {
      await DashboardData.findOneAndUpdate(
        { key: "singleton" },
        { $set: dashboardSync },
        { upsert: true }
      );
    }

    return NextResponse.json(record, { status: 200 });
  } catch (error) {
    console.error("POST OperationLog Error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
