// Game state
let activeWordBank = [];
let currentWordIndex = 0;
let wordsCompleted = 0;
let startTime = null;
let isPlaying = false;
let revealAlwaysMode = false;

// Sentence mode state
let isSentenceMode = false;
let currentSentenceWordIndex = 0;
let ttsMode = 'word'; // 'word' or 'sentence'

// Anki mode state
let ankiMode = false;
let wordScores = {}; // {wordKey: {score: 0, lastSeen: timestamp, responseTime: []}}
let currentWordStartTime = null;

// Custom list state
let ploverDictionary = null;
let customWordList = [];
let customPhraseData = null; // Will store {sentence, words, chords}

// Settings state
let settings = {
    bgColor1: '#0f172a',
    bgColor2: '#1e293b',
    noiseyMode: false,
    textureEnabled: false
};

// DOM elements
const currentWordEl = document.getElementById('current-word');
const wordInputEl = document.getElementById('word-input');
const wpmEl = document.getElementById('wpm');
const wordCountEl = document.getElementById('word-count');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const revealBtn = document.getElementById('reveal-btn');
const revealAlwaysBtn = document.getElementById('reveal-always-btn');
const revealAlwaysText = document.getElementById('reveal-always-text');
const chordHintEl = document.getElementById('chord-hint');
const hintTextEl = document.getElementById('hint-text');
const categoryCheckboxes = document.querySelectorAll('.category-checkbox');
const ttsModeSection = document.getElementById('tts-mode-section');
const ttsWordBtn = document.getElementById('tts-word-btn');
const ttsSentenceBtn = document.getElementById('tts-sentence-btn');
const clearAllBtn = document.getElementById('clear-all');
const difficultyIndicator = document.getElementById('difficulty-indicator');

// Custom list DOM elements
const customListBtn = document.getElementById('custom-list-btn');
const customListModal = document.getElementById('custom-list-modal');
const modalClose = document.querySelector('.modal-close');
const cancelCustomBtn = document.getElementById('cancel-custom-btn');
const saveCustomBtn = document.getElementById('save-custom-btn');
const customWordsInput = document.getElementById('custom-words-input');
const wordCountDisplay = document.getElementById('word-count-display');
const customCategory = document.getElementById('custom-category');
const customListItem = document.getElementById('custom-list-item');
const customListLabel = document.getElementById('custom-list-label');

// Custom phrase DOM elements
const customPhraseBtn = document.getElementById('custom-phrase-btn');
const customPhraseModal = document.getElementById('custom-phrase-modal');
const modalClosePhrase = document.querySelector('.modal-close-phrase');
const cancelPhraseBtn = document.getElementById('cancel-phrase-btn');
const savePhraseBtn = document.getElementById('save-phrase-btn');
const customPhraseInput = document.getElementById('custom-phrase-input');
const phraseWordCountDisplay = document.getElementById('phrase-word-count-display');
const customPhraseItem = document.getElementById('custom-phrase-item');
const customPhraseLabel = document.getElementById('custom-phrase-label');

// Settings DOM elements
const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const modalCloseSettings = document.querySelector('.modal-close-settings');
const closeSettingsBtn = document.getElementById('close-settings-btn');
const bgColor1Input = document.getElementById('bg-color-1');
const bgColor2Input = document.getElementById('bg-color-2');
const resetGradientBtn = document.getElementById('reset-gradient-btn');
const noiseyModeToggle = document.getElementById('noisey-mode-toggle');
const textureToggle = document.getElementById('texture-toggle');

// Anki mode DOM element
const ankiModeCheckbox = document.getElementById('anki-mode-checkbox');

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

    // Separate word banks for sentences and single words
    let sentenceBank = [];
    let wordBank = [];

    selectedCategories.forEach(category => {
        if (wordCategories[category]) {
            const items = wordCategories[category];
            // Check if this is a sentence category
            if (items.length > 0 && items[0].sentence) {
                sentenceBank = sentenceBank.concat(items);
            } else {
                wordBank = wordBank.concat(items);
            }
        }
    });

    // Combine both banks (sentences first, then words)
    activeWordBank = sentenceBank.concat(wordBank);

    // Set sentence mode based on what we have
    // If we have sentences, we'll handle mixed mode in showNextWord
    isSentenceMode = sentenceBank.length > 0;

    return activeWordBank.length > 0;
}

