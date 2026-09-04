import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, sendEmailVerification } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { getFirestore, collection, addDoc, deleteDoc, doc, query, onSnapshot, orderBy, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAzUBMvVycv1a6atx1ncrqbtGsUGr8crpk",
    authDomain: "budget-tracker-ec65d.firebaseapp.com",
    projectId: "budget-tracker-ec65d",
    storageBucket: "budget-tracker-ec65d.firebasestorage.app",
    messagingSenderId: "1059384562064",
    appId: "1:1059384562064:web:9121024ee9eb914ed6a315"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const ADMIN_EMAIL = "visarvejseli@admin.com";
let currentUser = null;
let unsubscribeFixed = null, unsubscribeVar = null, unsubscribeAdmin = null;

let totalFixed = 0;
let totalVar = 0;
let chartInstance = null;

let activeFixed = [];
let archiveFixed = [];
let activeVar = [];
let archiveVar = [];
let modalConfirmCallback = null;

window.showModal = function(title, message, isConfirm, callback) {
    document.getElementById('modal-title').innerText = title;
    document.getElementById('modal-message').innerText = message;
    
    const cancelBtn = document.getElementById('modal-btn-cancel');
    if(isConfirm) {
        cancelBtn.classList.remove('hidden');
    } else {
        cancelBtn.classList.add('hidden');
    }

    modalConfirmCallback = callback;
    document.getElementById('custom-modal').classList.remove('hidden');
};

document.getElementById('modal-btn-cancel').addEventListener('click', () => {
    document.getElementById('custom-modal').classList.add('hidden');
});

document.getElementById('modal-btn-confirm').addEventListener('click', () => {
    document.getElementById('custom-modal').classList.add('hidden');
    if(modalConfirmCallback) modalConfirmCallback();
});

const menuOverlay = document.getElementById('menu-overlay');
const sideMenu = document.getElementById('side-menu');
const burgerBtn = document.getElementById('burger-btn');

function closeMenu() {
    sideMenu.classList.remove('open');
    menuOverlay.classList.remove('show');
    if (currentUser) burgerBtn.classList.remove('hidden');
}

burgerBtn.addEventListener('click', () => {
    sideMenu.classList.add('open');
    menuOverlay.classList.add('show');
    burgerBtn.classList.add('hidden');
});

document.getElementById('close-menu').addEventListener('click', closeMenu);
menuOverlay.addEventListener('click', closeMenu);

window.switchView = function(targetId) {
    const views = ['view-home', 'view-income', 'view-expenses', 'view-overview'];
    views.forEach(v => document.getElementById(v).classList.add('hidden'));
    document.getElementById(targetId).classList.remove('hidden');
    
    document.querySelectorAll('.nav-btn[data-target]').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-target') === targetId);
    });

    closeMenu();
};

document.querySelectorAll('.nav-btn[data-target]').forEach(btn => {
    btn.addEventListener('click', (e) => switchView(e.target.getAttribute('data-target')));
});

function showMessage(text, isError) {
    const msgBox = document.getElementById('auth-msg');
    msgBox.innerText = text;
    msgBox.className = isError ? 'msg-red' : 'msg-green';
}

document.getElementById('btnRegister').addEventListener('click', () => {
    const email = document.getElementById('email').value.trim().toLowerCase();
    const pass = document.getElementById('password').value;
    if(!email || !pass) return showMessage("Bitte füll beides aus!", true);

    createUserWithEmailAndPassword(auth, email, pass).then(async (userCredential) => {
        await setDoc(doc(db, "userListe", userCredential.user.uid), { email, uid: userCredential.user.uid, timestamp: new Date() });
        if (email === ADMIN_EMAIL) return signOut(auth);
        sendEmailVerification(userCredential.user).then(() => { showMessage("Mail gesendet!", false); signOut(auth); });
    }).catch(() => showMessage("Fehler aufgetreten!", true));
});

document.getElementById('btnLogin').addEventListener('click', () => {
    const email = document.getElementById('email').value.trim().toLowerCase();
    const pass = document.getElementById('password').value;
    signInWithEmailAndPassword(auth, email, pass).then((u) => {
        if (u.user.email !== ADMIN_EMAIL && !u.user.emailVerified) { showMessage("Konto nicht verifiziert!", true); signOut(auth); }
    }).catch(() => showMessage("Falsche Daten!", true));
});

const logoutHandler = () => signOut(auth);
document.getElementById('btnLogout').addEventListener('click', logoutHandler);
document.getElementById('btnAdminLogout').addEventListener('click', logoutHandler);

