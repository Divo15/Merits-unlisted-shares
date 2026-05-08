import { NextRequest, NextResponse } from "next/server";

const DJANGO = process.env.NEXT_PUBLIC_DJANGO_API!;

async function getDjangoToken(): Promise<string | null> {
  try {
    const res = await fetch(`${DJANGO}/api/auth/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: process.env.DJANGO_ADMIN_EMAIL,
        password: process.env.DJANGO_ADMIN_PASS,
      }),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.access ?? null;
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const res = await fetch(`${DJANGO}/api/stocks/`, { cache: "no-store" });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch stocks" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const token = await getDjangoToken();
  if (!token) return NextResponse.json({ error: "Admin auth failed — check DJANGO_ADMIN_EMAIL / DJANGO_ADMIN_PASS in .env.local" }, { status: 401 });

  const body = await req.json();
  const res = await fetch(`${DJANGO}/api/stocks/admin/create/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function PUT(req: NextRequest) {
  const token = await getDjangoToken();
  if (!token) return NextResponse.json({ error: "Admin auth failed" }, { status: 401 });

  const body = await req.json();
  const { id, ...rest } = body;
  const res = await fetch(`${DJANGO}/api/stocks/admin/${id}/update/`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(rest),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function DELETE(req: NextRequest) {
  const token = await getDjangoToken();
  if (!token) return NextResponse.json({ error: "Admin auth failed" }, { status: 401 });

  const id = req.nextUrl.searchParams.get("id");
  const res = await fetch(`${DJANGO}/api/stocks/admin/${id}/delete/`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 204) return NextResponse.json({ success: true });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
