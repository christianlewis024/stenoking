# StenoKing - Stenography Typing Practice App

## Project Overview
A modern, browser-based typing practice application designed specifically for stenography learners. The app provides an interactive, gamified learning experience with comprehensive word banks, intelligent spaced repetition, and extensive customization options.

## Current Status: Feature Complete ✅

### Core Architecture
- **Pure HTML/CSS/JavaScript** - No frameworks, fast and lightweight
- **Web Speech API** - Text-to-speech for audio feedback
- **LocalStorage** - Persistent data for all user preferences and learning progress
- **Web Audio API** - Procedural sound generation for feedback
- **Canvas API** - (Previously used for visual modes, now removed)

---

## Implemented Features

### 🎯 Practice System

#### Word Banks (18 Categories)
- **Intro**: Learn the Layout (97 words)
- **Sentences**:
  - Sentences 1 - Beginner (50 sentences, 4-6 words each)
  - Sentences 2 - Intermediate (50 sentences, 5-10 words each)
  - Sentences 3 - Advanced (50 sentences, 6-8 words each, mixed categories)
- **Keystroke Patterns**: 1-4 keystrokes
- **Advanced Techniques**: Dropping Unstressed Vowels, Diphthong Chords, Vowel Disambiguator, Digraphs
- **Consonant Clusters**: K/D/F/L/G/B/Z/V, N/M/J/Y, Compound Clusters
- **Combinations**: Combo 1, 2, 3
- **Common Briefs**: 100 most common stenography briefs

**Total Content**: 763+ individual words, 150 practice sentences

#### Mixed Mode Support
- Seamlessly mix single words and sentences in the same practice session
- Sentences display word-by-word with current word underlined
- Automatic detection of content type (sentence vs. single word)
- Proper handling of reveal chord and TTS for both types

### 🎨 User Interface

#### Modern Design
- Dark theme with customizable gradient background
- Navbar with branding and quick-access controls
- Left sidebar with organized category selection
- Centered practice area with large, readable text
- Responsive design for desktop and mobile

#### Visual Feedback
- Smooth animations for correct words
- Color-coded difficulty indicators (Anki mode)
- Pulse effects and transitions
- Optional subtle cross-hatch texture overlay

### 🎵 Audio Features

#### Text-to-Speech (TTS)
- Automatic word pronunciation using Web Speech API
- Two modes for sentences:
  - **Word by Word**: Speaks each word individually as you type
  - **Full Sentence**: Speaks entire sentence at start, then word-by-word
- Toggle between modes based on user preference

#### Noisey Mode
- Subtle, satisfying click sound on correct word completion
- Soft sine wave (1200-1400Hz)
- Very quiet (0.08 volume) to not interfere with TTS
- 80ms duration
- Optional toggle in settings

### 📊 Performance Tracking

#### Real-time Statistics
- **WPM (Words Per Minute)**: Live calculation based on typing speed
- **Word Count**: Total words completed in session
- Both stats prominently displayed above practice area

#### Anki Mode - Spaced Repetition Learning 🧠
- **Smart Scoring System**:
  - Response time tracking for each word/sentence word
  - Score increases with slow responses (needs practice)
  - Score decreases with fast responses (mastered)
  - Keeps rolling average of last 10 attempts
- **Intelligent Sorting**:
  - Words with higher scores (harder) appear more frequently
  - Words with lower scores (easier) appear less frequently
  - Re-sorts after completing entire word bank
- **Visual Difficulty Indicator**:
  - 🟢 Green (score 0): Easy, mastered
  - 🟢 Lime (score 1-3): Pretty easy
  - 🟡 Yellow (score 4-6): Medium difficulty
  - 🟠 Orange (score 7-10): Getting hard
  - 🔴 Red (score 11+): Hard, needs practice
- **Persistent Progress**: All scores saved to localStorage

### 🎮 Practice Controls

