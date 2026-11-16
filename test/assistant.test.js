import test from "node:test";
import assert from "node:assert/strict";
import { extractIncomingMessages, verifyMetaSignature } from "../src/whatsapp.js";
import crypto from "node:crypto";

test("extracts text messages from a WhatsApp webhook payload", () => {
  const messages = extractIncomingMessages({
    entry: [{
      changes: [{
        value: {
          messages: [{
            id: "wamid.test",
            from: "573000000000",
            type: "text",
            text: { body: "Hola" },
            timestamp: "123"
          }]
        }
      }]
    }]
  });

  assert.equal(messages.length, 1);
  assert.equal(messages[0].text, "Hola");
});

test("validates Meta webhook signatures", () => {
  const body = Buffer.from('{"hello":"world"}');
  const secret = "test-secret";
  const digest = crypto.createHmac("sha256", secret).update(body).digest("hex");
  assert.equal(verifyMetaSignature(body, `sha256=${digest}`, secret), true);
  assert.equal(verifyMetaSignature(body, "sha256=wrong", secret), false);
});
