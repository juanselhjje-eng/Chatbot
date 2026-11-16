# Black Ops Paintball — WhatsApp Bot

Independent WhatsApp chatbot. It does not depend on the former Black Ops website.

## Current scope

- Express/Node.js webhook for Meta WhatsApp Cloud API.
- Webhook verification challenge.
- Optional Meta webhook signature validation when `WHATSAPP_APP_SECRET` is configured.
- Incoming text message parsing and outgoing text replies.
- Optional OpenRouter integration. Without AI credentials, the bot uses a safe fallback.
- Business facts are environment variables and must be supplied/approved by Black Ops.
- The bot never confirms a booking, availability, or payment.

## Requirements

- Node.js 20 or newer.
- A WhatsApp Business Platform setup owned by Black Ops.
- A public HTTPS URL for the webhook when deployed.
- Optional OpenRouter API key and model. A free model may have usage limits and availability changes.

## Run locally

1. Copy `.env.example` to `.env`.
2. Set `WHATSAPP_VERIFY_TOKEN` to a long random value.
3. Run `npm install`.
4. Run `npm test`.
5. Run `npm run dev`.
6. Open `http://localhost:3000/health`.

The local server cannot receive Meta webhooks until it is exposed through a secure public HTTPS tunnel or deployed to a host.

## Deploy to Render

Create a **Web Service** from this repository:

- Runtime: Node
- Build command: `npm install`
- Start command: `npm start`
- Health check path: `/health`

Add environment variables in Render's dashboard. Do not commit `.env` or tokens.

Render's free service may sleep after inactivity and is not a production uptime guarantee. Confirm current limits and pricing before promising 24/7 service.

## Meta setup — business owner must do this

The business owner should create/use their own Meta Business Portfolio and own the WhatsApp business assets. Do not ask them to send passwords, 2FA codes, or access tokens over chat.

1. Confirm whether the business has a WhatsApp Business number and whether it can be registered on the WhatsApp Business Platform. Moving an existing number can affect its use in the WhatsApp Business app; check Meta's current coexistence/migration eligibility before proceeding.
2. The owner creates or accesses Meta for Developers and creates a business-type app.
3. Add the WhatsApp product and complete Meta's setup/onboarding.
4. Use Meta's test number first. Add the developer's test recipient and verify it as required by Meta.
5. Configure the webhook callback URL as `https://YOUR-SERVICE.onrender.com/webhook`.
6. Set the same `WHATSAPP_VERIFY_TOKEN` value in Render and in Meta's webhook setup.
7. Subscribe the WhatsApp Business Account to the `messages` webhook field.
8. For production, configure a business-owned permanent/system-user access token with the minimum required permissions and the production phone number ID. Store it only as `WHATSAPP_ACCESS_TOKEN` in Render.
9. Set `WHATSAPP_APP_SECRET` in Render so incoming webhook signatures are validated.
10. Complete any business verification, display-name review, payment method, and messaging-limit steps Meta requires.

Meta changes its onboarding screens, permissions, pricing and eligibility. Follow the current instructions in Meta's official documentation and dashboard.

## Environment variables

See `.env.example`. Business information must be provided by Black Ops and verified before being used by the AI.

## Important production work still required

This repository is a working integration starter, not a finished booking platform. Before real customer launch:

- Add persistent database-backed message deduplication and conversation history.
- Add admin handoff and a secure way for staff to manage conversations.
- Add booking workflow only after the owner confirms rules, opening hours, prices, capacity and cancellation policy.
- Add rate limiting, monitoring, structured logs, privacy notice, data-retention rules and backup strategy.
- Test inbound and outbound messages with the business-owned number.
- Confirm current Meta message pricing and any provider charges with the owner.

## Cost ownership

The business should own and pay for its Meta, hosting, database and AI accounts. Start with free tiers for testing only. Do not use a developer's personal payment method or promise unlimited free usage.
