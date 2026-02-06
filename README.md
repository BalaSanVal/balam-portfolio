# 🌐 Portafolio Personal — Balam Sánchez Valdivia

Portafolio web personal desarrollado desde cero para presentar mi perfil profesional,
proyectos y formas de contacto. El sitio incluye frontend responsivo y un backend
serverless para el envío seguro de mensajes por correo electrónico.

🔗 **Demo:** https://balam-sanchez.netlify.app  
📂 **Repositorio:** https://github.com/BalaSanVal/balam-portfolio

---

## 🧰 Tecnologías utilizadas

### Frontend
- HTML5 (estructura semántica)
- CSS3 (layout responsive con Flexbox y Grid)
- JavaScript (manejo de eventos y formularios)

### Backend / Infraestructura
- Netlify Functions (serverless)
- Resend (envío de correos)
- Variables de entorno (configuración segura)
- Rate limiting por IP
- Honeypot anti-spam

### Herramientas
- Git & GitHub (control de versiones)
- Postman (pruebas de API)
- Netlify (deploy continuo)

---

## ✨ Funcionalidades principales

- Sección hero con presentación profesional
- Navegación anclada entre secciones
- Sección de habilidades técnicas
- Sección de proyectos (incluye este portafolio como proyecto)
- Formulario de contacto funcional:
  - Validación server-side
  - Protección anti-spam
  - Rate limit por IP
  - Envío de mensajes por correo electrónico
- Diseño responsivo (mobile-first)

---

## 🔐 Seguridad y buenas prácticas

- Validación de datos en frontend y backend
- Sanitización de entradas para evitar XSS
- Honeypot invisible contra bots
- Rate limit para prevenir abuso del formulario
- Variables sensibles gestionadas mediante environment variables

---

## 📦 Cómo ejecutar el proyecto en local

1. Clona el repositorio:
   ```bash
   git clone https://github.com/BalaSanVal/balam-portfolio.git
   