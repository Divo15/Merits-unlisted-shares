import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { name, phone, email, stockName, ticker, intention } = await req.json();

    const nameParts = name.trim().split(/\s+/);
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ") || "-";

    const digits = phone ? phone.replace(/\D/g, "").replace(/^0+/, "").replace(/^91/, "").slice(-10) : "";
    const cleanPhone = digits.length === 10 ? `+91${digits}` : "";

    const leadPayload = {
      firstName,
      lastName: `${lastName} | ${ticker} - ${intention}`,
      emails: [{ type: "OFFICE", value: email }],
      phoneNumbers: cleanPhone ? [{ type: "MOBILE", value: cleanPhone }] : [],
      description: `${intention} enquiry for ${stockName} (${ticker})`,
    };

    const response = await fetch("https://api.kylas.io/v1/leads/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.KYLAS_API_KEY!,
      },
      body: JSON.stringify(leadPayload),
    });

    const result = await response.json();

    if (response.ok || result?.code === "002020") {
      return NextResponse.json({ success: true });
    } else {
      console.error("Kylas API error:", JSON.stringify(result));
      return NextResponse.json({ success: false, error: "Something went wrong. Please try again." }, { status: 500 });
    }
  } catch (err) {
    console.error("Enquiry route error:", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
