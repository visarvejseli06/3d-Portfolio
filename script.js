// ==========================================================================
// HAUPT-UNIVERSUM LOGIK (index.html)
// ==========================================================================

// --- 1. UI VERSTECKEN BEIM ZOOM ---
function hideUIElements() {
    gsap.to('.ui-layer', { opacity: 0, duration: 0.5 });
    gsap.to('#help-btn', { opacity: 0, duration: 0.5 });
    gsap.to('#sound-toggle', { opacity: 0, duration: 0.5 });
    gsap.to('#menu-btn', { opacity: 0, duration: 0.5 });
    gsap.to('#labels-container', { opacity: 0, duration: 0.5 }); 
}

// --- 2. SOUND DESIGN (Web Audio API) ---
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx;
let isSoundMuted = true;

const soundToggle = document.getElementById('sound-toggle');
if(soundToggle) {
    soundToggle.addEventListener('click', () => {
        if (isSoundMuted) {
            if (!audioCtx) audioCtx = new AudioContext();
            if (audioCtx.state === 'suspended') audioCtx.resume();
            isSoundMuted = false;
            soundToggle.innerText = '🔊 Sound ON';
            soundToggle.classList.add('active');
        } else {
            isSoundMuted = true;
            soundToggle.innerText = '🔇 Sound OFF';
            soundToggle.classList.remove('active');
        }
    });
}

function playHoverSound() {
    if (isSoundMuted || !audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
    osc.start(); osc.stop(audioCtx.currentTime + 0.1);
}

function playWarpSound() {
    if (isSoundMuted || !audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(200, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(20, audioCtx.currentTime + 1.5);
    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.5);
    osc.start(); osc.stop(audioCtx.currentTime + 1.5);
}

// --- 3. LADEBILDSCHIRM (Loading Manager) ---
const loaderScreen = document.getElementById('loader-screen');
const progressFill = document.getElementById('progress-fill');
const percentageText = document.getElementById('loader-percentage');
const loaderText = document.getElementById('loader-text');
const manager = new THREE.LoadingManager();

manager.onProgress = function (url, itemsLoaded, itemsTotal) {
    const progress = (itemsLoaded / itemsTotal) * 100;
    progressFill.style.width = progress + '%';
    percentageText.innerText = Math.round(progress) + '%';
};

manager.onLoad = function () {
    if (sessionStorage.getItem('introPlayed') === 'true') {
        loaderScreen.style.display = 'none';
        gsap.to("#ui-subtitle", { opacity: 1, duration: 1 });
        resetIdleTimer(); 
    } else {
        loaderText.style.color = '#4b90ff'; 
        loaderText.innerText = 'Fliege zu Solarsystem VisarVejseli 🚀';
        progressFill.style.background = '#4b90ff';
        progressFill.style.boxShadow = '0 0 20px #4b90ff';
        percentageText.style.opacity = '0'; 
        
        setTimeout(() => {
            loaderScreen.style.opacity = '0';
            setTimeout(() => {
                loaderScreen.style.display = 'none';
                sessionStorage.setItem('introPlayed', 'true');
                const tl = gsap.timeline();
                tl.to("#ui-title", { opacity: 1, duration: 1.5, ease: "power2.out" })
                  .to("#ui-title", { opacity: 0, duration: 1, delay: 2.5, ease: "power2.in" })
                  .to("#ui-subtitle", { opacity: 1, duration: 1.5, ease: "power2.out", onComplete: resetIdleTimer });
            }, 1500);
        }, 1200);
    }
};

// --- 4. THREE.JS SZENE SETUP ---
const textureLoader = new THREE.TextureLoader(manager);
const canvas = document.querySelector('#webgl-canvas');
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 30, 120); 

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; 
controls.dampingFactor = 0.05;
controls.maxDistance = 300; 
controls.minDistance = 15;
controls.enableKeys = false; 
controls.enablePan = false;

// --- 5. IDLE MODUS (Autopilot) ---
let idleTimeout; 
let isIdle = false; 
const IDLE_DELAY = 10000; 

function resetIdleTimer() {
    if (isIdle) {
        isIdle = false;
        gsap.to(controls, { autoRotateSpeed: 0, duration: 1, onComplete: () => { controls.autoRotate = false; }});
    }
    clearTimeout(idleTimeout);
    // Greift auf window.isMenuOpen aus global.js zu
    if (!isZooming && !isHelpOpen && !window.isMenuOpen) {
        idleTimeout = setTimeout(() => {
            isIdle = true; 
            controls.autoRotate = true; 
            controls.autoRotateSpeed = 0; 
            gsap.to(controls, { autoRotateSpeed: 1.5, duration: 2 }); 
        }, IDLE_DELAY);
    }
}

['mousemove', 'mousedown', 'keydown', 'wheel', 'touchstart'].forEach(evt => window.addEventListener(evt, resetIdleTimer));

// --- 6. PLANETEN & OBJEKTE GENERIEREN ---
const solarSystem = new THREE.Group(); 
scene.add(solarSystem);

const sunLight = new THREE.PointLight(0xffffff, 2, 500); 
scene.add(sunLight); 
scene.add(new THREE.AmbientLight(0x222222));

const sunGeo = new THREE.SphereGeometry(8, 64, 64); 
const sunMat = new THREE.MeshBasicMaterial({ map: textureLoader.load('./images/sun.jpg') }); 
const sun = new THREE.Mesh(sunGeo, sunMat); 
sun.userData = { url: 'impressum.html', title: 'IMPRESSUM' }; 
solarSystem.add(sun); 

function createOrbit(radius) {
    const orbitGeo = new THREE.RingGeometry(radius - 0.1, radius + 0.1, 128); 
    const orbitMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, transparent: true, opacity: 0.15 });
    const orbit = new THREE.Mesh(orbitGeo, orbitMat); 
    orbit.rotation.x = Math.PI / 2; 
    solarSystem.add(orbit); 
}

