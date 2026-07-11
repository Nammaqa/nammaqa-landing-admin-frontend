const whatsappOtpApiBaseUrl = "http://whatsappapi.fastsmsindia.com/wapp/api/send";
const whatsappOtpApiKey = "0cf2fcc194774af088ff5d6c460cfbf8";

export type ContactOtpDeliveryResult = {
  otp: string;
  providerStatus: "sent" | "failed";
  providerHttpStatus: number | null;
  providerResponseText: string;
};

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

export function maskContactOtpApiKey(url: URL) {
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

export async function sendContactOtp(contactNumber: string): Promise<ContactOtpDeliveryResult> {
  const otp = generateOtp();
  const otpUrl = buildWhatsappOtpUrl(contactNumber, otp);
  console.log("Send OTP URL:", otpUrl.toString());
  console.log("Send OTP URL (masked):", maskContactOtpApiKey(otpUrl));

  let providerStatus: ContactOtpDeliveryResult["providerStatus"] = "failed";
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
    providerResponseText = error instanceof Error ? error.message : "Provider request failed";
    console.error("Send OTP provider error:", providerResponseText);
  }

  return {
    otp,
    providerStatus,
    providerHttpStatus,
    providerResponseText,
  };
}
