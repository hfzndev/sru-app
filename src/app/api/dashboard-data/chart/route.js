import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import OperationLog from "@/models/OperationLog";

const T401_FACTOR = 0.0884881043745203;
const T402_FACTOR = 0.0884877754301238;

/**
 * GET /api/dashboard-data/chart
 * Returns last 7 days of OperationLog aggregated for dashboard charts.
 * Response shape:
 * {
 *   tankTrend:    [{ day, t401, t402 }, ...],   // sulfur tank levels in ton
 *   sulfurDaily:  [{ day, prod }, ...],           // u93Feed ton/day
 * }
 */
export async function GET() {
  try {
    await dbConnect();

    const records = await OperationLog.find()
      .sort({ date: -1 })
      .limit(7)
      .lean();

    // Reverse so oldest → newest (left to right on charts)
    const sorted = records.reverse();

    const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const tankTrend = sorted.map((r) => {
      const dateObj = new Date(r.date + "T00:00:00+07:00");
      const day = DAY_LABELS[dateObj.getDay()];
      const t401 = parseFloat(r.u93T401LevelMm) || 0;
      const t402 = parseFloat(r.u93T402LevelMm) || 0;
      return {
        day,
        t401: parseFloat((t401 * T401_FACTOR).toFixed(2)),
        t402: parseFloat((t402 * T402_FACTOR).toFixed(2)),
      };
    });

    const sulfurDaily = sorted.map((r) => {
      const dateObj = new Date(r.date + "T00:00:00+07:00");
      const day = DAY_LABELS[dateObj.getDay()];
      return {
        day,
        prod: parseFloat(r.u93Feed) || 0,
      };
    });

    return NextResponse.json({ tankTrend, sulfurDaily }, { status: 200 });
  } catch (error) {
    console.error("GET /api/dashboard-data/chart Error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
