import "dotenv/config";
import express from "express";
import { loadConfig } from "./config.js";
import {
  extractIncomingMessages,
  sendWhatsAppText,
  verifyMetaSignature
} from "./whatsapp.js";
import { createReply } from "./assistant.js";

const config = loadConfig();
const app = express();

// Keep the raw body so Meta's webhook signature can be checked.
app.use("/webhook", express.raw({ type: "application/json", limit: "1mb" }));
app.use(express.json({ limit: "1mb" }));

app.get("/", (_req, res) => {
  res.json({
    name: "Black Ops Paintball WhatsApp Bot",
    status: "online",
    note: "Independent WhatsApp integration"
  });
});

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "healthy" });
});

app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === config.verifyToken && typeof challenge === "string") {
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

app.post("/webhook", (req, res) => {
  const rawBody = req.body;
  const signature = req.get("x-hub-signature-256");

  if (!Buffer.isBuffer(rawBody)) return res.sendStatus(400);
  if (!verifyMetaSignature(rawBody, signature, config.appSecret)) {
    return res.sendStatus(401);
  }

  let payload;
  try {
    payload = JSON.parse(rawBody.toString("utf8"));
  } catch {
    return res.sendStatus(400);
  }

  // Acknowledge Meta quickly; process messages after returning HTTP 200.
  res.sendStatus(200);

  if (payload.object !== "whatsapp_business_account") return;

  const messages = extractIncomingMessages(payload);
  for (const message of messages) {
    if (!message.from || !message.id) continue;
    void handleMessage(message).catch((error) => {
      console.error("Message processing failed:", error.message);
    });
  }
});

const seenMessageIds = new Set();

async function handleMessage(message) {
  // Basic in-process duplicate protection. Use persistent storage before production.
  if (seenMessageIds.has(message.id)) return;
  seenMessageIds.add(message.id);
  if (seenMessageIds.size > 5000) {
    const oldest = seenMessageIds.values().next().value;
    seenMessageIds.delete(oldest);
  }

  let reply;
  if (message.type !== "text" || !message.text) {
    reply = "Por ahora puedo procesar mensajes de texto. Un integrante del equipo puede ayudarte con este mensaje.";
  } else {
    try {
      reply = await createReply({ text: message.text, config });
    } catch (error) {
      console.error("Assistant error:", error.message);
      reply = "En este momento no pude procesar tu consulta. Un integrante del equipo de Black Ops debe ayudarte. Por favor, vuelve a escribirnos en unos minutos.";
    }
  }

  await sendWhatsAppText({
    ...whatsappOptions(),
    to: message.from,
    text: reply
  });
}

function whatsappOptions() {
  return {
    accessToken: config.accessToken,
    phoneNumberId: config.phoneNumberId,
    apiVersion: config.graphApiVersion
  };
}

const server = app.listen(config.port, "0.0.0.0", () => {
  console.log(`Black Ops WhatsApp Bot listening on port ${config.port}`);
});

function shutdown() {
  server.close(() => process.exit(0));
}
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
