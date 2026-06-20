# Brighten — For Bright Futures

**Brighten** is an AR-powered educational app for children aged 6–12. It lets kids scan physical toy figures to bring career characters to life in Augmented Reality, then chat with them using AI to learn about different professions.

> **Scan your toy. Meet your hero!**

---

## Features

- **AR Scanning** — Use your device camera to scan Brighten toy figures. The character pops up in 3D via augmented reality, powered by [MindAR](https://github.com/hiukim/mind-ar-js) and [A-Frame](https://aframe.io/).
- **AI Chat** — Chat naturally with any career character. Each character has a unique personality and responds in a kid-friendly way, powered by an AI API.
- **6 Career Characters**:
  - **Programmer** — Builds apps, games, and websites with code
  - **Police Officer** — Keeps communities safe every day
  - **Teacher** — Inspires children to love learning
  - **Farmer** — Grows food that feeds the world
  - **Doctor** — Heals people and saves lives
  - **Astronaut** — Explores the universe beyond Earth
- **Multi-language Support** — English, Chinese (中文), and Malay (Bahasa Melayu) built in.
- **Playful Visuals** — Colorful UI with animations, particle effects, and typing sound effects.

---

## Project Structure

```
index.html                          # Root — redirects to pages/home.html
assets/
├── targets.mind                    # MindAR image target data for AR tracking
└── characters/                     # Career character PNG images
    ├── char-programmer.png
    ├── char-police.png
    ├── char-teacher.png
    ├── char-farmer.png
    ├── char-doctor.png
    └── char-astronaut.png
css/
├── global.css                      # Global styles, colors, typography, nav
├── home.css                        # Home page hero & steps section
├── careers.css                     # Careers listing grid
├── career.css                      # Career detail page
├── ar.css                          # AR scanning page styles
└── transition.css                  # Transition & overlay animations
js/
├── i18n.js                         # Internationalization (en / zh / ms)
├── chat.js                         # AI chat integration
└── ar.js                           # AR marker detection & career matching
pages/
├── home.html                       # Landing page
├── careers.html                    # All careers overview
├── career.html                     # Individual career detail (dynamic)
└── ar.html                         # AR scanner + chat interface
```

---

## Tech Stack

| Technology | Purpose |
|---|---|
| [A-Frame](https://aframe.io/) (v1.4.0) | 3D / WebXR scene rendering |
| [MindAR](https://github.com/hiukim/mind-ar-js) (v1.2.2) | Image-tracking augmented reality |
| AI API | Conversational chat backend |
| Vanilla HTML / CSS / JavaScript | No framework — lightweight and dependency-light |

---

## Getting Started

### Prerequisites

- Any modern web browser (Chrome, Edge, Safari, Firefox)
- A device with a camera (for AR features)
- *(Optional)* A printed Brighten toy image target for AR recognition

### Running Locally

Since this is a static web app, you can serve it with any HTTP server:

```bash
# Using Python
python -m http.server 8080

# Using Node.js (npx)
npx serve .
```

Then open `http://localhost:8080` in your browser.

> **Note**: The camera / AR features require a secure context (`https://` or `localhost`). If deploying to a public server, make sure HTTPS is enabled.

---

## Internationalization

The app supports three locales:

| Locale | Code |
|---|---|
| English | `en` |
| 中文 (Chinese) | `zh` |
| Bahasa Melayu (Malay) | `ms` |

The language is auto-detected from the browser settings and can be switched via the language toggle in the UI. All UI strings and character responses are localized.

---

## Configuration

The API key for the AI backend is configured in `js/chat.js`. Replace the placeholder with your own key before deploying.

---

## Chat Mode (No AR Required)

On the AR page (`ar.html`), a **"Chat"** button appears in the top-right corner. Tap it to open a Chat panel where you can select any career character and start chatting immediately — without needing to scan a physical toy. This is useful for demos and development.

---

## License

This project is provided for educational and demonstration purposes.

---


