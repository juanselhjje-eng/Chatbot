import crypto from "node:crypto";

export function verifyMetaSignature(rawBody, signatureHeader, appSecret) {
  if (!appSecret) return process.env.NODE_ENV !== "production";
  if (!signatureHeader || !signatureHeader.startsWith("sha256=")) return false;

  const expected = crypto
    .createHmac("sha256", appSecret)
    .update(rawBody)
    .digest("hex");
  const received = signatureHeader.slice("sha256=".length);

  if (received.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(received), Buffer.from(expected));
}

export function extractIncomingMessages(payload) {
  const messages = [];
  for (const entry of payload?.entry || []) {
    for (const change of entry?.changes || []) {
      const value = change?.value;
      for (const message of value?.messages || []) {
        messages.push({
          id: message.id,
          from: message.from,
          type: message.type,
          text: message.text?.body || "",
          timestamp: message.timestamp
        });
      }
    }
  }
  return messages;
}

export async function sendWhatsAppText({ accessToken, phoneNumberId, apiVersion, to, text }) {
  if (!accessToken || !phoneNumberId) {
    throw new Error("WhatsApp credentials are not configured.");
  }

  const response = await fetch(
    `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to,
        type: "text",
        text: { preview_url: false, body: text }
      }),
      signal: AbortSignal.timeout(15000)
    }
  );

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`WhatsApp API error ${response.status}: ${JSON.stringify(result)}`);
  }
  return result;
}
