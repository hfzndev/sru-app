import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import AppConfig from "@/models/AppConfig";
import { calculateShiftState } from "@/lib/shiftEngine";

export async function GET(req) {
  try {
    await dbConnect();
    
    // Check if target date is requested, otherwise default to today (forced to UTC+7 WIB for Indonesia)
    const url = new URL(req.url);
    const dateParam = url.searchParams.get('date');
    const now = new Date();
    const wibTime = new Date(now.getTime() + 7 * 60 * 60 * 1000); // Add 7 hours for UTC+7
    const targetDate = dateParam || wibTime.toISOString().split('T')[0];

    // Fetch master config or fallback to user default
    let config = await AppConfig.findOne({ key: 'shift_calibrator' });
    
    if (!config) {
      // Create the default anchor based on user specifications:
      // "13 April 2026 is Shift A second night shift" 
      // Second night = index 5
      const defaultConfig = {
        anchorDate: '2026-04-13',
        crewAAnchorIndex: 5 
      };
      config = await AppConfig.create({ key: 'shift_calibrator', value: defaultConfig });
    }

    const { anchorDate, crewAAnchorIndex } = config.value;
    
    const status = calculateShiftState(anchorDate, crewAAnchorIndex, targetDate);

    return NextResponse.json(status, { status: 200 });

  } catch (error) {
    console.error("Shift API Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    await dbConnect();
    const body = await req.json();

    if (!body.anchorDate || typeof body.crewAAnchorIndex !== 'number') {
       return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
    }

    await AppConfig.findOneAndUpdate(
      { key: 'shift_calibrator' },
      { value: { anchorDate: body.anchorDate, crewAAnchorIndex: body.crewAAnchorIndex } },
      { upsert: true }
    );

    return NextResponse.json({ message: "Shift Anchor Calibrated" }, { status: 200 });
  } catch (error) {
    console.error("Shift Update Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
