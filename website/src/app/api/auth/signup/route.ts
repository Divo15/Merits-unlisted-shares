import { NextRequest, NextResponse } from "next/server";

const DJANGO_API = process.env.NEXT_PUBLIC_DJANGO_API || "http://localhost:8000";

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "").replace(/^0+/, "").replace(/^91/, "").slice(-10);
  return digits.length === 10 ? `+91${digits}` : "";
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, phone, password, confirm_password } = body;

  const djangoRes = await fetch(`${DJANGO_API}/api/auth/register/step1/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, phone, password, confirm_password }),
  });

  const data = await djangoRes.json();

  if (djangoRes.ok) {
    const cleanPhone = normalizePhone(phone || "");
    const nameParts = email.split("@")[0].split(/[._-]/);
    const firstName = nameParts[0] || email.split("@")[0];
    const lastName = nameParts.slice(1).join(" ") || "-";

    fetch("https://api.kylas.io/v1/leads/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.KYLAS_API_KEY!,
      },
      body: JSON.stringify({
        firstName,
        lastName,
        emails: [{ type: "OFFICE", value: email }],
        phoneNumbers: cleanPhone ? [{ type: "MOBILE", value: cleanPhone, code: "+91" }] : [],
        description: "New user registration on Unlisted Merits Pre-IPO platform",
        customFieldValues: {
          cfKycStatus: "Pending",
        },
      }),
    }).catch((err) => console.error("Kylas signup lead error:", err));
  }

  return NextResponse.json(data, { status: djangoRes.status });
}
