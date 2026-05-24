const readme = `
[!IMPORTANT]
Bienvenido al repositorio oficial de **GUERRA BOT MD** — un sistema avanzado de automatización para WhatsApp basado en Baileys Multi-Device.
Este proyecto es privado, optimizado y en constante evolución. Su arquitectura ha sido diseñada para alto rendimiento, escalabilidad y estabilidad en entornos reales.

Mantente actualizado desde nuestro canal oficial:
https://whatsapp.com/channel/120363427020147321

<p align="center">
  <img src="https://api.dix.lat/me/92dbd94f-eb3d-40d8-ac61-fd42f95c73ff.jpg" width="380" />
</p>

<h1 align="center">⚔️ GUERRA BOT MD ⚔️</h1>

<p align="center">
  <img src="https://img.shields.io/badge/Version-1.0.0-00ff88?style=for-the-badge">
  <img src="https://img.shields.io/badge/Runtime-Node.js-339933?style=for-the-badge&logo=node.js">
  <img src="https://img.shields.io/badge/Baileys-MultiDevice-25D366?style=for-the-badge&logo=whatsapp">
  <img src="https://img.shields.io/badge/Status-Active-success?style=for-the-badge">
</p>

---

> [!IMPORTANT]
> **Núcleo del sistema**
> GUERRA BOT MD utiliza una arquitectura modular híbrida basada en:
> - ESM dinámico (plugins en caliente)
> - Cache inteligente en memoria
> - Sistema de eventos en tiempo real
> - Reconexión automática persistente
> - Control de errores silencioso
> - Soporte Multi-Session

---

> [!TIP]
> **Modo flexible de ejecución**
> El sistema puede funcionar con o sin base de datos (MongoDB / LocalDB) sin afectar la lógica principal del bot.

---

> [!WARNING]
> **Entorno recomendado**
> Para producción estable:
> - Node.js LTS v20+
> - PM2
> - VPS Linux
> - MongoDB Atlas (opcional pero recomendado)

---

# 🧠 Arquitectura Interna

- Motor de plugins dinámico
- Control de comandos por contexto
- Middleware de eventos globales
- Sistema de permisos (owner/admin/user)
- Manejo de media optimizado
- Sistema anti-crash integrado
- Logging inteligente

---

# ⚡ Características principales

- Multi-Device WhatsApp
- SubBots (multi sesión)
- Auto reconexión inteligente
- Sistema de bienvenida y despedida
- Anti-link / Anti-spam
- Sistema de niveles y economía
- Juegos RPG integrados
- IA integrada (ChatGPT / Gemini / Copilot)
- Descargas (YouTube / TikTok / Instagram)
- Stickers avanzados
- Menú dinámico personalizable

---

# 🚀 Instalación rápida

## Termux / Linux

\`\`\`bash
pkg update && pkg upgrade -y
pkg install git nodejs-lts ffmpeg imagemagick -y
\`\`\`

## Clonar proyecto

\`\`\`bash
git clone https://github.com/TU-USUARIO/guerra-bot-md
cd guerra-bot-md
\`\`\`

## Instalar dependencias

\`\`\`bash
npm install
\`\`\`

## Iniciar bot

\`\`\`bash
npm start
\`\`\`

---

# ⚙️ Producción (Recomendado)

\`\`\`bash
npm install -g pm2
pm2 start index.js --name GUERRA-BOT
pm2 save
pm2 startup
\`\`\`

---

# 🔒 Seguridad

- Control de owner jerárquico
- Protección contra spam
- Validación de comandos
- Bloqueo de ejecución inválida
- Control de sesiones activas

---

# 👑 Desarrollador

GUERRA BOT MD fue diseñado y optimizado por un sistema de ingeniería modular enfocado en estabilidad y rendimiento.

---

# 📢 Canal Oficial

https://whatsapp.com/channel/120363427020147321

---

# ⚖️ Licencia

MIT License — Uso libre con atribución recomendada.

---

<p align="center">
  GUERRA BOT MD © 2026 — Sistema de automatización avanzado
</p>
`;

export default readme;