const earthGeo = new THREE.SphereGeometry(2.5, 64, 64); 
const earthMat = new THREE.MeshStandardMaterial({ map: textureLoader.load('./images/earth.jpg') }); 
const earth = new THREE.Mesh(earthGeo, earthMat); 
earth.userData = { url: 'ueber-mich.html', title: 'ÜBER MICH' }; 
solarSystem.add(earth); 
createOrbit(25);

const jupiterGeo = new THREE.SphereGeometry(5.5, 64, 64); 
const jupiterMat = new THREE.MeshStandardMaterial({ map: textureLoader.load('./images/jupiter.jpg') });
const jupiter = new THREE.Mesh(jupiterGeo, jupiterMat); 
jupiter.userData = { url: 'skills.html', title: 'SKILLS' }; 
solarSystem.add(jupiter); 
createOrbit(45);

const saturnGeo = new THREE.SphereGeometry(4.5, 64, 64); 
const saturnMat = new THREE.MeshStandardMaterial({ map: textureLoader.load('./images/saturn.jpg') });
const saturn = new THREE.Mesh(saturnGeo, saturnMat); 
saturn.userData = { url: 'projekte.html', title: 'PROJEKTE' }; 

const ring1Geo = new THREE.RingGeometry(5.5, 8.0, 64); 
const ring1Mat = new THREE.MeshStandardMaterial({ color: 0xd2b48c, side: THREE.DoubleSide, transparent: true, opacity: 0.9 });
const ring1 = new THREE.Mesh(ring1Geo, ring1Mat); 
ring1.rotation.x = Math.PI / 2; 
saturn.add(ring1);

const ring2Geo = new THREE.RingGeometry(8.3, 9.2, 64); 
const ring2Mat = new THREE.MeshStandardMaterial({ color: 0xba9a70, side: THREE.DoubleSide, transparent: true, opacity: 0.6 });
const ring2 = new THREE.Mesh(ring2Geo, ring2Mat); 
ring2.rotation.x = Math.PI / 2; 
saturn.add(ring2);

