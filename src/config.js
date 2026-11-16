const required = ["WHATSAPP_VERIFY_TOKEN"];

export function loadConfig(env = process.env) {
  for (const key of required) {
    if (!env[key]) throw new Error(`Missing required environment variable: ${key}`);
  }

  return {
    port: Number(env.PORT || 3000),
    nodeEnv: env.NODE_ENV || "development",
    verifyToken: env.WHATSAPP_VERIFY_TOKEN,
    accessToken: env.WHATSAPP_ACCESS_TOKEN || "",
    phoneNumberId: env.WHATSAPP_PHONE_NUMBER_ID || "",
    appSecret: env.WHATSAPP_APP_SECRET || "",
    graphApiVersion: env.WHATSAPP_GRAPH_API_VERSION || "v27.0",
    openRouterApiKey: env.OPENROUTER_API_KEY || "",
    openRouterModel: env.OPENROUTER_MODEL || "",
    business: {
      name: env.BUSINESS_NAME || "Black Ops Paintball",
      city: env.BUSINESS_CITY || "",
      address: env.BUSINESS_ADDRESS || "",
      hours: env.BUSINESS_HOURS || "",
      prices: env.BUSINESS_PRICES || "",
      packages: env.BUSINESS_PACKAGES || "",
      bookingPolicy: env.BUSINESS_BOOKING_POLICY || "",
      contact: env.BUSINESS_CONTACT || ""
    }
  };
}