function shuffleWords() {
    // Fisher-Yates shuffle
    for (let i = activeWordBank.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [activeWordBank[i], activeWordBank[j]] = [activeWordBank[j], activeWordBank[i]];
    }
}

// ====== ANKI MODE FUNCTIONS ======

// Generate unique key for a word (for tracking scores)
function getWordKey(item, sentenceWordIndex = 0) {
    if (item.sentence) {
        return `sentence_${item.sentence}_word_${sentenceWordIndex}`;
    } else {
        return `word_${item.word}`;
    }
}

// Initialize score for a word if it doesn't exist
function initWordScore(wordKey) {
    if (!wordScores[wordKey]) {
        wordScores[wordKey] = {
            score: 0, // Higher score = needs more practice
            lastSeen: Date.now(),
            responseTimes: []
        };
    }
}

// Update word score based on response time
function updateWordScore(wordKey, responseTime) {
    initWordScore(wordKey);

    const score = wordScores[wordKey];
    score.lastSeen = Date.now();
    score.responseTimes.push(responseTime);

    // Keep only last 10 response times
    if (score.responseTimes.length > 10) {
        score.responseTimes.shift();
    }

    // Calculate average response time
    const avgTime = score.responseTimes.reduce((a, b) => a + b, 0) / score.responseTimes.length;

    // Update score based on response time
    // Fast response (< 2s): decrease score (less practice needed)
    // Slow response (> 5s): increase score (more practice needed)
    if (responseTime < 2000) {
        score.score = Math.max(0, score.score - 2);
    } else if (responseTime < 4000) {
        score.score = Math.max(0, score.score - 1);
    } else if (responseTime < 6000) {
        score.score += 1;
    } else {
        score.score += 3;
    }

    // Save to localStorage
    saveWordScores();
}

// Sort word bank by Anki algorithm
function sortByAnkiScores() {
    activeWordBank.sort((a, b) => {
        // Get all possible word keys for comparison
        let aKeys = [];
        let bKeys = [];

        if (a.sentence) {
            for (let i = 0; i < a.words.length; i++) {
                aKeys.push(getWordKey(a, i));
            }
        } else {
            aKeys.push(getWordKey(a));
        }

        if (b.sentence) {
            for (let i = 0; i < b.words.length; i++) {
                bKeys.push(getWordKey(b, i));
            }
        } else {
            bKeys.push(getWordKey(b));
        }

        // Get average scores
        const aScore = aKeys.reduce((sum, key) => {
            initWordScore(key);
            return sum + wordScores[key].score;
        }, 0) / aKeys.length;

        const bScore = bKeys.reduce((sum, key) => {
            initWordScore(key);
            return sum + wordScores[key].score;
        }, 0) / bKeys.length;

        // Higher score first (needs more practice)
        return bScore - aScore;
    });
}

// Save word scores to localStorage
function saveWordScores() {
    localStorage.setItem('stenoKingAnkiScores', JSON.stringify(wordScores));
}

// Load word scores from localStorage
function loadWordScores() {
    const saved = localStorage.getItem('stenoKingAnkiScores');
    if (saved) {
        try {
            wordScores = JSON.parse(saved);
        } catch (e) {
            console.error('Error loading Anki scores:', e);
        }
    }
}

// Get difficulty color based on score
function getDifficultyColor(score) {
    // Score ranges: 0 (easy/green) to 15+ (hard/red)
    if (score <= 0) return '#10b981'; // Green - Easy
    if (score <= 3) return '#84cc16'; // Lime - Pretty Easy
    if (score <= 6) return '#facc15'; // Yellow - Medium
    if (score <= 10) return '#fb923c'; // Orange - Getting Hard
    return '#ef4444'; // Red - Hard
}

