// Game state
let activeWordBank = [];
let currentWordIndex = 0;
let wordsCompleted = 0;
let startTime = null;
let isPlaying = false;

// Sentence mode state
let isSentenceMode = false;
let currentSentenceWordIndex = 0;
let ttsMode = 'word'; // 'word' or 'sentence'

// DOM elements
const currentWordEl = document.getElementById('current-word');
const wordInputEl = document.getElementById('word-input');
const wpmEl = document.getElementById('wpm');
const wordCountEl = document.getElementById('word-count');
const startBtn = document.getElementById('start-btn');
const revealBtn = document.getElementById('reveal-btn');
const chordHintEl = document.getElementById('chord-hint');
const hintTextEl = document.getElementById('hint-text');
const categoryCheckboxes = document.querySelectorAll('.category-checkbox');
const ttsModeSection = document.getElementById('tts-mode-section');
const ttsWordBtn = document.getElementById('tts-word-btn');
const ttsSentenceBtn = document.getElementById('tts-sentence-btn');
const clearAllBtn = document.getElementById('clear-all');

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

function getSelectedCategories() {
    const selected = [];
    categoryCheckboxes.forEach(checkbox => {
        if (checkbox.checked) {
            selected.push(checkbox.value);
        }
    });
    return selected;
}

function buildActiveWordBank() {
    const selectedCategories = getSelectedCategories();
    activeWordBank = [];
    isSentenceMode = false;

    selectedCategories.forEach(category => {
        if (wordCategories[category]) {
            const items = wordCategories[category];
            // Check if this is a sentence category
            if (items.length > 0 && items[0].sentence) {
                isSentenceMode = true;
            }
            activeWordBank = activeWordBank.concat(items);
        }
    });

    return activeWordBank.length > 0;
}

function shuffleWords() {
    // Fisher-Yates shuffle
    for (let i = activeWordBank.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [activeWordBank[i], activeWordBank[j]] = [activeWordBank[j], activeWordBank[i]];
    }
}

function startPractice() {
    // Build word bank from selected categories
    if (!buildActiveWordBank()) {
        alert('Please select at least one category!');
        return;
    }

    // Reset game state
    wordsCompleted = 0;
    currentWordIndex = 0;
    currentSentenceWordIndex = 0;
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

    // Show first word/sentence
    showNextWord();
}

function showNextWord() {
    // Hide chord hint
    chordHintEl.classList.add('hidden');
    hintTextEl.textContent = '';

    if (isSentenceMode) {
        // Sentence mode: show the current sentence with underlined current word
        const currentItem = activeWordBank[currentWordIndex];
        const currentWord = currentItem.words[currentSentenceWordIndex];

        // Build the sentence with HTML to underline the current word
        const words = currentItem.words;
        let sentenceHTML = '';
        for (let i = 0; i < words.length; i++) {
            if (i === currentSentenceWordIndex) {
                sentenceHTML += `<span class="current-word-underline">${words[i]}</span>`;
            } else {
                sentenceHTML += words[i];
            }

            // Add space after each word except the last
            if (i < words.length - 1) {
                sentenceHTML += ' ';
            }
        }

        // Display the sentence with underlined current word
        currentWordEl.innerHTML = sentenceHTML;

        // Handle TTS based on mode
        if (currentSentenceWordIndex === 0) {
            // At the start of a new sentence
            if (ttsMode === 'sentence') {
                // Speak the entire sentence
                speakWord(currentItem.sentence);
            } else {
                // Speak just the first word
                speakWord(currentWord);
            }
        } else {
            // For subsequent words in the sentence, always speak word by word
            speakWord(currentWord);
        }
    } else {
        // Single word mode
        const currentWord = activeWordBank[currentWordIndex].word;
        currentWordEl.textContent = currentWord;
        speakWord(currentWord);
    }

    // Clear input
    wordInputEl.value = '';
}

function revealChord() {
    if (isSentenceMode) {
        // Reveal chord for current word in sentence
        const currentItem = activeWordBank[currentWordIndex];
        const currentChord = currentItem.chords[currentSentenceWordIndex];
        const currentWord = currentItem.words[currentSentenceWordIndex];
        hintTextEl.textContent = `${currentWord}: ${currentChord}`;
    } else {
        // Reveal chord for single word
        const currentChord = activeWordBank[currentWordIndex].chord;
        hintTextEl.textContent = currentChord;
    }

    chordHintEl.classList.remove('hidden');

    // Refocus the input after revealing chord
    wordInputEl.focus();
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

    if (isSentenceMode) {
        // Sentence mode: check current word in sentence
        const currentItem = activeWordBank[currentWordIndex];
        const currentWord = currentItem.words[currentSentenceWordIndex].toLowerCase();

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

            // Move to next word in sentence
            currentSentenceWordIndex++;

            // Check if sentence is complete
            if (currentSentenceWordIndex >= currentItem.words.length) {
                // Sentence complete, move to next sentence
                currentSentenceWordIndex = 0;
                currentWordIndex++;

                // Loop back to start if we've gone through all sentences
                if (currentWordIndex >= activeWordBank.length) {
                    currentWordIndex = 0;
                    shuffleWords();
                }
            }

            // Show next word after brief delay
            setTimeout(() => {
                showNextWord();
            }, 300);
        }
    } else {
        // Single word mode
        const currentWord = activeWordBank[currentWordIndex].word.toLowerCase();

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
            if (currentWordIndex >= activeWordBank.length) {
                currentWordIndex = 0;
                shuffleWords();
            }

            // Show next word after brief delay
            setTimeout(() => {
                showNextWord();
            }, 300);
        }
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

// TTS Mode Toggle
ttsWordBtn.addEventListener('click', () => {
    ttsMode = 'word';
    ttsWordBtn.classList.add('active');
    ttsSentenceBtn.classList.remove('active');
});

ttsSentenceBtn.addEventListener('click', () => {
    ttsMode = 'sentence';
    ttsSentenceBtn.classList.add('active');
    ttsWordBtn.classList.remove('active');
});

// Clear All Button
clearAllBtn.addEventListener('click', () => {
    categoryCheckboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
});

// Show/hide TTS mode section based on selected categories
categoryCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
        const selected = getSelectedCategories();
        const hasSentenceCategory = selected.some(cat => cat.startsWith('sentences-'));

        if (hasSentenceCategory) {
            ttsModeSection.style.display = 'block';
        } else {
            ttsModeSection.style.display = 'none';
        }
    });
});

// Initialize
chordHintEl.classList.add('hidden');
