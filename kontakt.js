// ==========================================
// 3D LOGIK FÜR: KONTAKT (WURMLOCH)
// ==========================================

const canvas = document.querySelector('#wormhole-canvas'); 
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x050011, 0.0015); 

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000); 
camera.position.z = 0;

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true }); 
renderer.setSize(window.innerWidth, window.innerHeight); 
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); 
renderer.setClearColor(0x050011);

const particleCount = 3000; const geometry = new THREE.BufferGeometry(); const positions = new Float32Array(particleCount * 3); const speeds = new Float32Array(particleCount);
for (let i = 0; i < particleCount; i++) {
    const angle = Math.random() * Math.PI * 2; const radius = 10 + Math.random() * 40; const x = Math.cos(angle) * radius; const y = Math.sin(angle) * radius; const z = (Math.random() - 0.5) * 1000; 
    positions[i * 3] = x; positions[i * 3 + 1] = y; positions[i * 3 + 2] = z; speeds[i] = 1.5 + Math.random() * 2; 
}
geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
const material = new THREE.PointsMaterial({ color: 0xaa55ff, size: 0.8, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending });
const particles = new THREE.Points(geometry, material); scene.add(particles);

window.addEventListener('resize', () => { camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight); });

function animate() {
    requestAnimationFrame(animate); particles.rotation.z -= 0.002; const positionsAttr = geometry.attributes.position; const positionsArray = positionsAttr.array;
    if(!window.isMenuOpen) {
        for (let i = 0; i < particleCount; i++) { positionsArray[i * 3 + 2] += speeds[i]; if (positionsArray[i * 3 + 2] > 50) { positionsArray[i * 3 + 2] = -900; } }
        positionsAttr.needsUpdate = true; 
    }
    renderer.render(scene, camera);
}
animate();

if(typeof window.completeQuest === 'function') {
    window.completeQuest('quest_blackhole');
}