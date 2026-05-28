# Ukiku Fanpage 🌸

This project is an **unofficial web recreation** of the anime app **Ukiku**. The main goal is to **demonstrate and develop advanced frontend and backend development skills**, replicating the visual and interactive experience of the original application.

> 👨‍💻 Solo-developed project

---

## 🎯 Purpose

- Strengthen frontend development skills using modern technologies.
- Simulate key features of an anime streaming application.
- Explore integration of anime APIs and efficient UI rendering.
- Improve software architecture by strictly separating frontend and backend logic.

---

## 🧰 Technologies Used

### Frontend
- **Markup & Styling:** HTML5, CSS3 (Tailwind CSS)
- **Core Logic:** JavaScript (ES6+)
- **Animations:** GSAP (GreenSock Animation Platform)
- **UI/UX:** Responsive Design (Mobile First approach)

### Backend
- **Runtime & Framework:** Node.js + Express
- **Architecture:** REST API consumption & Backend-driven data flow

### Storage & Tools
- **State Management:** Web Storage API (`localStorage`)
- **Localization:** i18n system using structured JSON files

---

## 🚧 Project Status

Currently in active development. Implemented and planned features:

- ✔ Anime catalog view  
- ✔ Anime search system  
- ✔ Favorites system (`localStorage`)  
- ✔ Episode listing system  
- ✔ Interactive player with fallback support (`iframe` + `window.open`)  
- ✔ Backend-driven data architecture (no direct frontend API access)  
- ⏳ Category filters  
- ⏳ Improved episode streaming system  
- ⏳ User authentication system (future update)

---

## ⚠️ API / Streaming Note

The project relies on a dedicated backend that handles anime data fetching and streaming URLs securely.

Some external video servers may not load correctly inside iframes due to provider-specific security restrictions. To resolve this, a robust fallback system is implemented that automatically opens the video in a new tab when embedding fails.

---

## 🌍 Language System (i18n)

A multilingual system is being implemented using decoupled JSON files (`/i18n/es.json`, `/i18n/en.json`) to allow seamless future expansion to more languages.

---

## 📜 Latest Changes

- **Backend Migration:** Moved anime data fetching to the backend to secure endpoints and improve episode streaming logic.
- **Player Improvements:** Added a `window.open` fallback mechanism for playback resilience.
- **UI/UX Refinement:** Enhanced navigation flow and favorites handling.
- **Internationalization:** Created foundational localization directory for future language toggling.

---

## ⚖️ License

This project is for educational and personal use only.  
⚠️ **Note:** It is not affiliated with Ukiku or its original creators. This is a pure fan project built for learning and exploring modern web development.

---

## 🤝 Contact / Collaboration

If you're interested in collaborating, giving feedback, or suggesting improvements, feel free to reach out or open an issue via GitHub.