// Update difficulty indicator
function updateDifficultyIndicator(wordKey) {
    if (!ankiMode) {
        difficultyIndicator.style.display = 'none';
        return;
    }

    initWordScore(wordKey);
    const score = wordScores[wordKey].score;
    const color = getDifficultyColor(score);

    difficultyIndicator.style.display = 'block';
    difficultyIndicator.style.backgroundColor = color;
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

    // Sort or shuffle based on Anki mode
    if (ankiMode) {
        sortByAnkiScores();
    } else {
        shuffleWords();
    }

    // Update UI
    wordCountEl.textContent = '0';
    wpmEl.textContent = '0';
    wordInputEl.value = '';
    wordInputEl.disabled = false;
    wordInputEl.focus();
    startBtn.innerHTML = '<span class="btn-icon">🔄</span><span>Restart</span>';
    pauseBtn.disabled = false;
    pauseBtn.innerHTML = '<span class="btn-icon">⏸</span><span>Pause</span>';
    revealBtn.disabled = false;
    revealAlwaysBtn.disabled = false;

    // Show first word/sentence
    showNextWord();
}

function showNextWord() {
    // Hide chord hint (unless reveal always mode is on)
    if (!revealAlwaysMode) {
        chordHintEl.classList.add('hidden');
        hintTextEl.textContent = '';
    }

    // Start timing for Anki mode
    if (ankiMode) {
        currentWordStartTime = Date.now();
    }

    const currentItem = activeWordBank[currentWordIndex];

    // Update difficulty indicator for Anki mode
    if (currentItem.sentence) {
        const wordKey = getWordKey(currentItem, currentSentenceWordIndex);
        updateDifficultyIndicator(wordKey);
    } else {
        const wordKey = getWordKey(currentItem);
        updateDifficultyIndicator(wordKey);
    }

    // Check if current item is a sentence or single word
    if (currentItem.sentence) {
        // This is a sentence item
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
        const currentWord = currentItem.word;
        currentWordEl.textContent = currentWord;
        speakWord(currentWord);
    }

    // Clear input
    wordInputEl.value = '';

    // Auto-reveal chord if reveal always mode is on
    if (revealAlwaysMode) {
        revealChord();
    }
}

