const { Resend } = require("resend");

function isValidEmail(email) {
    return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function escapeHtml(str) {
    return String(str)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

// Rate limit
const RATE_WINDOW_MS = 10 * 60 * 1000; //10 min
//const RATE_MAX = 5; // 5 envíos / 10 min por IP
const RATE_MAX = 50; // 50 envíos / 10 min por IP

const RATE_CONFIG = `${RATE_WINDOW_MS}:${RATE_MAX}`;
const ipHits = new Map();

function rateLimit(ip) {
    const now = Date.now();
    const entry = ipHits.get(ip) || { count: 0, start: now, cfg: RATE_CONFIG};

    //Si cambiaste RATE_MAX o RATE_WINDOW_MS, resetea el contador
    if (entry.cfg !== RATE_CONFIG) {
        entry.count = 0;
        entry.start = now;
        entry.cfg = RATE_CONFIG;
    }

    //Ventana expiró resetea
    if(now - entry.start > RATE_WINDOW_MS) {
        entry.count = 0;
        entry.start = now;
    }
    
    entry.count += 1;
    ipHits.set(ip, entry);

    console.log("RATE_CONFIG", RATE_CONFIG);
    console.log("RATE_STATE", {
        ip,
        count: entry.count,
        start: entry.start,
        now,
        windowMs: RATE_WINDOW_MS,
        max: RATE_MAX,
    });

    return entry.count <= RATE_MAX;
}

exports.handler = async (event) => {
    console.log("CONTACT_FUNCTION_START", {
        method: event.httpMethod,
        hasBody: !!event.body,
    });

    try {
        if(event.httpMethod !== "POST") {
            return { statusCode: 405, body: "Method Not Allowed"};
        }

        const ip =
            event.headers["x-nf-client-connection-ip"] ||
            event.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
            "unknown";
        
        const allowed = rateLimit(ip);
        console.log("RATE_DECISION", {ip, allowed});

        if (!allowed) {
            return { statusCode: 429, body: "Too Many Requests"};
        }

        const data = JSON.parse(event.body || "{}");
        const name = (data.name || "").trim();
        const email = (data.email || "").trim();
        const message = (data.message || "").trim();

        // Honeypot: si viene lleno, e bot -> respondemos ok y no enviamos
        const honeypot = (data.company || "").trim();
        if(honeypot) {
            return {
                statusCode: 200,
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({ ok: true}),
            };
        }

        // Validación server-side (no confiar en el front)
        if (name.length < 2 || name.length > 60) {
            return { statusCode: 400, body: "Invalid name"};
        }
        if (!isValidEmail(email) || email.length > 254) {
            return { statusCode: 400, body: "Invalid email"};
        }
        if (message.length < 10 || message.length > 2000) {
            return { statusCode: 400, body: "Invalid message"};
        }

        const RESEND_API_KEY = process.env.RESEND_API_KEY;
        const to = process.env.CONTACT_TO_EMAIL;
        const from = process.env.CONTACT_FROM_EMAIL;

        if(!RESEND_API_KEY || !to || !from) {
            return { statusCode: 500, body: "Server not configured"};
        }

        console.log("ENV_CHECK", {
            hasResendKey: !!process.env.RESEND_API_KEY,
            hasTo: !!process.env.CONTACT_TO_EMAIL,
            hasFrom: !!process.env.CONTACT_FROM_EMAIL,
        });

        const resend = new Resend(RESEND_API_KEY);

        const safeName = escapeHtml(name);
        const safeEmail = escapeHtml(email);
        const safeMsg = escapeHtml(message).replaceAll("\n", "<br>");

        const subject = `Nuevo mensaje del portafolio ${safeName}`;

        const html = `
            <div style="font-family: Arial, sans-serif; line-height: 1.5;">
                <h2> Nuevo mensaje desde tu portafolio</h2>
                <p><strong>Nombre:</strong> ${safeName}</p>
                <p><strong>Email:</strong><br>${safeEmail}</p>
                <p><strong>Mensaje:</strong><br>${safeMsg}</p>
                <hr>
                <p style="color:#64748b;font-size:12px;">IP: ${escapeHtml(ip)}</p>
            </div>
        `;

        const { error } = await resend.emails.send({
            from,
            to: [to],
            subject,
            html,
            reply_to: email,
        });

        if (error) {
            return { statusCode: 502, body: "Email provider error" };
        }

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ok: true}),
        };
    } catch (e) {
        console.error("CONTACT_FUNCTION_ERROR:", e);
        return { statusCode: 500, body: "Internal Server Error" };
    }
};