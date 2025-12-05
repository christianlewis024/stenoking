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

// Custom list state
let ploverDictionary = null;
let customWordList = [];
let customPhraseData = null; // Will store {sentence, words, chords}

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

// Initialize: Load dictionary and custom list/phrase
loadPloverDictionary();
loadCustomListFromStorage();
loadCustomPhraseFromStorage();
