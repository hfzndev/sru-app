import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "superadmin") {
      return NextResponse.json({ message: "Unauthorized." }, { status: 403 });
    }

    await dbConnect();
    const pendingUsers = await User.find({ role: "pending" }).select('-password');

    return NextResponse.json(pendingUsers, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "An error occurred." }, { status: 500 });
  }
}
