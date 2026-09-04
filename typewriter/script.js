
const wordsEasy = ["das", "ist", "ein", "test", "apfel", "baum", "haus", "auto", "katze", "hund", "maus", "buch", "welt", "zeit", "weg", "spiel", "code", "taste"];
const wordsHard = ["Programmierung", "JavaScript", "Asynchron!", "Objektorientiert", "Bestenliste-123", "Schwierigkeitsgrad?", "Algorithmus", "Performance", "Frontend"];

let currentWords = [];
let currentWordIndex = 0;
let timer = 60;
let interval = null;
let isPlaying = false;
let correctKeystrokes = 0;
let isAdmin = false;

const screenMenu = document.getElementById('screen-menu');
const screenGame = document.getElementById('screen-game');
const screenLeaderboard = document.getElementById('screen-leaderboard');
const wordTrack = document.getElementById('word-track');
const hiddenInput = document.getElementById('hidden-input');
const timerElement = document.getElementById('timer');
const wpmElement = document.getElementById('wpm');

function showScreen(screen) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    screen.classList.add('active');
}

document.getElementById('btn-start').addEventListener('click', () => {
    const playerName = document.getElementById('player-name').value.trim();
    if (!playerName) return alert("Bro, gib bitte einen Namen ein!");
    
    const difficulty = document.getElementById('difficulty').value;
    const wordPool = difficulty === 'easy' ? wordsEasy : wordsHard;
    
    currentWords = Array.from({length: 100}, () => wordPool[Math.floor(Math.random() * wordPool.length)]);
    
    showScreen(screenGame);
    setupGame(); 
});

function setupGame() {
    wordTrack.innerHTML = '';
    wordTrack.style.transform = `translateX(0px)`;
    currentWordIndex = 0;
    correctKeystrokes = 0;
    timer = 60;
    timerElement.innerText = timer;
    wpmElement.innerText = "0";
    isPlaying = false;
    hiddenInput.value = '';
    hiddenInput.disabled = false;

    currentWords.forEach((word, index) => {
        const wordSpan = document.createElement('span');
        wordSpan.classList.add('word');
        if (index === 0) wordSpan.classList.add('active');
        
        word.split('').forEach(char => {
            const charSpan = document.createElement('span');
            charSpan.innerText = char;
            charSpan.classList.add('letter');
            wordSpan.appendChild(charSpan);
        });
        wordTrack.appendChild(wordSpan);
    });

    setTimeout(() => {
        centerActiveWord(); 
        hiddenInput.focus();
    }, 50); 

}

function centerActiveWord() {
    const activeWord = document.querySelectorAll('.word')[currentWordIndex];
    const focusBox = document.querySelector('.focus-box');
    
    if (!activeWord || !focusBox) return;

    const boxWidth = focusBox.clientWidth; 
    const wordLeft = activeWord.offsetLeft; 
    const wordWidth = activeWord.offsetWidth; 

    const offset = (boxWidth / 2) - (wordLeft + (wordWidth / 2));
    wordTrack.style.transform = `translateX(${offset}px)`;
}

hiddenInput.addEventListener('input', (e) => {
    if (!isPlaying) {
        startTimer();
        isPlaying = true;
    }

    const typedText = hiddenInput.value;
    const wordSpans = document.querySelectorAll('.word');
    const activeWordSpan = wordSpans[currentWordIndex];
    if (!activeWordSpan) return;
    
    const letterSpans = activeWordSpan.querySelectorAll('.letter');

    if (typedText.endsWith(' ')) {
        activeWordSpan.classList.remove('active');
        currentWordIndex++;
        
        const nextWordSpan = wordSpans[currentWordIndex];
        if (nextWordSpan) {
            nextWordSpan.classList.add('active');
            centerActiveWord(); 
        }
        
        hiddenInput.value = ''; 
        return;
    }

    let correctInThisWord = 0;
    letterSpans.forEach((charSpan, index) => {
        const typedChar = typedText[index];
        if (typedChar == null) {
            charSpan.classList.remove('correct', 'incorrect');
        } else if (typedChar === charSpan.innerText) {
            charSpan.classList.add('correct');
            charSpan.classList.remove('incorrect');
            correctInThisWord++;
        } else {
            charSpan.classList.add('incorrect');
            charSpan.classList.remove('correct');
        }
    });

    const timeElapsed = 60 - timer;
    if (timeElapsed > 0) {
        wpmElement.innerText = Math.round(((correctKeystrokes + correctInThisWord) / 5) / (timeElapsed / 60));
    }
});

hiddenInput.addEventListener('keydown', (e) => {
    if (e.key !== 'Backspace' && e.key !== ' ' && isPlaying) {
        correctKeystrokes++;
    }
});

function startTimer() {
    interval = setInterval(() => {
        timer--;
        timerElement.innerText = timer;
        if (timer <= 0) endGame();
    }, 1000);
}

function endGame() {
    clearInterval(interval);
    hiddenInput.blur();
    hiddenInput.disabled = true;
    const finalWPM = wpmElement.innerText;
    const playerName = document.getElementById('player-name').value;
    
    saveScore(playerName, finalWPM);
    alert(`Zeit abgelaufen! Dein Score: ${finalWPM} WPM`);
    updateLeaderboardUI();
    showScreen(screenLeaderboard);
}

function saveScore(name, wpm) {
    const scores = JSON.parse(localStorage.getItem('typewriterScores') || '[]');
    scores.push({ id: Date.now(), name, wpm: parseInt(wpm) });
    scores.sort((a, b) => b.wpm - a.wpm);
    localStorage.setItem('typewriterScores', JSON.stringify(scores));
}

function updateLeaderboardUI() {
    const scores = JSON.parse(localStorage.getItem('typewriterScores') || '[]');
    const list = document.getElementById('leaderboard-list');
    list.innerHTML = '';

    scores.forEach((score, index) => {
        const li = document.createElement('li');
        li.innerHTML = `<span><strong>#${index + 1} ${score.name}</strong> - ${score.wpm} WPM</span>`;
        
        if (isAdmin) {
            const delBtn = document.createElement('button');
            delBtn.innerText = 'X';
            delBtn.classList.add('delete-btn');
            delBtn.onclick = () => deleteScore(score.id);
            li.appendChild(delBtn);
        }
        list.appendChild(li);
    });
}

function deleteScore(id) {
    let scores = JSON.parse(localStorage.getItem('typewriterScores') || '[]');
    scores = scores.filter(s => s.id !== id);
    localStorage.setItem('typewriterScores', JSON.stringify(scores));
    updateLeaderboardUI();
}

document.getElementById('btn-show-leaderboard').addEventListener('click', () => {
    updateLeaderboardUI();
    showScreen(screenLeaderboard);
});

document.getElementById('btn-back-menu').addEventListener('click', () => {
    showScreen(screenMenu);
});

document.getElementById('btn-admin').addEventListener('click', () => {
    if (isAdmin) {
        isAdmin = false;
        alert("Admin abgemeldet.");
    } else {
        const password = prompt("Admin Passwort eingeben:");
        if (password === "boss") {
            isAdmin = true;
            alert("Admin-Modus aktiv! Du kannst jetzt Einträge löschen.");
        } else {
            alert("Falsches Passwort!");
        }
    }
    updateLeaderboardUI();
});