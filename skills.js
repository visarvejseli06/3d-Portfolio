// ==========================================
// 3D LOGIK FÜR: SKILLS (JUPITER)
// ==========================================

const skillsData = [
    { title: "BM FÄCHER", subtitle: "WIRTSCHAFT & LOGIK", desc: "Meine absoluten Lieblingsfächer sind Wirtschaft, Mathematik, Englisch und Sport. Diese Kombination aus logischem Denken, internationaler Kommunikation und körperlichem Ausgleich passt perfekt zum vielseitigen Beruf des Informatikers.", badges: ["Wirtschaft", "Mathematik", "Englisch"], color: "#ffd700", bars: [{ name: "Mathematik", percent: 90 }, { name: "Wirtschaft", percent: 85 }, { name: "Englisch (C1)", percent: 80 }] },
    { title: "TECH STACK", subtitle: "PROGRAMMIERSPRACHEN & TOOLS", desc: "Hier ist mein technologisches Arsenal. Von performanten Frontends über stabile Backends bis hin zum Deployment – ich setze auf moderne, effiziente Technologien und bilde mich ständig weiter.", badges: ["Frontend", "Backend", "DevOps"], color: "#4b90ff", bars: [{ name: "HTML, CSS & JavaScript", percent: 90 }, { name: "Angular & TypeScript", percent: 80 }, { name: "Python", percent: 80 }, { name: "Bash & Co.", percent: 70 }, { name: "Docker & C#", percent: 60 }] },
    { title: "INTERESSEN", subtitle: "SPORT & AMBITIONEN", desc: "Ich bin ein extrem ambitionierter Mensch, der immer Vollgas gibt. Um Geld zu verdienen und unabhängig zu sein, übernehme ich regelmäßig Ferienjobs. Den perfekten Ausgleich zur Tastatur finde ich im Sport – egal ob Basketball, Fußball oder Joggen, Hauptsache Bewegung und Teamgeist!", badges: ["Basketball", "Fußball", "Hustler"], color: "#ff4d4d", bars: [] }
];

document.getElementById('close-toast').addEventListener('click', () => { const toast = document.getElementById('intro-toast'); toast.style.opacity = '0'; setTimeout(() => toast.style.display = 'none', 500); });
document.getElementById('close-popup-btn').addEventListener('click', () => zoomOut());

const canvas = document.querySelector('#jupiter-canvas'); const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000); const defaultCameraPos = { x: 0, y: 15, z: 45 }; const defaultTargetPos = { x: 0, y: 0, z: 0 }; camera.position.set(0, 70, 70); gsap.to(camera.position, { x: defaultCameraPos.x, y: defaultCameraPos.y, z: defaultCameraPos.z, duration: 2.5, ease: "power3.out" });
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true }); renderer.setSize(window.innerWidth, window.innerHeight); renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
const controls = new THREE.OrbitControls(camera, renderer.domElement); controls.enableDamping = true; controls.dampingFactor = 0.05; controls.maxDistance = 100; controls.minDistance = 12; controls.enableKeys = false; controls.enablePan = false;

const sunLight = new THREE.PointLight(0xffffff, 1.5, 500); sunLight.position.set(20, 10, 20); scene.add(sunLight); scene.add(new THREE.AmbientLight(0x444444)); 
const textureLoader = new THREE.TextureLoader(); const jupiterRadius = 10; const jupiterGeo = new THREE.SphereGeometry(jupiterRadius, 64, 64); const jupiterMat = new THREE.MeshStandardMaterial({ map: textureLoader.load('./images/jupiter.jpg') }); const jupiter = new THREE.Mesh(jupiterGeo, jupiterMat); scene.add(jupiter);

const stormHitboxes = []; const animatedTornados = []; const stormColors = [0xffd700, 0x4b90ff, 0xff4d4d]; 
function getSurfacePosition(radius, phi, theta) { return new THREE.Vector3(radius * Math.sin(phi) * Math.cos(theta), radius * Math.cos(phi), radius * Math.sin(phi) * Math.sin(theta)); }
const stormPositions = [ getSurfacePosition(jupiterRadius, Math.PI / 2.2, 0), getSurfacePosition(jupiterRadius, Math.PI / 1.5, Math.PI / 1.5), getSurfacePosition(jupiterRadius, Math.PI / 3, -Math.PI / 1.2) ];

