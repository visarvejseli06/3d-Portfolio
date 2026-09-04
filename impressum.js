// ==========================================
// 3D LOGIK FÜR: IMPRESSUM (SONNE)
// ==========================================

const canvas = document.querySelector('#sun-canvas'); const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000); camera.position.set(0, 0, 30); 
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true }); renderer.setSize(window.innerWidth, window.innerHeight); renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
const textureLoader = new THREE.TextureLoader();

const sunGeo = new THREE.SphereGeometry(12, 64, 64); const sunMat = new THREE.MeshBasicMaterial({ map: textureLoader.load('./images/sun.jpg') }); const sun = new THREE.Mesh(sunGeo, sunMat); sun.position.set(10, 0, 0); scene.add(sun);
const auraGeo = new THREE.SphereGeometry(12.5, 64, 64); const auraMat = new THREE.MeshBasicMaterial({ color: 0xff8c00, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending }); const aura = new THREE.Mesh(auraGeo, auraMat); sun.add(aura);

const starGeo = new THREE.BufferGeometry(); const starMat = new THREE.PointsMaterial({color: 0xffffff, size: 0.05}); const starVertices = [];
for(let i = 0; i < 1500; i++) { starVertices.push((Math.random() - 0.5) * 150, (Math.random() - 0.5) * 150, (Math.random() - 0.5) * 150 - 20); }
starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3)); scene.add(new THREE.Points(starGeo, starMat));

window.addEventListener('resize', () => { camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight); });

let time = 0;
function animate() {
    requestAnimationFrame(animate);
    if(!window.isMenuOpen){ time += 0.05; sun.rotation.y += 0.001; aura.scale.setScalar(1 + Math.sin(time) * 0.02); }
    renderer.render(scene, camera);
}
animate();