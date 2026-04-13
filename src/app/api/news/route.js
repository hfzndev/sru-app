import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import News from "@/models/News";

export async function GET() {
  try {
    await dbConnect();
    const newsArticles = await News.find({}).sort({ createdAt: -1 });
    return NextResponse.json(newsArticles, { status: 200 });
  } catch (error) {
    console.error("GET News Error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role === "pending") {
      return NextResponse.json({ message: "Unauthorized. Admin only." }, { status: 403 });
    }

    const { title, excerpt, category, content, date } = await req.json();

    if (!title || !excerpt || !category || !content || !date) {
      return NextResponse.json({ message: "All fields are required." }, { status: 400 });
    }

    await dbConnect();
    const newArticle = await News.create({ title, excerpt, category, content, date });

    return NextResponse.json(newArticle, { status: 201 });
  } catch (error) {
    console.error("POST News Error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