function revealChord() {
    const currentItem = activeWordBank[currentWordIndex];

    // Check if current item is a sentence or single word
    if (currentItem.sentence) {
        // Reveal chord for current word in sentence
        const currentChord = currentItem.chords[currentSentenceWordIndex];
        const currentWord = currentItem.words[currentSentenceWordIndex];
        hintTextEl.textContent = `${currentWord}: ${currentChord}`;
    } else {
        // Reveal chord for single word
        const currentChord = currentItem.chord;
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
    const currentItem = activeWordBank[currentWordIndex];

    // Determine current word based on item type
    let currentWord;
    if (currentItem.sentence) {
        // This is a sentence item
        currentWord = currentItem.words[currentSentenceWordIndex].toLowerCase();
    } else {
        // This is a single word item
        currentWord = currentItem.word.toLowerCase();
    }

    if (typedWord === currentWord) {
        // Correct word typed
        wordsCompleted++;
        wordCountEl.textContent = wordsCompleted;

        // Update WPM
        const wpm = calculateWPM();
        wpmEl.textContent = wpm;

        // Update Anki score if in Anki mode
        if (ankiMode && currentWordStartTime) {
            const responseTime = Date.now() - currentWordStartTime;
            const wordKey = getWordKey(currentItem, currentItem.sentence ? currentSentenceWordIndex : 0);
            updateWordScore(wordKey, responseTime);
        }

        // Animation feedback
        currentWordEl.classList.add('correct-animation');
        setTimeout(() => {
            currentWordEl.classList.remove('correct-animation');
        }, 300);

        // Play success sound
        playSuccessSound();

        // Determine what to do next
        if (currentItem.sentence) {
            // Move to next word in sentence
            currentSentenceWordIndex++;

            // Check if sentence is complete
            if (currentSentenceWordIndex >= currentItem.words.length) {
                // Sentence complete, move to next item
                currentSentenceWordIndex = 0;
                currentWordIndex++;

                // Loop back to start if we've gone through all items
                if (currentWordIndex >= activeWordBank.length) {
                    currentWordIndex = 0;
                    if (ankiMode) {
                        sortByAnkiScores();
                    } else {
                        shuffleWords();
                    }
                }
            }
        } else {
            // Move to next single word
            currentWordIndex++;

            // Loop back to start if we've gone through all items
            if (currentWordIndex >= activeWordBank.length) {
                currentWordIndex = 0;
                if (ankiMode) {
                    sortByAnkiScores();
                } else {
                    shuffleWords();
                }
            }
        }

        // Show next word after brief delay
        setTimeout(() => {
            showNextWord();
        }, 300);
    }
}

// Pause/Resume functionality
function togglePause() {
    if (isPlaying) {
        // Pause
        isPlaying = false;
        wordInputEl.disabled = true;
        pauseBtn.innerHTML = '<span class="btn-icon">▶</span><span>Resume</span>';
        currentWordEl.style.opacity = '0.5';

        // Stop timing for Anki mode
        if (ankiMode && currentWordStartTime) {
            currentWordStartTime = null;
        }
    } else {
        // Resume
        isPlaying = true;
        wordInputEl.disabled = false;
        wordInputEl.focus();
        pauseBtn.innerHTML = '<span class="btn-icon">⏸</span><span>Pause</span>';
        currentWordEl.style.opacity = '1';

        // Restart timing for Anki mode
        if (ankiMode) {
            currentWordStartTime = Date.now();
        }
    }
}

// Toggle Reveal Always mode
function toggleRevealAlways() {
    revealAlwaysMode = !revealAlwaysMode;

    // Update button appearance
    if (revealAlwaysMode) {
        revealAlwaysBtn.classList.remove('btn-toggle');
        revealAlwaysBtn.classList.add('btn-toggle-active');
        revealAlwaysText.textContent = 'Hide Always';

        // Show current chord if playing
        if (isPlaying) {
            revealChord();
        }
    } else {
        revealAlwaysBtn.classList.remove('btn-toggle-active');
        revealAlwaysBtn.classList.add('btn-toggle');
        revealAlwaysText.textContent = 'Reveal Always';

        // Hide chord hint
        chordHintEl.classList.add('hidden');
        hintTextEl.textContent = '';
    }

    // Save to localStorage
    localStorage.setItem('stenoKingRevealAlways', revealAlwaysMode);
}

// Event listeners
startBtn.addEventListener('click', startPractice);
pauseBtn.addEventListener('click', togglePause);
revealBtn.addEventListener('click', revealChord);
revealAlwaysBtn.addEventListener('click', toggleRevealAlways);

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
    // Update category highlights after clearing
    updateCategoryHighlights();
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

// ====== CUSTOM LIST FUNCTIONALITY ======

// Load Plover dictionary on page load
async function loadPloverDictionary() {
    try {
        console.log('Loading Plover dictionary...');
        const response = await fetch('https://raw.githubusercontent.com/didoesdigital/steno-dictionaries/master/dictionaries/dict.json');
        if (!response.ok) throw new Error('Failed to load Plover dictionary');

        ploverDictionary = await response.json();
        console.log('Plover dictionary loaded successfully!', Object.keys(ploverDictionary).length, 'entries');
    } catch (error) {
        console.error('Error loading Plover dictionary:', error);
        alert('Warning: Could not load Plover dictionary. Custom word lookup may not work.');
    }
}

// Find steno chord for a word (reverse lookup in dictionary)
function findChordForWord(word) {
    if (!ploverDictionary) {
        console.log('Dictionary not loaded yet');
        return null;
    }

    const normalizedWord = word.toLowerCase().trim();

    // Search through dictionary for matching translations
    for (const [chord, translation] of Object.entries(ploverDictionary)) {
        // Remove special characters from translation (like {^}, {-|}, etc.)
        const cleanTranslation = translation.replace(/\{[^}]*\}/g, '').toLowerCase().trim();

        if (cleanTranslation === normalizedWord) {
            return chord;
        }
    }

    console.log(`No chord found for word: "${word}"`);
    return null;
}

