import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import DashboardData from "@/models/DashboardData";

export async function GET() {
  try {
    await dbConnect();
    // Use upsert to always return a document even if one hasn't been saved yet
    const data = await DashboardData.findOneAndUpdate(
      { key: "singleton" },
      { $setOnInsert: { key: "singleton" } },
      { new: true, upsert: true }
    );
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("GET DashboardData Error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role === "pending") {
      return NextResponse.json({ message: "Unauthorized. Admin only." }, { status: 403 });
    }

    const body = await req.json();

    await dbConnect();
    const updatedData = await DashboardData.findOneAndUpdate(
      { key: "singleton" },
      { $set: body },
      { new: true, upsert: true }
    );

    return NextResponse.json(updatedData, { status: 200 });
  } catch (error) {
    console.error("POST DashboardData Error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
