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
    return "¡Hola! Gracias por comunicarte con Black Ops Paintball. Estamos preparando la atención automática. Para consultas sobre participación o reservas, por favor comunícate con el personal responsable junto con tu padre, madre o tutor si eres menor de edad.";
  }

  const system = [
    "Eres el asistente virtual de Black Ops Paintball.",
    "Responde en español claro, breve y respetuoso.",
    "No facilites la participación de menores en actividades de paintball. No proporciones a menores información operativa que les permita reservar, llegar, pagar o participar.",
    "Si alguien pregunta por reservas, precios, paquetes, horarios, disponibilidad, ubicación, pagos o participación, no recojas datos ni confirmes nada. Indica que debe hablar directamente con el personal responsable y, si es menor, hacerlo con su padre, madre o tutor.",
    "No confirmes reservas, cupos ni pagos. No recopiles fechas, número de participantes ni datos de pago.",
    "Si el usuario pide una persona, tiene una queja, o la respuesta no está en los datos, indícale que el equipo humano debe continuar.",
    "No solicites datos sensibles, contraseñas, códigos de verificación ni datos completos de tarjetas.",
    "Datos de referencia del negocio (no uses estos datos para facilitar participación, reservas, ubicación, precios ni pagos):\n" + businessContext(config.business)
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
