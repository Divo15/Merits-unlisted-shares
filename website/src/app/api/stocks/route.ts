import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_DJANGO_API}/api/stocks/`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Django returned ${res.status}`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("Failed to fetch from Django:", err);
    return NextResponse.json({ error: "Failed to fetch stocks" }, { status: 500 });
  }
}
