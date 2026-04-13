import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 403 });
    }

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ message: "Both fields are required." }, { status: 400 });
    }

    await dbConnect();

    // Fetch user from db
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return NextResponse.json({ message: "Incorrect current password." }, { status: 400 });
    }

    const hashedNew = await bcrypt.hash(newPassword, 10);
    user.password = hashedNew;
    await user.save();

    return NextResponse.json({ message: "Password updated successfully." }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "An error occurred." }, { status: 500 });
  }
}
