// ==========================================
// 3D LOGIK FÜR: ÜBER MICH (ERDE & AVATAR)
// ==========================================

const canvas = document.querySelector('#earth-canvas'); 
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000); 
camera.position.set(0, 0, 15); 

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true }); 
renderer.setSize(window.innerWidth, window.innerHeight); 
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const controls = new THREE.OrbitControls(camera, renderer.domElement); 
controls.enableDamping = true; controls.dampingFactor = 0.05; 
controls.maxDistance = 30; controls.minDistance = 8; 
controls.enableKeys = false; controls.enablePan = false;

const sunLight = new THREE.DirectionalLight(0xffffff, 1.5); 
sunLight.position.set(-5, 3, 5); scene.add(sunLight); 
scene.add(new THREE.AmbientLight(0x222222));

const textureLoader = new THREE.TextureLoader();
const earthGeo = new THREE.SphereGeometry(6, 64, 64); 
const earthMat = new THREE.MeshStandardMaterial({ map: textureLoader.load('./images/earth.jpg') }); 
const earth = new THREE.Mesh(earthGeo, earthMat); 
earth.position.set(8, -1, 0); earth.rotation.z = 0.2; scene.add(earth);

const moonGeo = new THREE.SphereGeometry(1.5, 32, 32); moonGeo.rotateY(-Math.PI / 2); 
const moonMat = new THREE.MeshStandardMaterial({ map: textureLoader.load('./images/avatar.jpg') }); 
const moon = new THREE.Mesh(moonGeo, moonMat); 
moon.userData = { title: "MEIN AVATAR" }; scene.add(moon);

let moonAngle = 0; const moonOrbitRadius = 9; 

const starGeo = new THREE.BufferGeometry(); const starMat = new THREE.PointsMaterial({color: 0xffffff, size: 0.05}); const starVertices = []; 
for(let i = 0; i < 1000; i++) starVertices.push((Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100 - 20); 
starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3)); scene.add(new THREE.Points(starGeo, starMat));

window.addEventListener('resize', () => { 
    camera.aspect = window.innerWidth / window.innerHeight; 
    camera.updateProjectionMatrix(); 
    renderer.setSize(window.innerWidth, window.innerHeight); 
});

const raycaster = new THREE.Raycaster(); const mouse = new THREE.Vector2(); 
let isZoomedIn = false; let hoveredMoon = null;

window.addEventListener('mousemove', (event) => {
    if (isZoomedIn || window.isMenuOpen) return; 
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1; mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera); const intersects = raycaster.intersectObject(moon);
    if (intersects.length > 0) { document.body.classList.add('cursor-hover'); hoveredMoon = intersects[0].object; } 
    else { document.body.classList.remove('cursor-hover'); hoveredMoon = null; }
});

window.addEventListener('click', () => {
    if (isZoomedIn || window.isMenuOpen) return; 
    raycaster.setFromCamera(mouse, camera); const intersects = raycaster.intersectObject(moon);
    if (intersects.length > 0) {
        if(typeof window.completeQuest === 'function') window.completeQuest('quest_erde'); 
        isZoomedIn = true; controls.enabled = false; document.body.classList.remove('cursor-hover'); hoveredMoon = null; 
        gsap.to('.zenly-layout', { opacity: 0, pointerEvents: 'none', duration: 0.5 }); 
        gsap.to('.navbar', { opacity: 0, pointerEvents: 'none', duration: 0.5 }); 
        gsap.to('#quest-container', { opacity: 0, duration: 0.5 });
        const targetPos = new THREE.Vector3(); moon.getWorldPosition(targetPos); 
        const direction = new THREE.Vector3().subVectors(camera.position, targetPos).normalize(); 
        const camDestination = targetPos.clone().add(direction.multiplyScalar(4.5));
        gsap.to(camera.position, { x: camDestination.x, y: camDestination.y, z: camDestination.z, duration: 1.5, ease: "power2.inOut" });
        gsap.to(controls.target, { x: targetPos.x, y: targetPos.y, z: targetPos.z, duration: 1.5, ease: "power2.inOut", onUpdate: () => controls.update(), onComplete: () => { const popup = document.getElementById('avatar-popup'); popup.style.pointerEvents = 'auto'; gsap.to(popup, { opacity: 1, duration: 0.5 }); }});
    }
});

document.getElementById('close-avatar-btn').addEventListener('click', () => zoomOut());

function zoomOut() {
    const popup = document.getElementById('avatar-popup'); popup.style.pointerEvents = 'none'; gsap.to(popup, { opacity: 0, duration: 0.3 });
    gsap.to('.zenly-layout', { opacity: 1, pointerEvents: 'auto', duration: 0.5, delay: 0.3 }); 
    gsap.to('.navbar', { opacity: 1, pointerEvents: 'auto', duration: 0.5, delay: 0.3 }); 
    gsap.to('#quest-container', { opacity: 1, duration: 0.5, delay: 0.3 });
    gsap.to(camera.position, { x: 0, y: 0, z: 15, duration: 1.5, ease: "power2.inOut" }); 
    gsap.to(controls.target, { x: 0, y: 0, z: 0, duration: 1.5, ease: "power2.inOut", onUpdate: () => controls.update(), onComplete: () => { isZoomedIn = false; controls.enabled = true; }});
}

const keys = { w: false, a: false, s: false, d: false, arrowup: false, arrowleft: false, arrowdown: false, arrowright: false, e: false, q: false };
window.addEventListener('keydown', (event) => { const key = event.key.toLowerCase(); if (event.key === 'Escape') { if (window.isMenuOpen) { document.getElementById('menu-btn').click(); return; } if (isZoomedIn) { zoomOut(); } else { window.location.href = 'index.html'; } return; } if (keys.hasOwnProperty(key)) keys[key] = true; });
window.addEventListener('keyup', (event) => { const key = event.key.toLowerCase(); if (keys.hasOwnProperty(key)) keys[key] = false; });

function animate() {
    requestAnimationFrame(animate);
    if (!isZoomedIn && !window.isMenuOpen) {
        earth.rotation.y += 0.002; moonAngle += 0.005; 
        moon.position.x = 8 + Math.cos(moonAngle) * moonOrbitRadius; 
        moon.position.z = Math.sin(moonAngle) * moonOrbitRadius; 
        moon.position.y = -1 + Math.sin(moonAngle * 0.5) * 2.5; 
        if (keys.w || keys.a || keys.s || keys.d || keys.arrowup || keys.arrowleft || keys.arrowdown || keys.arrowright || keys.e || keys.q) {
            const spherical = new THREE.Spherical().setFromVector3(camera.position); const rotationSpeed = 0.03;
            if (keys.a || keys.arrowleft) spherical.theta -= rotationSpeed; if (keys.d || keys.arrowright) spherical.theta += rotationSpeed; if (keys.w || keys.arrowup) spherical.phi -= rotationSpeed; if (keys.s || keys.arrowdown) spherical.phi += rotationSpeed;
            spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi)); if (keys.e) spherical.radius = Math.max(controls.minDistance, spherical.radius - 1.0); if (keys.q) spherical.radius = Math.min(controls.maxDistance, spherical.radius + 1.0); camera.position.setFromSpherical(spherical); camera.lookAt(controls.target); 
        }
    }
    moon.lookAt(camera.position);
    if (!isZoomedIn) controls.update(); renderer.render(scene, camera);
}
animate();