solarSystem.add(saturn); 
createOrbit(70);

const starGeo = new THREE.BufferGeometry(); 
const starMat = new THREE.PointsMaterial({color: 0xffffff, size: 0.15}); 
const starVertices = [];
for(let i = 0; i < 2500; i++) starVertices.push((Math.random() - 0.5) * 400, (Math.random() - 0.5) * 400, (Math.random() - 0.5) * 400);
starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3)); 
const stars = new THREE.Points(starGeo, starMat); 
solarSystem.add(stars); 

const blackHoleGroup = new THREE.Group(); 
blackHoleGroup.position.set(-80, 10, -80); 
const bhGeo = new THREE.SphereGeometry(6, 64, 64); 
const bhMat = new THREE.MeshBasicMaterial({ color: 0x000000 }); 
const blackHole = new THREE.Mesh(bhGeo, bhMat); 
blackHole.userData = { url: 'kontakt.html', title: 'SCHWARZES LOCH', isBlackHole: true };
const bhDiskGeo = new THREE.RingGeometry(7, 16, 64); 
const bhDiskMat = new THREE.MeshBasicMaterial({ color: 0x6a0dad, side: THREE.DoubleSide, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending });
const bhDisk = new THREE.Mesh(bhDiskGeo, bhDiskMat); 
bhDisk.rotation.x = Math.PI / 2; 
blackHoleGroup.add(blackHole); 
blackHoleGroup.add(bhDisk); 
scene.add(blackHoleGroup); 

const clickablePlanets = [earth, jupiter, saturn, blackHole, sun];

// --- 7. PERMANENTE LABELS ---
const labelsContainer = document.getElementById('labels-container'); 
const planetLabels = [];

clickablePlanets.forEach((planet) => {
    const label = document.createElement('div'); 
    label.className = 'planet-label'; 
    label.innerText = planet.userData.title;
    if(labelsContainer) labelsContainer.appendChild(label); 
    planetLabels.push({ mesh: planet, element: label });
});

// --- 8. TUTORIAL & HELP MODAL ---
const tutorialOverlay = document.getElementById('tutorial-overlay'); 
let tutorialDismissed = false;

function hideTutorial() { 
    if (!tutorialDismissed && tutorialOverlay) { 
        tutorialOverlay.classList.add('tutorial-hidden'); 
        tutorialDismissed = true; 
    } 
}

const keys = { w: false, a: false, s: false, d: false, arrowup: false, arrowleft: false, arrowdown: false, arrowright: false, e: false, q: false };

window.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();
    if (event.key === 'Escape') {
        if(isHelpOpen) { helpModal.classList.add('modal-hidden'); isHelpOpen = false; resetIdleTimer(); }
        if(window.isMenuOpen) { 
            document.getElementById('menu-btn').classList.remove('open'); 
            document.getElementById('fast-travel-menu').classList.remove('open'); 
            window.isMenuOpen = false; 
            resetIdleTimer(); 
        }
        return;
    }
    if (keys.hasOwnProperty(key)) { keys[key] = true; hideTutorial(); }
});

window.addEventListener('keyup', (event) => { 
    const key = event.key.toLowerCase(); 
    if (keys.hasOwnProperty(key)) keys[key] = false; 
});

const helpBtn = document.getElementById('help-btn'); 
const helpModal = document.getElementById('help-modal'); 
const closeHelpBtn = document.getElementById('close-help-btn'); 
let isHelpOpen = false;

if(helpBtn) helpBtn.addEventListener('click', () => { helpModal.classList.remove('modal-hidden'); isHelpOpen = true; clearTimeout(idleTimeout); });
if(closeHelpBtn) closeHelpBtn.addEventListener('click', () => { helpModal.classList.add('modal-hidden'); isHelpOpen = false; resetIdleTimer(); });
if(helpModal) helpModal.addEventListener('click', (e) => { if(e.target === helpModal) { helpModal.classList.add('modal-hidden'); isHelpOpen = false; resetIdleTimer(); } });