const labelsContainer = document.getElementById('labels-container'); const stormLabels = [];
for(let i = 0; i < 3; i++) {
    const stormGroup = new THREE.Group(); const pos = stormPositions[i]; stormGroup.position.copy(pos); const surfaceNormal = pos.clone().normalize(); stormGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), surfaceNormal);
    const particleCount = 1500; const stormMaxRadius = 2.8; const stormHeight = 0.1; const particlesGeo = new THREE.BufferGeometry(); const positions = new Float32Array(particleCount * 3);
    for (let p = 0; p < particleCount; p++) { const r = Math.pow(Math.random(), 1.5) * stormMaxRadius; const theta = Math.random() * Math.PI * 2; const y = Math.random() * stormHeight; positions[p * 3] = r * Math.cos(theta); positions[p * 3 + 1] = y; positions[p * 3 + 2] = r * Math.sin(theta); }
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3)); const particlesMat = new THREE.PointsMaterial({ color: stormColors[i], size: 0.08, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending }); const tornado = new THREE.Points(particlesGeo, particlesMat); stormGroup.add(tornado); animatedTornados.push(tornado); 
    const hitGeo = new THREE.CylinderGeometry(stormMaxRadius, stormMaxRadius, 0.5, 32); hitGeo.translate(0, 0.25, 0); const hitMesh = new THREE.Mesh(hitGeo, new THREE.MeshBasicMaterial({ visible: false })); hitMesh.userData = { id: i }; stormGroup.add(hitMesh); stormHitboxes.push(hitMesh); 
    const label = document.createElement('div'); label.className = 'planet-label'; label.innerText = skillsData[i].title; labelsContainer.appendChild(label); stormLabels.push({ mesh: hitMesh, element: label, id: i });
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 16), new THREE.MeshBasicMaterial({ color: stormColors[i] })); core.position.y = -0.1; stormGroup.add(core); jupiter.add(stormGroup);
}

const starGeo = new THREE.BufferGeometry(); const starMat = new THREE.PointsMaterial({color: 0xffffff, size: 0.1}); const starVertices = []; for(let i = 0; i < 2000; i++) starVertices.push((Math.random() - 0.5) * 400, (Math.random() - 0.5) * 400, (Math.random() - 0.5) * 400); starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3)); scene.add(new THREE.Points(starGeo, starMat));

let isZoomedIn = false; const keys = { w: false, a: false, s: false, d: false, arrowup: false, arrowleft: false, arrowdown: false, arrowright: false, e: false, q: false };
window.addEventListener('keydown', (event) => { const key = event.key.toLowerCase(); if (event.key === 'Escape') { if (window.isMenuOpen) { document.getElementById('menu-btn').click(); return; } const toast = document.getElementById('intro-toast'); if (toast && toast.style.opacity !== '0') { toast.style.opacity = '0'; setTimeout(() => toast.style.display = 'none', 500); } if (isZoomedIn) zoomOut(); else window.location.href = 'index.html'; return; } if (keys.hasOwnProperty(key)) keys[key] = true; });
window.addEventListener('keyup', (event) => { const key = event.key.toLowerCase(); if (keys.hasOwnProperty(key)) keys[key] = false; });

const raycaster = new THREE.Raycaster(); const mouse = new THREE.Vector2(); let hoveredStorm = null;
window.addEventListener('mousemove', (event) => {
    if (isZoomedIn || window.isMenuOpen) return; mouse.x = (event.clientX / window.innerWidth) * 2 - 1; mouse.y = -(event.clientY / window.innerHeight) * 2 + 1; raycaster.setFromCamera(mouse, camera); const intersects = raycaster.intersectObjects(stormHitboxes); 
    if (intersects.length > 0) { document.body.classList.add('cursor-hover'); hoveredStorm = intersects[0].object; gsap.to(hoveredStorm.parent.scale, { x: 1.15, y: 1.15, z: 1.15, duration: 0.3 }); } else { document.body.classList.remove('cursor-hover'); hoveredStorm = null; stormHitboxes.forEach(hitbox => gsap.to(hitbox.parent.scale, { x: 1, y: 1, z: 1, duration: 0.3 })); }
});

window.addEventListener('click', () => { if (isZoomedIn || window.isMenuOpen) return; raycaster.setFromCamera(mouse, camera); const intersects = raycaster.intersectObjects(stormHitboxes); if (intersects.length > 0) zoomIntoStorm(intersects[0].object); });

function zoomIntoStorm(hitbox) {
    if(typeof window.completeQuest === 'function') window.completeQuest('quest_jupiter'); 
    isZoomedIn = true; controls.enabled = false; document.body.classList.remove('cursor-hover'); hoveredStorm = null; 
    const toast = document.getElementById('intro-toast'); toast.style.opacity = '0'; setTimeout(() => toast.style.display = 'none', 500);
    gsap.to('#quest-container', { opacity: 0, duration: 0.5 }); 
    const stormPos = new THREE.Vector3(); hitbox.getWorldPosition(stormPos); const jupiterPos = new THREE.Vector3(); jupiter.getWorldPosition(jupiterPos); const direction = new THREE.Vector3().subVectors(stormPos, jupiterPos).normalize(); const camTargetPos = stormPos.clone().add(direction.multiplyScalar(6)); camTargetPos.x += 2.5; 
    gsap.to(camera.position, { x: camTargetPos.x, y: camTargetPos.y, z: camTargetPos.z, duration: 1.5, ease: "power2.inOut" }); gsap.to(controls.target, { x: stormPos.x, y: stormPos.y, z: stormPos.z, duration: 1.5, ease: "power2.inOut", onUpdate: () => controls.update(), onComplete: () => showSkillPopup(hitbox.userData.id) });
}

