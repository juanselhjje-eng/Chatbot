# Black Ops Paintball — WhatsApp Bot

Independent WhatsApp chatbot. It does not depend on the former Black Ops website.

## Current implementation

- Node.js 20+ and Express server.
- Meta WhatsApp Cloud API webhook verification.
- Incoming webhook signature validation when the Meta App Secret is configured (required in production).
- Incoming text message parsing and outgoing WhatsApp text replies.
- Optional OpenRouter AI integration; without AI credentials, a safe fallback response is used.
- Duplicate-message protection in process memory (not persistent yet).
- Business facts are supplied through environment variables and must be confirmed by Black Ops.
- The assistant must not invent prices, opening hours, location or availability.
- The bot does not confirm reservations, available slots or payments.

## Important status

This is the first integration version, **not yet a finished production chatbot**. It has not been connected to Black Ops' phone number or tested with the business account. It does not yet have a persistent database, reservation engine, staff inbox or automatic payment verification.

## Requirements

- Node.js 20 or newer.
- A WhatsApp Business Platform account and phone number owned by Black Ops.
- A public HTTPS URL for the webhook after deployment.
- Optional OpenRouter API key and model. Free models may have rate limits, availability changes and no uptime guarantee.

## Run locally

1. Copy `.env.example` to `.env`.
2. Set `WHATSAPP_VERIFY_TOKEN` to a long random value.
3. Run `npm install`.
4. Run `npm test`.
5. Run `npm run dev`.
6. Open `http://localhost:3000/health`.

The local server cannot receive Meta webhooks until it is exposed through a secure public HTTPS endpoint or deployed to a host.

## Deploy to Render for testing

Create a **Web Service** from this repository:

- Runtime: Node
- Build command: `npm install`
- Start command: `npm start`
- Health check path: `/health`

Add environment variables in Render's dashboard. Never commit `.env`, access tokens, App Secrets or API keys.

Render's free service may sleep after inactivity and is not a production uptime guarantee. Do not promise continuous 24/7 response on the free plan. Confirm current limits and pricing before launch.

## What Black Ops must provide

Ask the business owner for the following information and approvals:

### Business information
- Exact legal/business name and public display name.
- City, full address and a Google Maps pin/link.
- Opening days and hours, including holidays.
- Current prices, packages, what each package includes and any extra charges.
- Minimum/maximum group size and age restrictions/policies, if applicable.
- Reservation rules: required deposit, cancellation, rescheduling, late arrivals and refund policy.
- How staff should handle requests for a human, complaints and urgent issues.
- Which person/team receives reservation requests and during what hours.

Do not invent or infer any of these facts. The owner must approve the final answers before customers use the bot.

### WhatsApp and Meta access
- Confirm whether the business has a WhatsApp Business app number or a number not yet used on WhatsApp.
- Confirm who owns/administers the Meta Business Portfolio.
- The business owner must approve the official WhatsApp Business Platform connection and any number registration.
- The owner should invite the developer through Meta's role/asset access controls, or complete setup while signed in themselves. Do not ask for their Facebook password, SMS code, two-factor code or access token in chat.
- If they want to keep using the same number in the WhatsApp Business mobile app, first check Meta's current **Coexistence** eligibility and onboarding flow. Do not delete the app, deregister the number or start a migration until the owner has reviewed the effect and approved it.

## Meta setup sequence

1. The owner signs in to their own Meta Business Portfolio and Meta for Developers account.
2. Create or select a Meta app owned by the business, then add the WhatsApp product/use case.
3. Start with Meta's test phone number and test recipient. Do not connect the live business number until the test succeeds.
4. Create/deploy this service to obtain its HTTPS URL.
5. In the Meta app's WhatsApp webhook configuration, enter `https://YOUR-SERVICE.onrender.com/webhook` as the callback URL.
6. Enter the exact same value as Render's `WHATSAPP_VERIFY_TOKEN` in Meta's verify-token field.
7. Subscribe the app to the WhatsApp Business Account's `messages` webhook field.
8. Complete the production number onboarding/verification in Meta. Confirm number ownership and the effect on the current WhatsApp Business app before proceeding.
9. Set these values as Render environment variables: `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_APP_SECRET`, `WHATSAPP_VERIFY_TOKEN`, and `WHATSAPP_GRAPH_API_VERSION=v27.0`.
10. Use a business-owned system-user/permanent token with only the permissions needed, following Meta's current instructions. The owner should generate and control it. Store it directly in Render's secret environment settings; never paste it into GitHub, source code or this chat.
11. Test inbound and outbound messages with the owner before enabling customer use.

Meta's setup screens, permissions and eligibility can change. Follow the current official documentation:
- WhatsApp Business Platform: https://developers.facebook.com/documentation/business-messaging/whatsapp/overview
- Get started: https://developers.facebook.com/documentation/business-messaging/whatsapp/get-started/
- Webhooks: https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/
- Existing WhatsApp Business app number / Coexistence: https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/onboarding-business-app-users/
- System-user tokens: https://developers.facebook.com/docs/business-management-apis/system-users/install-apps-and-generate-tokens/

## Costs — owner must approve and own the accounts

- **GitHub:** free for this private project use case within plan limits.
- **Render:** free tier can be used for a prototype, but the service can sleep and is not suitable to promise 24/7 production uptime.
- **OpenRouter / AI:** can be $0 when a free model is available and within its limits. Limits, models and availability can change. Paid use must be approved and billed to Black Ops.
- **Meta WhatsApp:** not unlimited-free. As of October 1, 2026, Meta's pricing documentation says the first 1,000 delivered service messages per business phone number per month are free; service messages after that may be charged. Business-initiated template messages (marketing, utility or authentication) have market/category rates. Messages sent by customers to the business are not charged by Meta. The exact rate depends on the recipient's country code and message category; check the current Colombia rate card in the owner's WhatsApp Manager before activating billing.
- **Database:** no database is connected in this first version. A database service may be added later; any paid tier must be approved and owned by Black Ops.

Never add your personal payment method or promise that production operation will always cost $0. The business should own its Meta, hosting and AI accounts and pay any approved usage charges directly.

## Work still required before production

- Add persistent database-backed message deduplication and conversation history.
- Add staff handoff and a secure staff inbox/notification process.
- Build a reservation workflow only after the owner confirms prices, capacity, schedules, deposit and cancellation rules.
- Add privacy notice, data-retention/deletion process, rate limiting, monitoring and structured logs.
- Add proper handling for images, audio, location, interactive replies and delivery-status webhooks if required.
- Test with Meta's test number, then the business-owned number.
- Confirm the latest Meta pricing and all hosting/AI charges with the owner before launch.
