// Word bank with steno chord mappings
const wordBank = [
    { word: 'the', chord: 'T-' },
    { word: 'is', chord: 'S' },
    { word: 'at', chord: 'AT' },
    { word: 'it', chord: 'T' },
    { word: 'in', chord: 'TPH' },
    { word: 'on', chord: 'OPB' },
    { word: 'to', chord: 'TO' },
    { word: 'of', chord: 'OF' },
    { word: 'and', chord: 'SKP' },
    { word: 'for', chord: 'TPOR' },
    { word: 'are', chord: 'R' },
    { word: 'as', chord: 'AZ' },
    { word: 'be', chord: '-B' },
    { word: 'he', chord: 'HE' },
    { word: 'or', chord: 'OR' }
];

// Game state
let currentWordIndex = 0;
let wordsCompleted = 0;
let startTime = null;
let isPlaying = false;

// DOM elements
const currentWordEl = document.getElementById('current-word');
const wordInputEl = document.getElementById('word-input');
const wpmEl = document.getElementById('wpm');
const wordCountEl = document.getElementById('word-count');
const startBtn = document.getElementById('start-btn');
const revealBtn = document.getElementById('reveal-btn');
const chordHintEl = document.getElementById('chord-hint');
const hintTextEl = document.getElementById('hint-text');

// Text-to-Speech setup
const synth = window.speechSynthesis;

function speakWord(word) {
    // Cancel any ongoing speech
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(word);
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 1;
    utterance.volume = 1;

    synth.speak(utterance);
}

function shuffleWords() {
    // Fisher-Yates shuffle
    for (let i = wordBank.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [wordBank[i], wordBank[j]] = [wordBank[j], wordBank[i]];
    }
}

function startPractice() {
    // Reset game state
    wordsCompleted = 0;
    currentWordIndex = 0;
    startTime = Date.now();
    isPlaying = true;

    // Shuffle words for variety
    shuffleWords();

    // Update UI
    wordCountEl.textContent = '0';
    wpmEl.textContent = '0';
    wordInputEl.value = '';
    wordInputEl.disabled = false;
    wordInputEl.focus();
    startBtn.textContent = 'Restart';
    revealBtn.disabled = false;

    // Show first word
    showNextWord();
}

function showNextWord() {
    // Hide chord hint
    chordHintEl.classList.add('hidden');
    hintTextEl.textContent = '';

    // Get current word
    const currentWord = wordBank[currentWordIndex].word;
    currentWordEl.textContent = currentWord;

    // Speak the word
    speakWord(currentWord);

    // Clear input
    wordInputEl.value = '';
}

function revealChord() {
    const currentChord = wordBank[currentWordIndex].chord;
    hintTextEl.textContent = currentChord;
    chordHintEl.classList.remove('hidden');
}

function calculateWPM() {
    if (!startTime || wordsCompleted === 0) return 0;

    const elapsedMinutes = (Date.now() - startTime) / 60000;
    const wpm = Math.round(wordsCompleted / elapsedMinutes);

    return wpm;
}

function checkWord() {
    if (!isPlaying) return;

    const typedWord = wordInputEl.value.trim().toLowerCase();
    const currentWord = wordBank[currentWordIndex].word.toLowerCase();

    if (typedWord === currentWord) {
        // Correct word typed
        wordsCompleted++;
        wordCountEl.textContent = wordsCompleted;

        // Update WPM
        const wpm = calculateWPM();
        wpmEl.textContent = wpm;

        // Animation feedback
        currentWordEl.classList.add('correct-animation');
        setTimeout(() => {
            currentWordEl.classList.remove('correct-animation');
        }, 300);

        // Move to next word
        currentWordIndex++;

        // Loop back to start if we've gone through all words
        if (currentWordIndex >= wordBank.length) {
            currentWordIndex = 0;
            shuffleWords();
        }

        // Show next word after brief delay
        setTimeout(() => {
            showNextWord();
        }, 300);
    }
}

// Event listeners
startBtn.addEventListener('click', startPractice);
revealBtn.addEventListener('click', revealChord);

wordInputEl.addEventListener('input', checkWord);

// Prevent form submission on enter
wordInputEl.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
    }
});

// Initialize
chordHintEl.classList.add('hidden');
