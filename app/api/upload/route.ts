import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

function getCloudinaryConfig() {
  const config = cloudinary.config();
  return {
    cloudName: config.cloud_name,
    apiKey: config.api_key,
    apiSecret: config.api_secret,
  };
}

function signCloudinaryParams(params: Record<string, string>, apiSecret: string) {
  const payload = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  return crypto.createHash("sha1").update(`${payload}${apiSecret}`).digest("hex");
}

async function getCloudinaryErrorMessage(response: Response) {
  const text = await response.text();

  try {
    const json = JSON.parse(text) as { error?: { message?: string } };
    return json.error?.message || text || response.statusText;
  } catch {
    return text || response.statusText;
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        { error: "Upload failed", details: "Cloudinary configuration is missing" },
        { status: 500 }
      );
    }

    const timestamp = Math.round(Date.now() / 1000).toString();
    const uploadParams = {
      folder: "nammaqa",
      timestamp,
    };
    const signature = signCloudinaryParams(uploadParams, apiSecret);
    const uploadFormData = new FormData();

    uploadFormData.set("file", file);
    uploadFormData.set("api_key", apiKey);
    uploadFormData.set("timestamp", timestamp);
    uploadFormData.set("folder", uploadParams.folder);
    uploadFormData.set("signature", signature);

    const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: uploadFormData,
    });

    if (!uploadResponse.ok) {
      const details = await getCloudinaryErrorMessage(uploadResponse);
      console.error("Cloudinary upload rejected:", {
        status: uploadResponse.status,
        details,
      });

      return NextResponse.json(
        { error: "Upload failed", details },
        { status: uploadResponse.status }
      );
    }

    const uploadResult = await uploadResponse.json();
    return NextResponse.json(uploadResult, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Cloudinary upload failed";
    console.error("Cloudinary upload error:", error);
    return NextResponse.json({ error: "Upload failed", details: message }, { status: 500 });
  }
}
