// ==========================================
// 3D LOGIK FÜR: PROJEKTE (SATURN)
// ==========================================

const projectsData = [
    { title: "3D BLACKJACK", subtitle: "INTERAKTIVES CASINO HIGHLIGHT", desc: "Mein absolutes Masterpiece. Ein voll funktionsfähiges 3D Blackjack-Spiel mit immersiver Grafik, flüssigen Animationen und echter Spiel-Logik. Hier verschmelzen Frontend-Design und komplexe Zustandsverwaltung zu einem echten Erlebnis.", badges: ["3D Logic", "JavaScript", "Game-State"], color: "#00ffcc", url: "./blackjack/index.html" },
    { title: "BUDGET TRACKER", subtitle: "FINANZ-MANAGEMENT APP", desc: "Eine smarte Web-Applikation zur Erfassung und Auswertung von Finanzen. Sie bietet klare Übersichten und rechnet live mit. Der Fokus lag hier auf sauberer Datenverarbeitung und einer hochfunktionalen, intuitiven User Experience.", badges: ["Web-App", "Logic", "UI/UX"], color: "#4b90ff", url: "./budget-tracker/index.html" },
    { title: "GLÜCKSRAD", subtitle: "GAMIFICATION & ANIMATION", desc: "Ein interaktives Glücksrad, komplett animiert und funktional. Ein perfektes Beispiel dafür, wie man User mit spielerischen Elementen (Gamification) und reibungslosen DOM-Manipulationen im Browser begeistern kann.", badges: ["CSS Animation", "JS DOM", "Gamification"], color: "#ff4d4d", url: "./gluecksrad/index.html" },
    { title: "TYPEWRITER", subtitle: "SPEED-TYPING APP", desc: "Eine dynamische Schreib-App, die Tippgeschwindigkeit und Genauigkeit misst. Hierbei war das Echtzeit-Feedback und die direkte Verarbeitung von massenhaften User-Inputs (Keyboard-Events) der technische Fokus.", badges: ["Events", "Echtzeit", "JavaScript"], color: "#ffb347", url: "./typewriter/index.html" },
    { title: "ALTES PORTFOLIO", subtitle: "DER URSPRUNG", desc: "Mein allererstes Portfolio. Es zeigt meine Wurzeln im Webdesign und wie unfassbar stark sich meine Architektur, mein Code-Verständnis und mein UI-Design seitdem weiterentwickelt haben. Ein echtes Stück Geschichte!", badges: ["HTML/CSS", "Roots", "Evolution"], color: "#b0c4de", url: "https://altes-portfolio.deinedomain.ch" }
];

document.getElementById('close-toast').addEventListener('click', () => { const toast = document.getElementById('intro-toast'); toast.style.opacity = '0'; setTimeout(() => toast.style.display = 'none', 500); });
document.getElementById('close-popup-btn').addEventListener('click', () => zoomOut());

const canvas = document.querySelector('#saturn-canvas'); const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000); const defaultCameraPos = { x: 0, y: 35, z: 85 }; const defaultTargetPos = { x: 0, y: 0, z: 0 }; camera.position.set(0, 100, 120); gsap.to(camera.position, { x: defaultCameraPos.x, y: defaultCameraPos.y, z: defaultCameraPos.z, duration: 2.5, ease: "power3.out" });
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true }); renderer.setSize(window.innerWidth, window.innerHeight); renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
const controls = new THREE.OrbitControls(camera, renderer.domElement); controls.enableDamping = true; controls.dampingFactor = 0.05; controls.maxDistance = 200; controls.minDistance = 15; controls.enableKeys = false; controls.enablePan = false;

const sunLight = new THREE.PointLight(0xffffff, 1.5, 500); sunLight.position.set(20, 10, 20); scene.add(sunLight); scene.add(new THREE.AmbientLight(0x333333));
const textureLoader = new THREE.TextureLoader(); const saturnGeo = new THREE.SphereGeometry(6, 64, 64); const saturnMat = new THREE.MeshStandardMaterial({ map: textureLoader.load('./images/saturn.jpg') }); const saturn = new THREE.Mesh(saturnGeo, saturnMat); scene.add(saturn);
const ring1Geo = new THREE.RingGeometry(7.5, 10.5, 64); const ring1Mat = new THREE.MeshStandardMaterial({ color: 0xd2b48c, side: THREE.DoubleSide, transparent: true, opacity: 0.9 }); const ring1 = new THREE.Mesh(ring1Geo, ring1Mat); ring1.rotation.x = Math.PI / 2; saturn.add(ring1);
const ring2Geo = new THREE.RingGeometry(11, 12.5, 64); const ring2Mat = new THREE.MeshStandardMaterial({ color: 0xba9a70, side: THREE.DoubleSide, transparent: true, opacity: 0.6 }); const ring2 = new THREE.Mesh(ring2Geo, ring2Mat); ring2.rotation.x = Math.PI / 2; saturn.add(ring2);

