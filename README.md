<h1 align="center">🌌 3D Interactive Portfolio Universe</h1>

<p align="center">
  <strong>Ein immersives, WebGL-basiertes 3D-Portfolio, gebaut mit Three.js, GSAP und Vanilla JavaScript.</strong><br>
  Entwickelt mit einem starken Fokus auf Clean Code, Separation of Concerns und Gamification-Elementen für eine optimale User Experience (UX).
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Three.js-black?style=for-the-badge&logo=three.js&logoColor=white" alt="Three.js">
  <img src="https://img.shields.io/badge/GSAP-88CE02?style=for-the-badge&logo=greensock&logoColor=white" alt="GSAP">
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5">
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3">
</p>

---

## 🏗️ Architektur & Ordnerstruktur

Das Projekt ist als **Multi-Page Application (MPA)** konzipiert. Um eine Pathing-Hell (`../../`) zu vermeiden und das Deployment zu vereinfachen, liegen alle Hauptseiten flach im Root-Verzeichnis. Die externen Applikationen (Projekte) sind kapsuliert in eigenen Verzeichnissen untergebracht.

```text
📦 3D-Portfolio
 ┣ 📂 blackjack/          # Standalone Projekt (z.B. Angular/Vanilla Build)
 ┣ 📂 budget-tracker/     # Standalone Node.js/Backend Projekt
 ┣ 📂 gluecksrad/         # Standalone Projekt
 ┣ 📂 typewriter/         # Standalone Projekt
 ┣ 📂 images/             # Texturen für 3D-Modelle & UI-Assets
 ┣ 📜 index.html          # Startseite (Solarsystem)
 ┣ 📜 script.js           # 3D-Logik für index.html
 ┣ 📜 projekte.html       # Unterseite (Saturn)
 ┣ 📜 projekte.js         # 3D-Logik für projekte.html
 ┣ 📜 skills.html         # Unterseite (Jupiter)
 ┣ 📜 skills.js           # 3D-Logik für skills.html
 ┣ 📜 ueber-mich.html     # Unterseite (Erde)
 ┣ 📜 ueber-mich.js       # 3D-Logik für ueber-mich.html
 ┣ 📜 kontakt.html        # Unterseite (Wurmloch)
 ┣ 📜 kontakt.js          # 3D-Logik für kontakt.html
 ┣ 📜 impressum.html      # Unterseite (Sonne)
 ┣ 📜 global.js           # 🧠 Globale UI-Logik (DRY-Prinzip)
 ┣ 📜 style.css           # Styling für Startseite
 ┗ 📜 page-style.css      # Shared Styling für alle Unterseiten
```

---

## 🛠️ Code Design & Prinzipien

### 1. Separation of Concerns (SoC)
HTML, CSS und JavaScript sind strikt voneinander getrennt. Es gibt keine Inline-Scripts. Jede HTML-Datei lädt genau zwei JavaScript-Dateien:
1. `global.js`: Behandelt seitenübergreifende Logik (Vermeidung von Redundanz).
2. `[seitenname].js`: Beinhaltet ausschließlich die spezifische Three.js Szene der jeweiligen Ansicht.

### 2. Don't Repeat Yourself (DRY) via `global.js`
Anstatt UI-Logik in jeder Datei zu wiederholen, importiert jede Seite die `global.js`. Diese Datei ist das **Command Center** für das UI und steuert:
*   Den **Custom Cursor** (Hover-Detection & Animation).
*   Das **Burger-Menü** (Fast-Travel Navigation).
*   Den globalen **Web Audio API** Context (Hover- & Warp-Sounds).
*   Das **Quest-System** (Mission Log).

### 3. Gamification State Management (`localStorage`)
Um Recruiter psychologisch zu motivieren, das gesamte Portfolio zu erkunden, wurde Gamification Elemente integriert wie z.B. ein **Mission Log**. Der Fortschritt (welcher Planet bereits besucht wurde) wird im `localStorage` des Browsers persistiert.

```javascript
// Auszug aus global.js: Quest-Validierung
window.completeQuest = function(id) {
    if (localStorage.getItem(id) !== 'true') {
        localStorage.setItem(id, 'true');
        window.renderQuestLog(); // UI Update
    }
};
```
*Sobald der User z.B. auf den Saturn klickt, feuert die lokale `projekte.js` den Befehl `completeQuest('quest_saturn')` ab.*

---

## 🌌 3D Engine (Three.js) Deep Dive

### Raycasting & Objekt-Interaktion
Die Interaktion mit den 3D-Körpern (Planeten, Monde, Gas-Stürme) wird durch einen `THREE.Raycaster` ermöglicht. Die Mauskoordinaten werden auf einen 2D-Vektor normalisiert und in den 3D-Raum projiziert.

```javascript
// Raycaster Setup (Maus-Hover Detection)
window.addEventListener('mousemove', (event) => {
    if (isZooming || window.isMenuOpen) return;
    
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(clickablePlanets);

    if (intersects.length > 0) {
        document.body.classList.add('cursor-hover');
        hoveredPlanet = intersects[0].object;
    }
});
```

### Kamera-Fahrten (GSAP Tweening)
Bei einem Klick auf einen Himmelskörper übernimmt **GSAP (GreenSock)** die Animation. Die OrbitControls werden deaktiviert und die Kamera interpoliert weich zur Zielkoordinate (`Vector3.lerp`-ähnlich, jedoch über GSAP Timelines realisiert).

```javascript
// Kamera zoomt an den anvisierten Planeten
const targetPos = new THREE.Vector3(); 
moon.getWorldPosition(targetPos); 
const direction = new THREE.Vector3().subVectors(camera.position, targetPos).normalize(); 
const camDestination = targetPos.clone().add(direction.multiplyScalar(4.5));

gsap.to(camera.position, { 
    x: camDestination.x, y: camDestination.y, z: camDestination.z, 
    duration: 1.5, ease: "power2.inOut" 
});
```

### UI-Verknüpfung im 3D-Raum (Hologramm-Labels)
Auf Unterseiten (z.B. Jupiter / Saturn) rotieren permanente HTML-Labels synchron zu den 3D-Meshs. Die 3D-Position der Monde wird bei jedem Frame per `vector.project(camera)` in 2D-Pixelkoordinaten umgerechnet, um die `div`-Elemente exakt über den Modellen schweben zu lassen.

---

## 📱 Responsive & Mobile First
Trotz komplexer 3D-Szenen ist das UI vollständig responsive.
*   **CSS Media Queries (`max-width: 768px`)** positionieren Popups via Flexbox perfekt in der Mitte (Thumb-Friendly Design).
*   **Touch-Optimierung:** Der Custom-Cursor wird via `@media (pointer: coarse)` auf Handys deaktiviert und die native Touch-API freigegeben. Die `OrbitControls` von Three.js unterstützen out-of-the-box Pinch-to-Zoom und Swipe-Rotation.

---

## 🚀 Setup & Ausführung
Da Three.js Texturen aus externen Verzeichnissen lädt (z.B. `./images/saturn.jpg`), blockiert der Browser (CORS-Policy) das direkte Ausführen der HTML-Datei (`file://`).
Das Projekt muss über einen lokalen Webserver gestartet werden.

**Mit VS Code:**
1. Code in VS Code öffnen.
2. Extension `Live Server` installieren.
3. Rechtsklick auf `index.html` ➔ **"Open with Live Server"**.

**Mit Node.js / Python:**
```bash
# Python 3
python -m http.server 8000
# Node.js
npx http-server
```

---
*Developed by Visar Vejseli.*