// Update word count display in modal
customWordsInput.addEventListener('input', () => {
    const text = customWordsInput.value.trim();
    const lines = text ? text.split('\n').filter(line => line.trim().length > 0) : [];
    const count = Math.min(lines.length, 200);

    wordCountDisplay.textContent = count;

    // Change color if approaching or over limit
    if (count >= 200) {
        wordCountDisplay.style.color = 'var(--accent)';
    } else if (count >= 180) {
        wordCountDisplay.style.color = 'var(--secondary)';
    } else {
        wordCountDisplay.style.color = 'var(--primary-light)';
    }
});

// Open custom list modal
customListBtn.addEventListener('click', () => {
    customListModal.classList.add('show');

    // Load existing custom list if any
    const savedList = localStorage.getItem('customWordList');
    if (savedList) {
        try {
            const parsed = JSON.parse(savedList);
            const words = parsed.map(item => item.word).join('\n');
            customWordsInput.value = words;
            customWordsInput.dispatchEvent(new Event('input')); // Trigger count update
        } catch (e) {
            console.error('Error loading saved list:', e);
        }
    }
});

// Close modal handlers
function closeModal() {
    customListModal.classList.remove('show');
    customWordsInput.value = '';
    wordCountDisplay.textContent = '0';
    wordCountDisplay.style.color = 'var(--primary-light)';
}

modalClose.addEventListener('click', closeModal);
cancelCustomBtn.addEventListener('click', closeModal);

// Click outside modal to close
customListModal.addEventListener('click', (e) => {
    if (e.target === customListModal) {
        closeModal();
    }
});

// Save custom list
saveCustomBtn.addEventListener('click', async () => {
    const text = customWordsInput.value.trim();
    if (!text) {
        alert('Please enter at least one word!');
        return;
    }

    // Parse words (one per line, max 200)
    const words = text.split('\n')
        .map(line => line.trim().toLowerCase())
        .filter(word => word.length > 0)
        .slice(0, 200); // Limit to 200

    if (words.length === 0) {
        alert('Please enter at least one valid word!');
        return;
    }

    // Show loading state
    saveCustomBtn.disabled = true;
    saveCustomBtn.textContent = 'Processing...';

    // Wait a moment for dictionary to load if not loaded yet
    if (!ploverDictionary) {
        await loadPloverDictionary();
    }

    // Process words and find chords
    customWordList = [];
    const notFoundWords = [];

    for (const word of words) {
        const chord = findChordForWord(word);

        if (chord) {
            customWordList.push({ word, chord });
        } else {
            notFoundWords.push(word);
        }
    }

    // Log words not found
    if (notFoundWords.length > 0) {
        console.log('Words not found in Plover dictionary:', notFoundWords);
    }

    // Save to localStorage
    localStorage.setItem('customWordList', JSON.stringify(customWordList));

    // Add to word categories
    if (customWordList.length > 0) {
        wordCategories['custom-list'] = customWordList;

        // Show custom list item in sidebar
        customCategory.style.display = 'block';
        customListItem.style.display = 'flex';
        customListLabel.textContent = `My Custom List (${customWordList.length})`;
    }

    // Reset button
    saveCustomBtn.disabled = false;
    saveCustomBtn.textContent = 'Save List';

    // Close modal
    closeModal();

    // Show success message
    const foundCount = customWordList.length;
    const notFoundCount = notFoundWords.length;
    let message = `Custom list saved! ${foundCount} word${foundCount !== 1 ? 's' : ''} added.`;

    if (notFoundCount > 0) {
        message += `\n\n${notFoundCount} word${notFoundCount !== 1 ? 's were' : ' was'} not found in the Plover dictionary and ${notFoundCount !== 1 ? 'were' : 'was'} skipped. Check console for details.`;
    }

    alert(message);
});

