import { NextResponse } from "next/server";
import { getTransmissions, saveTransmission, deleteTransmission } from "@/lib/transmissions";

const ADMIN_PASSWORD = "ring01102";

export async function GET() {
  const list = getTransmissions();
  return NextResponse.json(list);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { password, content, tag } = body;

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: "UNAUTHORIZED_KEY" }, { status: 401 });
    }

    if (!content || typeof content !== "string" || !content.trim()) {
      return NextResponse.json({ error: "EMPTY_CONTENT" }, { status: 400 });
    }

    const created = saveTransmission(content, tag || "LOG");
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { password, id } = body;

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: "UNAUTHORIZED_KEY" }, { status: 401 });
    }

    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "INVALID_ID" }, { status: 400 });
    }

    const ok = deleteTransmission(id);
    if (!ok) {
      return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
