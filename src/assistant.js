function businessContext(business) {
  return [
    `Nombre: ${business.name}`,
    `Ciudad: ${business.city || "Pendiente de confirmar"}`,
    `Dirección: ${business.address || "Pendiente de confirmar"}`,
    `Horarios: ${business.hours || "Pendiente de confirmar"}`,
    `Precios: ${business.prices || "Pendiente de confirmar"}`,
    `Paquetes: ${business.packages || "Pendiente de confirmar"}`,
    `Política de reservas: ${business.bookingPolicy || "Pendiente de confirmar"}`,
    `Contacto: ${business.contact || "Pendiente de confirmar"}`
  ].join("\n");
}

export async function createReply({ text, config }) {
  const question = String(text || "").trim();
  if (!question) {
    return "Por ahora puedo atender mensajes de texto. ¿En qué podemos ayudarte?";
  }

  if (!config.openRouterApiKey || !config.openRouterModel) {
    return "¡Hola! Gracias por comunicarte con Black Ops Paintball. Estamos preparando la atención automática. Cuéntanos qué información necesitas y un integrante del equipo te ayudará. No confirmamos reservas ni pagos automáticamente por este chat.";
  }

  const system = [
    "Eres el asistente virtual de Black Ops Paintball.",
    "Responde en español colombiano claro, breve y respetuoso.",
    "Usa únicamente los datos de negocio incluidos abajo. Nunca inventes precios, horarios, ubicación, disponibilidad, promociones o políticas.",
    "Si falta un dato, di que el equipo debe confirmarlo.",
    "No confirmes reservas, cupos ni pagos. Puedes recopilar una solicitud, pero indica que queda pendiente de confirmación humana.",
    "Si el usuario pide una persona, tiene una queja, o la respuesta no está en los datos, indícale que el equipo humano debe continuar.",
    "No solicites datos sensibles, contraseñas, códigos de verificación ni datos completos de tarjetas.",
    "Datos aprobados por el negocio:\n" + businessContext(config.business)
  ].join("\n\n");

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.openRouterApiKey}`,
      "Content-Type": "application/json",
      "X-Title": "Black Ops Paintball WhatsApp"
    },
    body: JSON.stringify({
      model: config.openRouterModel,
      messages: [
        { role: "system", content: system },
        { role: "user", content: question }
      ],
      temperature: 0.2,
      max_tokens: 250
    }),
    signal: AbortSignal.timeout(20000)
  });

  if (!response.ok) {
    throw new Error(`AI provider error: ${response.status}`);
  }

  const data = await response.json();
  const answer = data.choices?.[0]?.message?.content;
  if (typeof answer !== "string" || !answer.trim()) {
    throw new Error("AI provider returned an empty response.");
  }
  return answer.trim().slice(0, 3500);
}