// Load custom list from localStorage on page load
function loadCustomListFromStorage() {
    const savedList = localStorage.getItem('customWordList');
    if (savedList) {
        try {
            customWordList = JSON.parse(savedList);
            if (customWordList.length > 0) {
                wordCategories['custom-list'] = customWordList;
                customCategory.style.display = 'block';
                customListItem.style.display = 'flex';
                customListLabel.textContent = `My Custom List (${customWordList.length})`;
                console.log('Loaded custom list from storage:', customWordList.length, 'words');
            }
        } catch (e) {
            console.error('Error loading custom list from storage:', e);
        }
    }
}

// ====== CUSTOM PHRASE FUNCTIONALITY ======

// Update phrase word count display in modal
customPhraseInput.addEventListener('input', () => {
    const text = customPhraseInput.value.trim();
    // Split by whitespace and filter empty strings
    const words = text ? text.split(/\s+/).filter(word => word.length > 0) : [];
    const count = Math.min(words.length, 200);

    phraseWordCountDisplay.textContent = count;

    // Change color if approaching or over limit
    if (count >= 200) {
        phraseWordCountDisplay.style.color = 'var(--accent)';
    } else if (count >= 180) {
        phraseWordCountDisplay.style.color = 'var(--secondary)';
    } else {
        phraseWordCountDisplay.style.color = 'var(--primary-light)';
    }
});

// Open custom phrase modal
customPhraseBtn.addEventListener('click', () => {
    customPhraseModal.classList.add('show');

    // Load existing custom phrase if any
    const savedPhrase = localStorage.getItem('customPhrase');
    if (savedPhrase) {
        try {
            const parsed = JSON.parse(savedPhrase);
            customPhraseInput.value = parsed.sentence;
            customPhraseInput.dispatchEvent(new Event('input')); // Trigger count update
        } catch (e) {
            console.error('Error loading saved phrase:', e);
        }
    }
});

// Close phrase modal handlers
function closePhraseModal() {
    customPhraseModal.classList.remove('show');
    customPhraseInput.value = '';
    phraseWordCountDisplay.textContent = '0';
    phraseWordCountDisplay.style.color = 'var(--primary-light)';
}

modalClosePhrase.addEventListener('click', closePhraseModal);
cancelPhraseBtn.addEventListener('click', closePhraseModal);

// Click outside modal to close
customPhraseModal.addEventListener('click', (e) => {
    if (e.target === customPhraseModal) {
        closePhraseModal();
    }
});

// Save custom phrase
savePhraseBtn.addEventListener('click', async () => {
    const text = customPhraseInput.value.trim();
    if (!text) {
        alert('Please enter a phrase or paragraph!');
        return;
    }

    // Parse words (split by whitespace, max 200)
    const words = text.split(/\s+/)
        .filter(word => word.length > 0)
        .map(word => {
            // Remove punctuation from word for chord lookup but keep original
            const cleanWord = word.replace(/[^\w]/g, '').toLowerCase();
            return { original: word, clean: cleanWord };
        })
        .slice(0, 200); // Limit to 200

    if (words.length === 0) {
        alert('Please enter at least one valid word!');
        return;
    }

    // Show loading state
    savePhraseBtn.disabled = true;
    savePhraseBtn.textContent = 'Processing...';

    // Wait a moment for dictionary to load if not loaded yet
    if (!ploverDictionary) {
        await loadPloverDictionary();
    }

    // Process words and find chords
    const foundWords = [];
    const foundChords = [];
    const notFoundWords = [];

    for (const wordObj of words) {
        const chord = findChordForWord(wordObj.clean);

        if (chord) {
            foundWords.push(wordObj.original);
            foundChords.push(chord);
        } else {
            notFoundWords.push(wordObj.original);
        }
    }

    // Only create phrase if we found at least some words
    if (foundWords.length === 0) {
        alert('None of the words in your phrase were found in the Plover dictionary. Please try a different phrase.');
        savePhraseBtn.disabled = false;
        savePhraseBtn.textContent = 'Save Phrase';
        return;
    }

    // Create phrase data structure (like sentences)
    customPhraseData = {
        sentence: foundWords.join(' '),
        words: foundWords,
        chords: foundChords
    };

    // Log words not found
    if (notFoundWords.length > 0) {
        console.log('Words not found in Plover dictionary:', notFoundWords);
    }

    // Save to localStorage
    localStorage.setItem('customPhrase', JSON.stringify(customPhraseData));

    // Add to word categories
    wordCategories['custom-phrase'] = [customPhraseData];

    // Show custom phrase item in sidebar
    customCategory.style.display = 'block';
    customPhraseItem.style.display = 'flex';
    customPhraseLabel.textContent = `My Custom Phrase (${foundWords.length} words)`;

    // Reset button
    savePhraseBtn.disabled = false;
    savePhraseBtn.textContent = 'Save Phrase';

    // Close modal
    closePhraseModal();

    // Show success message
    const foundCount = foundWords.length;
    const notFoundCount = notFoundWords.length;
    let message = `Custom phrase saved! ${foundCount} word${foundCount !== 1 ? 's' : ''} added.`;

    if (notFoundCount > 0) {
        message += `\n\n${notFoundCount} word${notFoundCount !== 1 ? 's were' : ' was'} not found in the Plover dictionary and ${notFoundCount !== 1 ? 'were' : 'was'} skipped. Check console for details.`;
    }

    alert(message);
});