onAuthStateChanged(auth, (user) => {
    if (user && (user.emailVerified || (user.email||"").toLowerCase() === ADMIN_EMAIL)) {
        currentUser = user;
        document.getElementById('auth-section').classList.add('hidden');
        
        if ((user.email||"").toLowerCase() === ADMIN_EMAIL) {
            document.getElementById('admin-section').classList.remove('hidden');
            loadAdminDaten();
        } else {
            document.getElementById('app-section').classList.remove('hidden');
            document.getElementById('burger-btn').classList.remove('hidden');
            switchView('view-home');
            initChart();
            loadDaten(); 
        }
    } else {
        currentUser = null;
        document.getElementById('auth-section').classList.remove('hidden');
        document.getElementById('app-section').classList.add('hidden');
        document.getElementById('admin-section').classList.add('hidden');
        document.getElementById('burger-btn').classList.add('hidden');
        
        document.getElementById('side-menu').classList.remove('open');
        document.getElementById('menu-overlay').classList.remove('show');
        
        if(chartInstance) { chartInstance.destroy(); chartInstance = null; }
        if(unsubscribeFixed) unsubscribeFixed();
        if(unsubscribeVar) unsubscribeVar();
    }
});

function loadAdminDaten() {
    unsubscribeAdmin = onSnapshot(query(collection(db, "userListe")), (snapshot) => {
        const list = document.getElementById('admin-user-list'); list.innerHTML = '';
        snapshot.forEach((docSnap) => {
            if (docSnap.data().email === ADMIN_EMAIL) return;
            const li = document.createElement('li');
            li.style.borderBottom = "1px solid var(--border)";
            li.innerHTML = `<span>${docSnap.data().email}</span><button class="delete-btn" data-uid="${docSnap.data().uid}">✕</button>`;
            
            // NEU: Der Klick-Befehl zum Löschen des Users aus der Liste
            li.querySelector('.delete-btn').addEventListener('click', async (e) => {
                if(confirm("Willst du diesen User wirklich aus deiner Liste entfernen?")) {
                    const uid = e.target.getAttribute('data-uid');
                    await deleteDoc(doc(db, "userListe", uid));
                }
            });

            list.appendChild(li);
        });
    });
}

window.startNewMonth = function() {
    window.showModal("Neuer Monat", "Aktuelle Einträge werden ins Archiv verschoben. Willst du fortfahren?", true, async () => {
        const btn = document.getElementById('btn-new-month');
        btn.innerText = "Wird verarbeitet...";
        btn.disabled = true;

        try {
            for (let item of activeFixed) {
                await updateDoc(doc(db, `users/${currentUser.uid}/fixed`, item.id), { archived: true });
                if (item.recurring) {
                    await addDoc(collection(db, `users/${currentUser.uid}/fixed`), {
                        category: item.category, desc: item.desc, amount: item.amount, recurring: true, archived: false, timestamp: new Date()
                    });
                }
            }
            for (let item of activeVar) {
                await updateDoc(doc(db, `users/${currentUser.uid}/transactions`, item.id), { archived: true });
                if (item.recurring) {
                    await addDoc(collection(db, `users/${currentUser.uid}/transactions`), {
                        category: item.category, desc: item.desc, amount: item.amount, recurring: true, archived: false, timestamp: new Date()
                    });
                }
            }
            window.showModal("Erfolgreich", "Neuer Monat wurde erfolgreich gestartet!", false);
        } catch (e) {
            console.error(e);
            window.showModal("Fehler", "Es gab ein Problem beim Starten des neuen Monats.", false);
        }
        
        btn.innerText = "🗓 Neuer Monat starten";
        btn.disabled = false;
    });
};

function initChart() {
    const ctx = document.getElementById('budgetChart').getContext('2d');
    chartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Verfügbar', 'Ausgegeben'],
            datasets: [{
                data: [1, 0],
                backgroundColor: ['#FFFFFF', '#2C2C2E'],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: { 
            responsive: true, 
            maintainAspectRatio: false, 
            cutout: '75%',
            plugins: { legend: { position: 'bottom', labels: { color: '#8E8E93', font: { family: 'Poppins', size: 14 } } } } 
        }
    });
}

function updateDashboardUI() {
    document.getElementById('stat-fixed').innerText = totalFixed.toFixed(2) + ' CHF';
    const spent = Math.abs(totalVar);
    document.getElementById('stat-spent').innerText = spent.toFixed(2) + ' CHF';
    const currentTotal = totalFixed + totalVar;
    document.getElementById('stat-total').innerText = currentTotal.toFixed(2) + ' CHF';

    if(chartInstance) {
        const verfuegbar = currentTotal > 0 ? currentTotal : 0; 
        chartInstance.data.datasets[0].data = [verfuegbar, spent];
        chartInstance.update();
    }
    renderOverview();
}

