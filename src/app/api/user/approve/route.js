import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "superadmin") {
      return NextResponse.json({ message: "Unauthorized. Superadmin only." }, { status: 403 });
    }

    const { userId, action } = await req.json();

    if (!userId || !action) {
      return NextResponse.json({ message: "userId and action are required." }, { status: 400 });
    }

    await dbConnect();

    if (action === "approve") {
      await User.findByIdAndUpdate(userId, { role: "admin" });
      return NextResponse.json({ message: "User approved as admin." }, { status: 200 });
    } 
    
    if (action === "reject") {
      await User.findByIdAndDelete(userId);
      return NextResponse.json({ message: "User application rejected and removed." }, { status: 200 });
    }

    return NextResponse.json({ message: "Invalid action." }, { status: 400 });

  } catch (error) {
    console.error("Approval Error:", error);
    return NextResponse.json({ message: "An error occurred." }, { status: 500 });
  }
}
