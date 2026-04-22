import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import OperationLog from "@/models/OperationLog";
import { randomUUID } from "crypto";

/**
 * Highlights are stored on the most recent OperationLog record.
 * They persist across days (not reset) and are carried forward on each daily submit.
 */

function getLatestRecord() {
  return OperationLog.findOne().sort({ date: -1 });
}

// GET /api/operation-log/highlights
export async function GET() {
  try {
    await dbConnect();
    const record = await getLatestRecord();
    return NextResponse.json(record?.highlights || [], { status: 200 });
  } catch (error) {
    console.error("GET Highlights Error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// POST /api/operation-log/highlights  { text: string }
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role === "pending") {
      return NextResponse.json({ message: "Unauthorized." }, { status: 403 });
    }

    const { text } = await req.json();
    if (!text?.trim()) {
      return NextResponse.json({ message: "text is required" }, { status: 400 });
    }

    await dbConnect();
    const newItem = { id: randomUUID(), text: text.trim(), done: false };

    const record = await getLatestRecord();
    if (!record) {
      return NextResponse.json({ message: "No operation log found. Submit one first." }, { status: 404 });
    }

    record.highlights.push(newItem);
    await record.save();

    return NextResponse.json(record.highlights, { status: 200 });
  } catch (error) {
    console.error("POST Highlight Error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// PUT /api/operation-log/highlights  { id, text?, done? }
export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role === "pending") {
      return NextResponse.json({ message: "Unauthorized." }, { status: 403 });
    }

    const { id, text, done } = await req.json();
    if (!id) {
      return NextResponse.json({ message: "id is required" }, { status: 400 });
    }

    await dbConnect();
    const record = await getLatestRecord();
    if (!record) {
      return NextResponse.json({ message: "No record found." }, { status: 404 });
    }

    const item = record.highlights.find(h => h.id === id);
    if (!item) {
      return NextResponse.json({ message: "Highlight not found." }, { status: 404 });
    }

    if (text !== undefined) item.text = text.trim();
    if (done !== undefined) item.done = done;
    record.markModified('highlights');
    await record.save();

    return NextResponse.json(record.highlights, { status: 200 });
  } catch (error) {
    console.error("PUT Highlight Error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// DELETE /api/operation-log/highlights?id=xxx
export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role === "pending") {
      return NextResponse.json({ message: "Unauthorized." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ message: "id is required" }, { status: 400 });
    }

    await dbConnect();
    const record = await getLatestRecord();
    if (!record) {
      return NextResponse.json({ message: "No record found." }, { status: 404 });
    }

    record.highlights = record.highlights.filter(h => h.id !== id);
    record.markModified('highlights');
    await record.save();

    return NextResponse.json(record.highlights, { status: 200 });
  } catch (error) {
    console.error("DELETE Highlight Error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