function createOverviewItem(data) {
    const isPlus = data.amount >= 0;
    const li = document.createElement('li');
    const tag = data.col === 'fixed' ? 'Budget' : 'Ausgabe';
    const recurringTag = data.recurring ? `<span class="tag recurring">Monatlich</span>` : '';
    const sign = isPlus ? '+' : '';
    const titleStr = data.category ? (data.desc ? `${data.category} - ${data.desc}` : data.category) : data.desc;

    li.innerHTML = `
        <div class="transaction-info">
            <span class="transaction-title">${titleStr} <span class="tag">${tag}</span> ${recurringTag}</span>
        </div>
        <div class="transaction-right">
            <span class="transaction-amount">${sign}${data.amount.toFixed(2)} CHF</span>
            <button class="delete-btn" data-id="${data.id}" data-col="${data.col}">✕</button>
        </div>
    `;
    li.querySelector('.delete-btn').addEventListener('click', async () => {
        await deleteDoc(doc(db, `users/${currentUser.uid}/${data.col}`, data.id));
    });
    return li;
}

function renderOverview() {
    const allActive = [...activeFixed, ...activeVar].sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
    const listActive = document.getElementById('overview-list');
    listActive.innerHTML = '';
    allActive.forEach(data => listActive.appendChild(createOverviewItem(data)));

    const allArchive = [...archiveFixed, ...archiveVar].sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
    const listArchive = document.getElementById('archive-list');
    listArchive.innerHTML = '';
    allArchive.forEach(data => listArchive.appendChild(createOverviewItem(data)));
}

function createListItem(data, colName) {
    const li = document.createElement('li');
    const titleStr = data.category ? (data.desc ? `${data.category} - ${data.desc}` : data.category) : data.desc;
    const recurringTag = data.recurring ? `<span class="tag recurring">Monatlich</span>` : '';
    
    li.innerHTML = `
        <span class="transaction-title">${titleStr} ${recurringTag}</span> 
        <div class="transaction-right">
            <span class="transaction-amount">${data.amount >= 0 ? '+' : ''}${data.amount.toFixed(2)} CHF</span>
            <button class="delete-btn" data-id="${data.id}" data-col="${colName}">✕</button>
        </div>
    `;
    li.querySelector('.delete-btn').addEventListener('click', async () => await deleteDoc(doc(db, `users/${currentUser.uid}/${colName}`, data.id)));
    return li;
}

async function addEntry(collectionName, categoryId, descId, amountId, recurringId, isExpense = false) {
    const category = document.getElementById(categoryId).value;
    const desc = document.getElementById(descId).value;
    const isRecurring = document.getElementById(recurringId).checked;
    let amount = parseFloat(document.getElementById(amountId).value);
    
    if (isNaN(amount)) return;
    if (isExpense) amount = -Math.abs(amount);
    
    await addDoc(collection(db, `users/${currentUser.uid}/${collectionName}`), { 
        category: category, desc: desc, amount: amount, recurring: isRecurring, archived: false, timestamp: new Date() 
    });
    
    document.getElementById(descId).value = ''; 
    document.getElementById(amountId).value = '';
    document.getElementById(recurringId).checked = false;
}

document.getElementById('btn-add-fixed').addEventListener('click', () => addEntry('fixed', 'fixed-category', 'fixed-desc', 'fixed-amount', 'fixed-recurring', false));
document.getElementById('btn-add-var').addEventListener('click', () => addEntry('transactions', 'var-category', 'var-desc', 'var-amount', 'var-recurring', true));

function loadDaten() {
    unsubscribeFixed = onSnapshot(query(collection(db, `users/${currentUser.uid}/fixed`), orderBy("timestamp", "desc")), (snapshot) => {
        const list = document.getElementById('fixed-list'); list.innerHTML = ''; 
        totalFixed = 0; activeFixed = []; archiveFixed = [];
        
        snapshot.forEach((docSnap) => { 
            const data = { id: docSnap.id, col: 'fixed', ...docSnap.data() };
            if (data.archived) archiveFixed.push(data);
            else { totalFixed += data.amount; activeFixed.push(data); list.appendChild(createListItem(data, 'fixed')); }
        });
        updateDashboardUI();
    });

    unsubscribeVar = onSnapshot(query(collection(db, `users/${currentUser.uid}/transactions`), orderBy("timestamp", "desc")), (snapshot) => {
        const list = document.getElementById('var-list'); list.innerHTML = ''; 
        totalVar = 0; activeVar = []; archiveVar = [];

        snapshot.forEach((docSnap) => { 
            const data = { id: docSnap.id, col: 'transactions', ...docSnap.data() };
            if (data.archived) archiveVar.push(data);
            else { totalVar += data.amount; activeVar.push(data); list.appendChild(createListItem(data, 'transactions')); }
        });
        updateDashboardUI();
    });
}