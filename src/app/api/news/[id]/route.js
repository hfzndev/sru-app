import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import News from "@/models/News";

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    await dbConnect();
    const article = await News.findById(id);
    if (!article) {
      return NextResponse.json({ message: "Article not found" }, { status: 404 });
    }
    return NextResponse.json(article, { status: 200 });
  } catch (error) {
    console.error("GET News ID Error:", error);
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
    const updatedArticle = await News.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedArticle) {
      return NextResponse.json({ message: "Article not found" }, { status: 404 });
    }

    return NextResponse.json(updatedArticle, { status: 200 });
  } catch (error) {
    console.error("PUT News Error:", error);
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
    const deletedArticle = await News.findByIdAndDelete(id);

    if (!deletedArticle) {
      return NextResponse.json({ message: "Article not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Article deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("DELETE News Error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
