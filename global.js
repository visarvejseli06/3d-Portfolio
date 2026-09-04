// ==========================================================================
// GLOBALE UI & UTILITY FUNKTIONEN (Wird auf allen Seiten geladen)
// ==========================================================================

// --- 1. ENTWICKLER EASTER EGG ---
console.log(
    "%c🚀 SYSTEM ONLINE: WILLKOMMEN IM BACKEND! \n%cSuchst du einen motivierten Applikationsentwickler für August 2027? \nEgal ob Andeo, Suxesiv AG oder ein anderes starkes Team – ich bin bereit. Lass uns reden!", 
    "color: #ff8c00; font-size: 1.5rem; font-weight: bold; text-shadow: 0 0 10px rgba(255, 140, 0, 0.8);", 
    "color: #4b90ff; font-size: 1.1rem; line-height: 1.5;"
);

// --- 2. TAB VISIBILITY (Komm-Zurück-Trick) ---
let originalTitle = document.title;
window.addEventListener("visibilitychange", () => {
    document.title = document.hidden ? "🛸 Signal wird schwächer..." : originalTitle;
});

// --- 3. CUSTOM CURSOR LOGIK ---
const cursorDot = document.getElementById('cursor-dot');
const cursorRing = document.getElementById('cursor-ring');

if (cursorDot && cursorRing) {
    window.addEventListener('mousemove', (e) => {
        cursorDot.style.left = `${e.clientX}px`;
        cursorDot.style.top = `${e.clientY}px`;
        cursorRing.animate({ left: `${e.clientX}px`, top: `${e.clientY}px` }, { duration: 150, fill: "forwards" });
    });

    // Hover-Effekte für Buttons & Links dynamisch anwenden
    document.querySelectorAll('a, button, .btn, #menu-btn, .close-btn, #sound-toggle').forEach(el => {
        el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });
}

// --- 4. COMMAND CENTER (BURGER MENÜ) ---
const menuBtn = document.getElementById('menu-btn');
const fastTravelMenu = document.getElementById('fast-travel-menu');
window.isMenuOpen = false; // Global verfügbar, damit die 3D-Kamera pausieren kann

if (menuBtn && fastTravelMenu) {
    menuBtn.addEventListener('click', () => {
        window.isMenuOpen = !window.isMenuOpen;
        menuBtn.classList.toggle('open', window.isMenuOpen);
        fastTravelMenu.classList.toggle('open', window.isMenuOpen);
    });
}

// --- 5. MISSION LOG (QUEST BUCH) ---
const quests = [
    { id: 'quest_erde', text: 'Erde (Über mich)' },
    { id: 'quest_jupiter', text: 'Jupiter (Skills)' },
    { id: 'quest_saturn', text: 'Saturn (Projekte)' },
    { id: 'quest_blackhole', text: 'Wurmloch (Kontakt)' }
];

window.renderQuestLog = function() {
    const logContainer = document.getElementById('mission-log-container');
    if (!logContainer) return;
    
    let html = '<h3 style="color: #ff8c00; font-size: 1rem; letter-spacing: 2px; margin-bottom: 15px; margin-top: 0; border-bottom: 1px solid rgba(255,140,0,0.3); padding-bottom: 8px;">MISSION LOG</h3>'; 
    let allDone = true;
    
    quests.forEach(q => { 
        const isDone = localStorage.getItem(q.id) === 'true'; 
        if (!isDone) allDone = false; 
        html += `<div class="quest-item ${isDone ? 'completed' : ''}"><div class="quest-checkbox"></div><span>${q.text}</span></div>`; 
    });
    
    if (allDone) { 
        html += `<div style="margin-top:15px; color:#00ffcc; font-size:0.9rem; font-weight:bold; text-align: center; text-shadow: 0 0 10px rgba(0,255,204,0.5);">🌟 ALLE MISSIONEN ERFÜLLT</div>`; 
    }
    logContainer.innerHTML = html;
};

// Quest abschließen und UI updaten
window.completeQuest = function(id) {
    if (localStorage.getItem(id) !== 'true') {
        localStorage.setItem(id, 'true');
        window.renderQuestLog();
    }
};

// Initiales Rendern beim Laden der Seite
document.addEventListener('DOMContentLoaded', window.renderQuestLog);