#### Main Controls
- **Start/Restart Button**: Begin or restart practice session
- **Pause Button**: Pause and resume practice
  - Disables input when paused
  - Stops Anki timing (no penalty)
  - Fades word display to indicate pause state
- **Reveal Chord Button**: Show stenography chord for current word
  - Maintains focus on input for continued typing

#### Category Management
- **Sidebar Checkboxes**: Select any combination of categories
- **Clear All Button**: Quickly deselect all categories
- **Custom Categories**: Appear at top when created

### 🛠️ Customization Features

#### Custom Word Lists
- **Custom List**: Add up to 200 individual words
  - One word per line
  - Automatic Plover dictionary lookup for chords
  - Words not found in dictionary are skipped
  - Persists in localStorage
- **Custom Phrase**: Add phrases/paragraphs
  - Up to 200 words total
  - Splits by whitespace
  - Handles punctuation intelligently
  - Creates sentence-style practice item
- **Plover Dictionary Integration**:
  - Loads dictionary from GitHub (didoesdigital/steno-dictionaries)
  - Reverse lookup to find chords for English words
  - ~140,000+ entries

#### Settings Panel (⚙️ Gear Icon)
- **Background Gradient**:
  - Two color pickers for custom gradient
  - Live preview as you adjust
  - Reset to default option
- **Noisey Mode**:
  - Toggle sound effects on/off
  - Demo sound plays when enabled
- **Background Texture**:
  - Subtle cross-hatch pattern overlay
  - Toggle on/off
  - Broad 200px diagonal lines
  - Very low opacity (0.01-0.02)

All settings persist via localStorage and load automatically on page refresh.

---

## Technical Implementation

### File Structure
```
stenoking/
├── index.html          # Main HTML structure, modals, navigation
├── styles.css          # Complete styling, animations, responsive design
├── app.js              # Core game logic, Anki system, event handlers
├── words.js            # All word banks and sentence data (~5000+ lines)
└── PROJECT_PLAN.md     # This file
```

### Key JavaScript Functions

#### Core Game Loop
- `buildActiveWordBank()` - Combines selected categories into practice queue
- `shuffleWords()` - Fisher-Yates shuffle for random order
- `sortByAnkiScores()` - Intelligent sorting based on difficulty scores
- `startPractice()` - Initialize session, UI, and word bank
- `showNextWord()` - Display next word/sentence, start timing, update difficulty indicator
- `checkWord()` - Validate input, update scores, advance to next word

#### Anki System
- `getWordKey()` - Generate unique identifier for tracking
- `initWordScore()` - Initialize score object for new words
- `updateWordScore()` - Update difficulty based on response time
- `getDifficultyColor()` - Map score to color scale
- `updateDifficultyIndicator()` - Update visual difficulty display

#### Custom Lists
- `loadPloverDictionary()` - Fetch dictionary from GitHub
- `findChordForWord()` - Reverse lookup in dictionary
- `saveCustomList()` / `saveCustomPhrase()` - Process and store custom content

#### Settings
- `updateBackgroundGradient()` - Apply custom colors
- `updateBackgroundTexture()` - Toggle texture overlay
- `playSuccessSound()` - Generate procedural audio feedback
- `togglePause()` - Pause/resume with proper state management

### LocalStorage Keys
- `stenoKingSettings` - UI preferences (gradient, noisey mode, texture)
- `stenoKingAnkiMode` - Anki mode on/off preference
- `stenoKingAnkiScores` - All word difficulty scores and response times
- `customWordList` - User's custom word list
- `customPhrase` - User's custom phrase

### CSS Architecture
- CSS Custom Properties for theming
- Flexbox and Grid layouts
- Smooth transitions and animations
- Mobile-responsive with media queries
- Pseudo-elements for texture overlay

---

## User Workflows