// Load custom phrase from localStorage on page load
function loadCustomPhraseFromStorage() {
    const savedPhrase = localStorage.getItem('customPhrase');
    if (savedPhrase) {
        try {
            customPhraseData = JSON.parse(savedPhrase);
            if (customPhraseData && customPhraseData.words && customPhraseData.words.length > 0) {
                wordCategories['custom-phrase'] = [customPhraseData];
                customCategory.style.display = 'block';
                customPhraseItem.style.display = 'flex';
                customPhraseLabel.textContent = `My Custom Phrase (${customPhraseData.words.length} words)`;
                console.log('Loaded custom phrase from storage:', customPhraseData.words.length, 'words');
            }
        } catch (e) {
            console.error('Error loading custom phrase from storage:', e);
        }
    }
}

// ====== SETTINGS FUNCTIONALITY ======

// Audio Context for sound generation
let audioContext = null;

// Play success sound - soft and subtle
function playSuccessSound() {
    if (!settings.noiseyMode) return;

    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Soft, pleasant "click" sound - higher frequency, very quiet
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(1200, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(1400, audioContext.currentTime + 0.05);

    // Much quieter volume
    gainNode.gain.setValueAtTime(0.08, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.08);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.08);
}

// Update background gradient
function updateBackgroundGradient() {
    document.body.style.background = `linear-gradient(135deg, ${settings.bgColor1}, ${settings.bgColor2})`;
}

// Open settings modal
settingsBtn.addEventListener('click', () => {
    settingsModal.classList.add('show');

    // Load current settings into inputs
    bgColor1Input.value = settings.bgColor1;
    bgColor2Input.value = settings.bgColor2;
    noiseyModeToggle.checked = settings.noiseyMode;
    textureToggle.checked = settings.textureEnabled;
});

// Close settings modal
function closeSettingsModal() {
    settingsModal.classList.remove('show');
}

modalCloseSettings.addEventListener('click', closeSettingsModal);
closeSettingsBtn.addEventListener('click', closeSettingsModal);

// Click outside modal to close
settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
        closeSettingsModal();
    }
});

// Background gradient color pickers
bgColor1Input.addEventListener('input', (e) => {
    settings.bgColor1 = e.target.value;
    updateBackgroundGradient();
    saveSettings();
});

bgColor2Input.addEventListener('input', (e) => {
    settings.bgColor2 = e.target.value;
    updateBackgroundGradient();
    saveSettings();
});

// Reset gradient button
resetGradientBtn.addEventListener('click', () => {
    settings.bgColor1 = '#0f172a';
    settings.bgColor2 = '#1e293b';
    bgColor1Input.value = settings.bgColor1;
    bgColor2Input.value = settings.bgColor2;
    updateBackgroundGradient();
    saveSettings();
});

// Noisey mode toggle
noiseyModeToggle.addEventListener('change', (e) => {
    settings.noiseyMode = e.target.checked;
    saveSettings();

    // Play demo sound
    if (settings.noiseyMode) {
        playSuccessSound();
    }
});

