import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import Employee from "@/models/Employee";

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    await dbConnect();
    const employee = await Employee.findById(id);
    if (!employee) {
      return NextResponse.json({ message: "Employee not found" }, { status: 404 });
    }
    return NextResponse.json(employee, { status: 200 });
  } catch (error) {
    console.error("GET Employee ID Error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || session.user.role === "pending") {
      return NextResponse.json({ message: "Unauthorized. Admin only." }, { status: 403 });
    }

    const updateData = await req.json();

    await dbConnect();
    const updatedEmployee = await Employee.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedEmployee) {
       return NextResponse.json({ message: "Employee not found" }, { status: 404 });
    }

    return NextResponse.json(updatedEmployee, { status: 200 });
  } catch (error) {
    console.error("PUT Employee Error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || session.user.role === "pending") {
      return NextResponse.json({ message: "Unauthorized. Admin only." }, { status: 403 });
    }

    await dbConnect();
    const deletedEmployee = await Employee.findByIdAndDelete(id);
    
    if (!deletedEmployee) {
       return NextResponse.json({ message: "Employee not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Employee deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("DELETE Employee Error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