### Basic Practice Session
1. User opens application
2. Selects categories from left sidebar (sentences, words, or both)
3. Optionally enables Anki Mode for spaced repetition
4. Clicks "Start Practice"
5. Word/sentence appears with TTS audio
6. Types the word correctly
7. Sees animation, hears feedback sound (if enabled)
8. Next word appears automatically
9. Can pause, restart, or reveal chord anytime

### Creating Custom Content
1. Clicks "Custom List" or "Custom Phrase" in navbar
2. Modal opens with text input
3. Enters words (one per line) or pastes paragraph
4. Clicks "Save"
5. App fetches Plover dictionary (if not loaded)
6. Performs reverse lookup for each word
7. Shows success message with count
8. Custom category appears at top of sidebar
9. Can now practice with custom content

### Anki Mode Learning
1. Enables "Anki Mode" checkbox in navbar
2. Starts practice session
3. Sees difficulty indicator (colored bar) above each word
4. Types slowly → word becomes orange/red, appears more often
5. Types quickly → word becomes green/lime, appears less often
6. Over time, difficult words get more practice
7. Easy words seen less frequently but still reviewed
8. All progress saved, persists across sessions

### Customizing Appearance
1. Clicks gear icon (⚙️) in navbar
2. Settings modal opens
3. Adjusts background colors with color pickers
4. Toggles noisey mode on/off (hears demo)
5. Toggles background texture on/off
6. Clicks "Done"
7. All preferences saved automatically

---

## Future Enhancement Ideas

### Practice Features
- Accuracy percentage tracking
- Session history and statistics dashboard
- Timed practice modes (1 min, 5 min, 10 min)
- Target WPM goals with progress tracking
- Streak tracking (consecutive days practiced)
- Achievement system/badges

### Learning Features
- Built-in stenography lessons/tutorials
- Video demonstrations of hand positions
- Visual steno keyboard layout reference
- Word difficulty ratings beyond Anki scores
- Learning paths (beginner → intermediate → advanced)
- Theory explanations for chord patterns

### Content Expansion
- Import/export custom lists (JSON format)
- Share custom lists with other users
- Community word banks
- Domain-specific vocabulary (legal, medical, technical)
- Multi-language support

### Advanced Features
- User accounts (optional, cloud sync)
- Practice with friends (multiplayer races)
- Global leaderboards
- Heat map showing typing speed over time
- Detailed analytics (most difficult patterns, common mistakes)
- Practice replay system

### Technical Improvements
- Offline PWA support (Progressive Web App)
- Dark/light theme toggle
- More gradient presets
- Export statistics to CSV
- Keyboard shortcuts for all controls
- Voice commands integration

---

## Known Limitations

- Requires internet connection for initial Plover dictionary load
- TTS quality depends on browser's speech synthesis engine
- Custom words limited to what's in the Plover dictionary
- No mobile steno keyboard support (assumes physical steno machine)
- LocalStorage limits (~5-10MB depending on browser)

---

## Development Notes

### Performance Considerations
- Word banks stored in separate file to keep main code clean
- Efficient Fisher-Yates shuffle for randomization
- Debounced input checking (on input event)
- LocalStorage writes batched where possible
- CSS animations use transform/opacity for GPU acceleration

### Browser Compatibility
- Tested on modern Chrome, Firefox, Safari, Edge
- Requires ES6+ support (const, let, arrow functions, template literals)
- Web Speech API supported in all major browsers
- Web Audio API widely supported
- LocalStorage universal support

### Code Quality
- Clear separation of concerns (data, logic, presentation)
- Comprehensive comments throughout codebase
- Consistent naming conventions
- Modular function design for maintainability
- No external dependencies (vanilla JS)

---

## Conclusion

StenoKing has evolved from a simple typing test into a comprehensive stenography learning platform. The combination of extensive content, intelligent spaced repetition, and deep customization makes it a powerful tool for both beginners and advanced stenography students. The app successfully balances feature richness with simplicity and performance.

**Current Version**: 1.0 - Feature Complete
**Last Updated**: December 2025
**Status**: Production Ready ✅
