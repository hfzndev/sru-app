import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Employee from "@/models/Employee";

export async function GET() {
  try {
    await dbConnect();
    
    // Fetch all employees consistently sorted by _id so the order is fixed
    const employees = await Employee.find({}).sort({ _id: 1 });
    
    if (employees.length === 0) {
      return NextResponse.json(null, { status: 200 }); // Handle empty gracefully
    }

    // Mathematical rotation to pick one featured profile a day
    // Using UTC+7 (WIB) normalization to stay consistent for Indonesian users
    const now = new Date();
    const wibTime = new Date(now.getTime() + 7 * 60 * 60 * 1000); 
    
    const start = new Date(wibTime.getFullYear(), 0, 0);
    const dayOfYear = Math.floor((wibTime - start) / 86400000);
    
    const featuredEmployee = employees[dayOfYear % employees.length];

    return NextResponse.json(featuredEmployee, { status: 200 });
  } catch (error) {
    console.error("GET Daily Employee Error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