// --- 9. RAYCASTER & INTERAKTION ---
const raycaster = new THREE.Raycaster(); 
const mouse = new THREE.Vector2(); 
let isZooming = false; 
let hoveredPlanet = null;

window.addEventListener('mousemove', (event) => {
    if (isZooming || isHelpOpen || window.isMenuOpen) return;
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1; 
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera); 
    const intersects = raycaster.intersectObjects(clickablePlanets);
    
    if (intersects.length > 0) {
        if (hoveredPlanet !== intersects[0].object) playHoverSound(); 
        document.body.classList.add('cursor-hover'); 
        hoveredPlanet = intersects[0].object;
    } else { 
        document.body.classList.remove('cursor-hover'); 
        hoveredPlanet = null; 
    }
});

window.addEventListener('click', () => {
    if (isZooming || isHelpOpen || window.isMenuOpen) return; 
    raycaster.setFromCamera(mouse, camera); 
    const intersects = raycaster.intersectObjects(clickablePlanets);
    
    if (intersects.length > 0) {
        isZooming = true; 
        controls.enabled = false; 
        document.body.classList.remove('cursor-hover'); 
        hoveredPlanet = null; 
        playWarpSound(); 
        clearTimeout(idleTimeout); 
        
        const targetObj = intersects[0].object; 
        const targetUrl = targetObj.userData.url;
        
        hideUIElements();

        if (targetObj.userData.isBlackHole) {
            if(typeof window.completeQuest === 'function') window.completeQuest('quest_blackhole');
            
            gsap.to(solarSystem.scale, { x: 0, y: 0, z: 0, duration: 2, ease: "power3.in" });
            gsap.to(solarSystem.position, { x: blackHoleGroup.position.x, y: blackHoleGroup.position.y, z: blackHoleGroup.position.z, duration: 2, ease: "power3.in" });
            gsap.to(camera.position, { x: blackHoleGroup.position.x + 10, y: blackHoleGroup.position.y + 5, z: blackHoleGroup.position.z + 20, duration: 2.5, ease: "power2.in" });
            gsap.to(camera, { fov: 140, duration: 2.5, ease: "power2.in", onUpdate: () => camera.updateProjectionMatrix(), onComplete: () => {
                const fade = document.createElement('div'); fade.style.position = 'fixed'; fade.style.top = 0; fade.style.left = 0; fade.style.width = '100vw'; fade.style.height = '100vh'; fade.style.background = 'black'; fade.style.zIndex = 99999; fade.style.opacity = 0; fade.style.transition = 'opacity 0.3s'; document.body.appendChild(fade); fade.getBoundingClientRect(); fade.style.opacity = 1; setTimeout(() => window.location.href = targetUrl, 400);
            }});
        } else {
            const targetPosition = new THREE.Vector3(); 
            targetObj.getWorldPosition(targetPosition); 
            const planetRadius = targetObj.geometry.parameters.radius; 
            const direction = new THREE.Vector3().subVectors(camera.position, targetPosition).normalize(); 
            const cameraDestination = new THREE.Vector3().copy(targetPosition).add(direction.multiplyScalar(planetRadius * 4));
            
            gsap.to(camera, { fov: 110, duration: 0.7, yoyo: true, repeat: 1, ease: "power2.in", onUpdate: () => camera.updateProjectionMatrix() });
            gsap.to(camera.position, { x: cameraDestination.x, y: cameraDestination.y, z: cameraDestination.z, duration: 1.5, ease: "power2.inOut" });
            gsap.to(controls.target, { x: targetPosition.x, y: targetPosition.y, z: targetPosition.z, duration: 1.5, ease: "power2.inOut", onUpdate: () => controls.update(), onComplete: () => window.location.href = targetUrl });
        }
    }
});