// Texture toggle
textureToggle.addEventListener('change', (e) => {
    settings.textureEnabled = e.target.checked;
    updateBackgroundTexture();
    saveSettings();
});

// Update background texture
function updateBackgroundTexture() {
    if (settings.textureEnabled) {
        document.body.classList.add('texture-enabled');
    } else {
        document.body.classList.remove('texture-enabled');
    }
}

// Save settings to localStorage
function saveSettings() {
    localStorage.setItem('stenoKingSettings', JSON.stringify(settings));
}

// Load settings from localStorage
function loadSettings() {
    const savedSettings = localStorage.getItem('stenoKingSettings');
    if (savedSettings) {
        try {
            settings = JSON.parse(savedSettings);
            updateBackgroundGradient();
            updateBackgroundTexture();
        } catch (e) {
            console.error('Error loading settings:', e);
        }
    }
}

// Anki mode toggle
ankiModeCheckbox.addEventListener('change', (e) => {
    ankiMode = e.target.checked;
    localStorage.setItem('stenoKingAnkiMode', ankiMode);

    // If currently playing, re-sort the word bank
    if (isPlaying && ankiMode) {
        sortByAnkiScores();
    }
});

// Load Anki mode preference
function loadAnkiMode() {
    const saved = localStorage.getItem('stenoKingAnkiMode');
    if (saved !== null) {
        ankiMode = saved === 'true';
        ankiModeCheckbox.checked = ankiMode;
    }
}

// Load Reveal Always mode preference
function loadRevealAlways() {
    const saved = localStorage.getItem('stenoKingRevealAlways');
    if (saved !== null) {
        revealAlwaysMode = saved === 'true';
        if (revealAlwaysMode) {
            revealAlwaysBtn.classList.remove('btn-toggle');
            revealAlwaysBtn.classList.add('btn-toggle-active');
            revealAlwaysText.textContent = 'Hide Always';
        }
    }
}

// Initialize: Load dictionary, custom lists, settings, and Anki data
loadPloverDictionary();
loadCustomListFromStorage();
loadCustomPhraseFromStorage();
loadSettings();
loadWordScores();
loadAnkiMode();
loadRevealAlways();

// Collapsible Category Groups
function initCollapsibleCategories() {
    const collapsibleTitles = document.querySelectorAll('.group-title.collapsible');

    collapsibleTitles.forEach(title => {
        // Start all categories collapsed
        title.classList.add('collapsed');
        const categoryItems = title.nextElementSibling;
        if (categoryItems && categoryItems.classList.contains('category-items')) {
            categoryItems.classList.add('collapsed');
        }

        // Add click handler to toggle
        title.addEventListener('click', function() {
            // Toggle collapsed class on the title
            this.classList.toggle('collapsed');

            // Find the category-items div (next sibling)
            const categoryItems = this.nextElementSibling;
            if (categoryItems && categoryItems.classList.contains('category-items')) {
                categoryItems.classList.toggle('collapsed');
            }
        });
    });

    // Update highlights for all categories
    updateCategoryHighlights();
}

// Function to update category title highlights based on checked items
function updateCategoryHighlights() {
    const categoryGroups = document.querySelectorAll('.category-group');

    categoryGroups.forEach(group => {
        const title = group.querySelector('.group-title.collapsible');
        const checkboxes = group.querySelectorAll('.category-checkbox');

        if (title && checkboxes.length > 0) {
            // Check if any checkbox is checked
            const hasChecked = Array.from(checkboxes).some(cb => cb.checked);

            if (hasChecked) {
                title.classList.add('has-checked');
            } else {
                title.classList.remove('has-checked');
            }
        }
    });
}

// Add event listeners to all checkboxes to update highlights
function initCheckboxListeners() {
    const checkboxes = document.querySelectorAll('.category-checkbox');

    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateCategoryHighlights);
    });
}

// Initialize collapsible categories after DOM is loaded
initCollapsibleCategories();
initCheckboxListeners();