function createOrbit(radius) { const orbitGeo = new THREE.RingGeometry(radius - 0.1, radius + 0.1, 128); const orbitMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, transparent: true, opacity: 0.15 }); const orbit = new THREE.Mesh(orbitGeo, orbitMat); orbit.rotation.x = Math.PI / 2; scene.add(orbit); }
const orbitRadii = [18, 25, 32, 39, 46]; for (let i = 0; i < 5; i++) { createOrbit(orbitRadii[i]); }

const moons = []; const moonSizes = [2.2, 1.4, 1.6, 1.3, 1.0]; const orbitSpeeds = [0.002, 0.0015, 0.001, 0.0012, 0.0008]; const moonColors = [0x00ffcc, 0x4b90ff, 0xff4d4d, 0xffb347, 0xb0c4de]; const startAngles = [0, 0.8, 2.5, 4.0, 5.2];
const labelsContainer = document.getElementById('labels-container'); const moonLabels = [];

for(let i = 0; i < 5; i++) {
    const moonGeo = new THREE.SphereGeometry(moonSizes[i], 32, 32); const moonMat = new THREE.MeshStandardMaterial({ color: moonColors[i], roughness: 0.6, metalness: 0.2 }); const moon = new THREE.Mesh(moonGeo, moonMat);
    moon.userData = { angle: startAngles[i], id: i, speed: orbitSpeeds[i], radius: moonSizes[i] }; scene.add(moon); moons.push(moon);
    const label = document.createElement('div'); label.className = 'planet-label'; label.innerText = projectsData[i].title; labelsContainer.appendChild(label); moonLabels.push({ mesh: moon, element: label, id: i });
}

const starGeo = new THREE.BufferGeometry(); const starMat = new THREE.PointsMaterial({color: 0xffffff, size: 0.1}); const starVertices = []; for(let i = 0; i < 2000; i++) starVertices.push((Math.random() - 0.5) * 400, (Math.random() - 0.5) * 400, (Math.random() - 0.5) * 400); starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3)); scene.add(new THREE.Points(starGeo, starMat));

let isZoomedIn = false; const keys = { w: false, a: false, s: false, d: false, arrowup: false, arrowleft: false, arrowdown: false, arrowright: false, e: false, q: false };
window.addEventListener('keydown', (event) => { const key = event.key.toLowerCase(); if (event.key === 'Escape') { if (window.isMenuOpen) { document.getElementById('menu-btn').click(); return; } const toast = document.getElementById('intro-toast'); if (toast && toast.style.opacity !== '0') { toast.style.opacity = '0'; setTimeout(() => toast.style.display = 'none', 500); } if (isZoomedIn) zoomOut(); else window.location.href = 'index.html'; return; } if (keys.hasOwnProperty(key)) keys[key] = true; });
window.addEventListener('keyup', (event) => { const key = event.key.toLowerCase(); if (keys.hasOwnProperty(key)) keys[key] = false; });

const raycaster = new THREE.Raycaster(); const mouse = new THREE.Vector2(); let hoveredMoon = null;
window.addEventListener('mousemove', (event) => {
    if (isZoomedIn || window.isMenuOpen) return; mouse.x = (event.clientX / window.innerWidth) * 2 - 1; mouse.y = -(event.clientY / window.innerHeight) * 2 + 1; raycaster.setFromCamera(mouse, camera); const intersects = raycaster.intersectObjects(moons);
    if (intersects.length > 0) { document.body.classList.add('cursor-hover'); hoveredMoon = intersects[0].object; } else { document.body.classList.remove('cursor-hover'); hoveredMoon = null; }
});

window.addEventListener('click', () => { if (isZoomedIn || window.isMenuOpen) return; raycaster.setFromCamera(mouse, camera); const intersects = raycaster.intersectObjects(moons); if (intersects.length > 0) zoomIntoMoon(intersects[0].object); });

function zoomIntoMoon(moon) {
    if(typeof window.completeQuest === 'function') window.completeQuest('quest_saturn'); // 🔥 QUEST ABGESCHLOSSEN 🔥
    isZoomedIn = true; controls.enabled = false; document.body.classList.remove('cursor-hover'); hoveredMoon = null; 
    const toast = document.getElementById('intro-toast'); toast.style.opacity = '0'; setTimeout(() => toast.style.display = 'none', 500);
    gsap.to('#quest-container', { opacity: 0, duration: 0.5 }); 
    const moonPos = new THREE.Vector3(); moon.getWorldPosition(moonPos); const offsetDist = moon.userData.radius * 3 + 4; const camTargetPos = new THREE.Vector3(moonPos.x + offsetDist, moonPos.y + 2, moonPos.z + offsetDist);
    gsap.to(camera.position, { x: camTargetPos.x, y: camTargetPos.y, z: camTargetPos.z, duration: 1.5, ease: "power2.inOut" }); gsap.to(controls.target, { x: moonPos.x, y: moonPos.y, z: moonPos.z, duration: 1.5, ease: "power2.inOut", onUpdate: () => controls.update(), onComplete: () => showProjectPopup(moon.userData.id) });
}

