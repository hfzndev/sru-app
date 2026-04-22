import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import StockCategory from "@/models/StockCategory";



export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    await dbConnect();
    let categories = await StockCategory.find({});



    return NextResponse.json(categories, { status: 200 });
  } catch (error) {
    console.error("GET Stock Error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role === "pending") {
      return NextResponse.json({ message: "Unauthorized. Admin only." }, { status: 403 });
    }

    const { categoryId, itemId, amount, action } = await req.json();

    if (!categoryId || !itemId || isNaN(amount)) {
      return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
    }

    const amt = parseFloat(amount);
    if (amt < 0) {
      return NextResponse.json({ message: "Amount cannot be negative." }, { status: 400 });
    }

    await dbConnect();
    const category = await StockCategory.findOne({ categoryId: categoryId });
    
    if (!category) {
      return NextResponse.json({ message: "Category not found." }, { status: 404 });
    }

    const item = category.items.find(i => i.id === itemId);
    if (!item) {
      return NextResponse.json({ message: "Item not found." }, { status: 404 });
    }

    // Mathematical update
    if (action === "set") {
      item.qty = amt;
    } else if (action === "add") {
      item.qty += amt;
    } else if (action === "reduce") {
      item.qty = Math.max(0, item.qty - amt);
    }

    await category.save();

    return NextResponse.json(category, { status: 200 });

  } catch (error) {
    console.error("PUT Stock Error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
