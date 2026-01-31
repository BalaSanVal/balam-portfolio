const form = document.getElementById("contact-form");
const statusEl = document.getElementById("form-status");
const submitBtn = form.querySelector('button[type="submit"]');

function setStatus(message, type) {
  statusEl.textContent = message;
  statusEl.className = ""; // limpia clases previas
  if (type) statusEl.classList.add(type);
}

function setLoading(isLoading) {
  submitBtn.disabled = isLoading;
  submitBtn.textContent = isLoading ? "Enviando..." : "Enviar";
}

form.addEventListener("submit", async (e) => {
  e.preventDefault(); // evita recargar la página

  setStatus("", "");
  setLoading(true);

  // 1) Extrae los datos del formulario
  const formData = new FormData(form);

  const payload = {
    name: String(formData.get("name") || "").trim(),
    email: String(formData.get("email") || "").trim(),
    message: String(formData.get("message") || "").trim(),
    company: String(formData.get("company") || "").trim(), // honeypot
  };

  try {
    // 2) Llama a la Netlify Function (misma origin)
    const res = await fetch("/.netlify/functions/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    // 3) Manejo de errores HTTP
    if (!res.ok) {
      const text = await res.text(); // tu backend manda texto en errores
      if (res.status === 429) {
        throw new Error("Demasiados intentos. Espera unos minutos y vuelve a intentar.");
      }
      throw new Error(text || "Ocurrió un error enviando el mensaje.");
    }

    // 4) Éxito: resetea y muestra feedback
    setStatus("✅ Mensaje enviado. Gracias, te responderé pronto.", "success");
    form.reset();
  } catch (err) {
    // 5) Error: muestra feedback al usuario
    setStatus(`❌ ${err.message}`, "error");
  } finally {
    setLoading(false);
  }
});
