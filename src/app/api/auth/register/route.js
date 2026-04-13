import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ message: "Username and password are required." }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ message: "Password must be at least 6 characters long." }, { status: 400 });
    }

    await dbConnect();

    // Check if user exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return NextResponse.json({ message: "Username automatically rejected. Please choose another." }, { status: 400 });
    }

    // Hash password and save with 'pending' status
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({
      username,
      password: hashedPassword,
      role: "pending" // Safely defaults to pending
    });

    return NextResponse.json({ message: "Account created and pending approval." }, { status: 201 });
    
  } catch (error) {
    console.error("Registration Error:", error);
    return NextResponse.json({ message: "An error occurred during registration." }, { status: 500 });
  }
}