window.addEventListener('resize', () => { 
    camera.aspect = window.innerWidth / window.innerHeight; 
    camera.updateProjectionMatrix(); 
    renderer.setSize(window.innerWidth, window.innerHeight); 
});

// --- 10. ANIMATIONS-LOOP ---
let time = 0;
function animate() {
    if (!isZooming && !isHelpOpen && !window.isMenuOpen) {
        time += 0.003; 
        sun.rotation.y += 0.002;
        earth.position.x = Math.cos(time * 0.8) * 25; 
        earth.position.z = Math.sin(time * 0.8) * 25; 
        earth.rotation.y += 0.02;
        jupiter.position.x = Math.cos(time * 0.4) * 45; 
        jupiter.position.z = Math.sin(time * 0.4) * 45; 
        jupiter.rotation.y += 0.01;
        saturn.position.x = Math.cos(time * 0.2) * 70; 
        saturn.position.z = Math.sin(time * 0.2) * 70; 
        saturn.rotation.y += 0.01;

        if (keys.w || keys.a || keys.s || keys.d || keys.arrowup || keys.arrowleft || keys.arrowdown || keys.arrowright || keys.e || keys.q) {
            const spherical = new THREE.Spherical().setFromVector3(camera.position); 
            const rotationSpeed = 0.03;
            if (keys.a || keys.arrowleft) spherical.theta -= rotationSpeed; 
            if (keys.d || keys.arrowright) spherical.theta += rotationSpeed; 
            if (keys.w || keys.arrowup) spherical.phi -= rotationSpeed; 
            if (keys.s || keys.arrowdown) spherical.phi += rotationSpeed;
            spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi)); 
            if (keys.e) spherical.radius = Math.max(controls.minDistance, spherical.radius - 2.0); 
            if (keys.q) spherical.radius = Math.min(controls.maxDistance, spherical.radius + 2.0);
            camera.position.setFromSpherical(spherical); 
            camera.lookAt(controls.target); 
        }
    }

    bhDisk.rotation.z += 0.02;

    planetLabels.forEach(item => {
        if (isZooming || isHelpOpen || window.isMenuOpen) {
            item.element.classList.add('hidden');
        } else {
            item.element.classList.remove('hidden');
            const vector = new THREE.Vector3(); 
            item.mesh.getWorldPosition(vector); 
            const sizeOffset = item.mesh.userData.isBlackHole ? 8 : (item.mesh.geometry.parameters.radius + 2); 
            vector.y += sizeOffset; 
            vector.project(camera);
            
            if (vector.z > 1) { 
                item.element.style.opacity = '0'; 
                return; 
            } else { 
                item.element.style.opacity = '1'; 
            }
            
            const x = (vector.x * 0.5 + 0.5) * window.innerWidth; 
            const y = (vector.y * -0.5 + 0.5) * window.innerHeight;
            item.element.style.left = `${x}px`; 
            item.element.style.top = `${y}px`;
            
            if (hoveredPlanet === item.mesh) {
                item.element.classList.add('hovered'); 
                item.element.style.boxShadow = item.mesh.userData.isBlackHole ? '0 0 15px rgba(138, 43, 226, 0.8)' : '0 0 10px rgba(255, 255, 255, 0.2)'; 
                item.element.style.borderColor = item.mesh.userData.isBlackHole ? '#8a2be2' : 'rgba(255, 255, 255, 0.5)';
            } else {
                item.element.classList.remove('hovered'); 
                item.element.style.boxShadow = '0 0 5px rgba(0, 0, 0, 0.5)'; 
                item.element.style.borderColor = 'rgba(255, 255, 255, 0.15)';
            }
        }
    });

    if (!isZooming) { 
        controls.enabled = !isHelpOpen && !window.isMenuOpen; 
        controls.update(); 
    }
    
    renderer.render(scene, camera); 
    requestAnimationFrame(animate);
}
animate();