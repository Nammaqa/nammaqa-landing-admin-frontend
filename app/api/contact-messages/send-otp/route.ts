import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

type ContactMessageRecord = {
  id: number;
  contact_number: string | null;
  otpverified: boolean;
  update(values: Record<string, unknown>): Promise<ContactMessageRecord>;
};

type ContactMessageModel = {
  findByPk(id: string): Promise<ContactMessageRecord | null>;
  findOne(options: unknown): Promise<ContactMessageRecord | null>;
};

const ContactMessage = (db as unknown as { ContactMessage: ContactMessageModel }).ContactMessage;
const whatsappOtpApiBaseUrl = "http://whatsappapi.fastsmsindia.com/wapp/api/send";
const whatsappOtpApiKey = "0cf2fcc194774af088ff5d6c460cfbf8";

function normalizeString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeMobileNumber(value: string) {
  return value.replace(/\D/g, "");
}

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function buildOtpMessage(otp: string) {
  return `Your NammaQA verification OTP is ${otp}.`;
}

function buildWhatsappOtpUrl(contactNumber: string, otp: string) {
  const url = new URL(whatsappOtpApiBaseUrl);
  url.searchParams.set("apikey", whatsappOtpApiKey);
  url.searchParams.set("mobile", normalizeMobileNumber(contactNumber));
  url.searchParams.set("msg", buildOtpMessage(otp));
  return url;
}

function maskApiKey(url: URL) {
  const safeUrl = new URL(url.toString());
  safeUrl.searchParams.set("apikey", "****");
  return safeUrl.toString();
}

function didProviderAcceptMessage(responseText: string) {
  try {
    const response = JSON.parse(responseText) as {
      status?: string;
      statuscode?: number;
    };

    return response.status?.toLowerCase() === "success" || response.statuscode === 200;
  } catch {
    const normalized = responseText.toLowerCase();
    return ["success", "sent", "saved"].some((word) => normalized.includes(word));
  }
}

async function findContactMessage(id: unknown, contactNumber: unknown) {
  const normalizedId = normalizeString(id);
  const normalizedContactNumber = normalizeString(contactNumber);

  if (normalizedId) {
    return ContactMessage.findByPk(normalizedId);
  }

  if (normalizedContactNumber) {
    return ContactMessage.findOne({
      where: { contact_number: normalizedContactNumber },
      order: [["createdAt", "DESC"]],
    });
  }

  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const item = await findContactMessage(body?.id, body?.contact_number);

    if (!item) {
      return NextResponse.json(
        { error: "Contact message not found" },
        { status: 404 }
      );
    }

    if (!item.contact_number) {
      return NextResponse.json(
        { error: "Contact number is required to send OTP" },
        { status: 400 }
      );
    }

    const otp = generateOtp();
    await item.update({ otp, otpverified: false });

    const otpUrl = buildWhatsappOtpUrl(item.contact_number, otp);
    console.log("Send OTP URL:", maskApiKey(otpUrl));

    let providerStatus = "not_sent";
    let providerHttpStatus: number | null = null;
    let providerResponseText = "";

    try {
      const providerResponse = await fetch(otpUrl.toString(), {
        method: "GET",
      });

      providerHttpStatus = providerResponse.status;
      providerResponseText = await providerResponse.text();
      providerStatus = providerResponse.ok && didProviderAcceptMessage(providerResponseText) ? "sent" : "failed";

      console.log("Send OTP provider response:", {
        status: providerHttpStatus,
        body: providerResponseText,
      });
    } catch (error) {
      providerStatus = "failed";
      providerResponseText = error instanceof Error ? error.message : "Provider request failed";
      console.error("Send OTP provider error:", providerResponseText);
    }

    return NextResponse.json({
      message: providerStatus === "sent" ? "OTP generated and sent" : "OTP generated but provider did not confirm delivery",
      providerStatus,
      providerHttpStatus,
      item: {
        id: item.id,
        contact_number: item.contact_number,
        otpverified: false,
      },
      ...(process.env.NODE_ENV !== "production" ? { otp, providerResponse: providerResponseText } : {}),
    }, { status: providerStatus === "sent" ? 200 : 502 });
  } catch {
    return NextResponse.json(
      { error: "Failed to send OTP" },
      { status: 500 }
    );
  }
}

