import { NextRequest, NextResponse } from "next/server";

const DJANGO_API = process.env.NEXT_PUBLIC_DJANGO_API || "http://localhost:8000";

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "").replace(/^0+/, "").replace(/^91/, "").slice(-10);
  return digits.length === 10 ? `+91${digits}` : "";
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("Authorization") || "";
  const formData = await req.formData();

  const panName     = (formData.get("pan_name")         as string) || "";
  const panNumber   = (formData.get("pan_number")        as string) || "";
  const city        = (formData.get("city")              as string) || "";
  const state       = (formData.get("state")             as string) || "";
  const email       = (formData.get("_crm_email")        as string) || "";
  const phone       = (formData.get("_crm_phone")        as string) || "";
  const accountType = (formData.get("_crm_account_type") as string) || "";

  formData.delete("_crm_email");
  formData.delete("_crm_phone");
  formData.delete("_crm_account_type");

  const djangoRes = await fetch(`${DJANGO_API}/api/auth/register/step3/`, {
    method: "POST",
    headers: { Authorization: authHeader },
    body: formData,
  });

  const data = await djangoRes.json();

  if (djangoRes.ok && panName) {
    const nameParts = panName.trim().split(/\s+/);
    const firstName = nameParts[0];
    const lastName  = nameParts.slice(1).join(" ") || "-";
    const cleanPhone = normalizePhone(phone);

    fetch("https://api.kylas.io/v1/leads/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.KYLAS_API_KEY!,
      },
      body: JSON.stringify({
        firstName,
        lastName,
        emails: email ? [{ type: "OFFICE", value: email }] : [],
        phoneNumbers: cleanPhone ? [{ type: "MOBILE", value: cleanPhone, code: "+91" }] : [],
        description: "KYC submitted on Meritspe Pre-IPO platform",
        ...(city  && { city }),
        ...(state && { state }),
        customFieldValues: {
          cfPanNumber:   panNumber   || undefined,
          cfAccountType: accountType || undefined,
          cfKycStatus:   "Submitted",
        },
      }),
    }).catch((err) => console.error("Kylas KYC lead error:", err));
  }

  return NextResponse.json(data, { status: djangoRes.status });
}