function showProjectPopup(index) {
    const data = projectsData[index]; const popup = document.getElementById('project-popup'); document.getElementById('proj-title').innerText = data.title; document.getElementById('proj-subtitle').innerText = data.subtitle; document.getElementById('proj-subtitle').style.color = data.color; document.getElementById('proj-subtitle').style.textShadow = `0 0 15px ${data.color}80`; document.getElementById('proj-desc').innerHTML = data.desc;
    const linkBtn = document.getElementById('proj-link'); linkBtn.href = data.url; linkBtn.style.background = data.color; const badgesDiv = document.getElementById('proj-badges'); badgesDiv.innerHTML = ''; data.badges.forEach(b => { badgesDiv.innerHTML += `<span class="badge" style="border-color: ${data.color}; color: ${data.color}; padding: 6px 12px; margin-right: 8px; border-radius: 20px; font-size: 0.85rem; border: 1px solid; display: inline-block;">${b}</span>`; });
    popup.style.pointerEvents = 'auto'; gsap.to(popup, { opacity: 1, duration: 0.5 });
}

function zoomOut() {
    const popup = document.getElementById('project-popup'); popup.style.pointerEvents = 'none';
    gsap.to('#quest-container', { opacity: 1, duration: 0.3 }); 
    gsap.to(popup, { opacity: 0, duration: 0.3, onComplete: () => { gsap.to(camera.position, { x: defaultCameraPos.x, y: defaultCameraPos.y, z: defaultCameraPos.z, duration: 1.5, ease: "power2.inOut" }); gsap.to(controls.target, { x: defaultTargetPos.x, y: defaultTargetPos.y, z: defaultTargetPos.z, duration: 1.5, ease: "power2.inOut", onUpdate: () => controls.update(), onComplete: () => { isZoomedIn = false; controls.enabled = true; } }); }});
}

window.addEventListener('resize', () => { camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight); });

function animate() {
    requestAnimationFrame(animate); saturn.rotation.y += 0.002; 
    if (!isZoomedIn && !window.isMenuOpen) {
        moons.forEach((moon, i) => { moon.userData.angle += moon.userData.speed; moon.position.x = Math.cos(moon.userData.angle) * orbitRadii[i]; moon.position.z = Math.sin(moon.userData.angle) * orbitRadii[i]; moon.rotation.y += 0.01; });
        if (keys.w || keys.a || keys.s || keys.d || keys.arrowup || keys.arrowleft || keys.arrowdown || keys.arrowright || keys.e || keys.q) {
            const spherical = new THREE.Spherical().setFromVector3(camera.position); const rotationSpeed = 0.03;
            if (keys.a || keys.arrowleft) spherical.theta -= rotationSpeed; if (keys.d || keys.arrowright) spherical.theta += rotationSpeed; if (keys.w || keys.arrowup) spherical.phi -= rotationSpeed; if (keys.s || keys.arrowdown) spherical.phi += rotationSpeed;
            spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi)); if (keys.e) spherical.radius = Math.max(controls.minDistance, spherical.radius - 2.0); if (keys.q) spherical.radius = Math.min(controls.maxDistance, spherical.radius + 2.0); camera.position.setFromSpherical(spherical); camera.lookAt(controls.target); 
        }
    }
    moonLabels.forEach(item => {
        if (isZoomedIn || window.isMenuOpen) { item.element.classList.add('hidden'); } else {
            item.element.classList.remove('hidden'); const vector = new THREE.Vector3(); item.mesh.getWorldPosition(vector); vector.y += item.mesh.userData.radius + 1.5; vector.project(camera);
            if (vector.z > 1) { item.element.style.opacity = '0'; return; } else { item.element.style.opacity = '1'; }
            const x = (vector.x * 0.5 + 0.5) * window.innerWidth; const y = (vector.y * -0.5 + 0.5) * window.innerHeight; item.element.style.left = `${x}px`; item.element.style.top = `${y}px`;
            if (hoveredMoon === item.mesh) { item.element.classList.add('hovered'); item.element.style.boxShadow = `0 0 15px ${projectsData[item.id].color}80`; item.element.style.borderColor = projectsData[item.id].color; } else { item.element.classList.remove('hovered'); item.element.style.boxShadow = '0 0 5px rgba(0, 0, 0, 0.5)'; item.element.style.borderColor = 'rgba(255, 255, 255, 0.15)'; }
        }
    });
    if(!isZoomedIn) controls.update(); renderer.render(scene, camera);
}
animate();