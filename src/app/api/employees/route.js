import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import Employee from "@/models/Employee";

export async function GET() {
  try {
    await dbConnect();
    const employees = await Employee.find({}).sort({ createdAt: -1 });
    return NextResponse.json(employees, { status: 200 });
  } catch (error) {
    console.error("GET Employees Error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role === "pending") {
      return NextResponse.json({ message: "Unauthorized. Admin only." }, { status: 403 });
    }

    const { name, crew, role, years, bio, imageBase64 } = await req.json();

    if (!name || !crew || !role || typeof years !== 'number' || !bio) {
      return NextResponse.json({ message: "Missing required fields." }, { status: 400 });
    }

    await dbConnect();
    const newEmployee = await Employee.create({ name, crew, role, years, bio, imageBase64 });

    return NextResponse.json(newEmployee, { status: 201 });
  } catch (error) {
    console.error("POST Employee Error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