function showSkillPopup(index) {
    const data = skillsData[index]; const popup = document.getElementById('skill-popup'); document.getElementById('skill-title').innerText = data.title; document.getElementById('skill-subtitle').innerText = data.subtitle; document.getElementById('skill-subtitle').style.color = data.color; document.getElementById('skill-subtitle').style.textShadow = `0 0 15px ${data.color}80`; document.getElementById('skill-desc').innerHTML = data.desc;
    const badgesDiv = document.getElementById('skill-badges'); badgesDiv.innerHTML = ''; data.badges.forEach(b => { badgesDiv.innerHTML += `<span class="badge" style="border-color: ${data.color}; color: ${data.color}; padding: 6px 12px; border-radius: 20px; font-size: 0.85rem; border: 1px solid;">${b}</span>`; });
    const barsContainer = document.getElementById('skill-bars-container'); barsContainer.innerHTML = ''; 
    if (data.bars && data.bars.length > 0) { data.bars.forEach((bar, i) => { barsContainer.innerHTML += `<div class="skill-row"><div class="skill-label"><span>${bar.name}</span><span>${bar.percent}%</span></div><div class="skill-bar-bg"><div class="skill-bar-fill" id="bar-${index}-${i}" style="background: ${data.color}; box-shadow: 0 0 10px ${data.color}80;"></div></div></div>`; }); }
    const actionBtn = document.getElementById('skill-action-btn'); actionBtn.style.background = data.color; popup.style.pointerEvents = 'auto'; 
    gsap.to(popup, { opacity: 1, duration: 0.5, onComplete: () => { if (data.bars && data.bars.length > 0) { data.bars.forEach((bar, i) => { const fillElement = document.getElementById(`bar-${index}-${i}`); if (fillElement) { setTimeout(() => { fillElement.style.width = `${bar.percent}%`; }, i * 150); } }); } }});
}

function zoomOut() {
    const popup = document.getElementById('skill-popup'); popup.style.pointerEvents = 'none'; const fills = document.querySelectorAll('.skill-bar-fill'); fills.forEach(fill => fill.style.width = '0%');
    gsap.to('#quest-container', { opacity: 1, duration: 0.3 }); 
    gsap.to(popup, { opacity: 0, duration: 0.3, onComplete: () => { gsap.to(camera.position, { x: defaultCameraPos.x, y: defaultCameraPos.y, z: defaultCameraPos.z, duration: 1.5, ease: "power2.inOut" }); gsap.to(controls.target, { x: defaultTargetPos.x, y: defaultTargetPos.y, z: defaultTargetPos.z, duration: 1.5, ease: "power2.inOut", onUpdate: () => controls.update(), onComplete: () => { isZoomedIn = false; controls.enabled = true; } }); }});
}

window.addEventListener('resize', () => { camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight); });

function animate() {
    requestAnimationFrame(animate); animatedTornados.forEach(tornado => { tornado.rotation.y -= 0.05; });
    if (!isZoomedIn && !window.isMenuOpen) {
        jupiter.rotation.y += 0.0015; 
        if (keys.w || keys.a || keys.s || keys.d || keys.arrowup || keys.arrowleft || keys.arrowdown || keys.arrowright || keys.e || keys.q) {
            const spherical = new THREE.Spherical().setFromVector3(camera.position); const rotationSpeed = 0.03;
            if (keys.a || keys.arrowleft) spherical.theta -= rotationSpeed; if (keys.d || keys.arrowright) spherical.theta += rotationSpeed; if (keys.w || keys.arrowup) spherical.phi -= rotationSpeed; if (keys.s || keys.arrowdown) spherical.phi += rotationSpeed;
            spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi)); if (keys.e) spherical.radius = Math.max(controls.minDistance, spherical.radius - 2.0); if (keys.q) spherical.radius = Math.min(controls.maxDistance, spherical.radius + 2.0); camera.position.setFromSpherical(spherical); camera.lookAt(controls.target); 
        }
    }

    stormLabels.forEach(item => {
        if (isZoomedIn || window.isMenuOpen) { item.element.classList.add('hidden'); } else {
            item.element.classList.remove('hidden'); const vector = new THREE.Vector3(); item.mesh.getWorldPosition(vector); vector.y += 1.5; vector.project(camera);
            if (vector.z > 1) { item.element.style.opacity = '0'; return; } else { item.element.style.opacity = '1'; }
            const x = (vector.x * 0.5 + 0.5) * window.innerWidth; const y = (vector.y * -0.5 + 0.5) * window.innerHeight; item.element.style.left = `${x}px`; item.element.style.top = `${y}px`;
            if (hoveredStorm === item.mesh) { item.element.classList.add('hovered'); item.element.style.boxShadow = `0 0 15px ${skillsData[item.id].color}80`; item.element.style.borderColor = skillsData[item.id].color; } else { item.element.classList.remove('hovered'); item.element.style.boxShadow = '0 0 5px rgba(0, 0, 0, 0.5)'; item.element.style.borderColor = 'rgba(255, 255, 255, 0.15)'; }
        }
    });
    if(!isZoomedIn) controls.update(); renderer.render(scene, camera);
}
animate();