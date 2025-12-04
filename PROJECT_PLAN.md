# StenoKing - Stenography Typing Practice App

## Project Overview
A browser-based typing test application designed specifically for practicing stenography. The app focuses on helping users learn and improve their stenography skills through interactive word practice with audio feedback.

## Core Features

### 1. Word Practice System
- Display one word at a time from a curated word bank
- Start with a small collection of easy-to-type words
- Expandable word bank for future additions
- Words advance automatically upon successful typing

### 2. Real-time Performance Tracking
- Display current Words Per Minute (WPM) as user types
- Calculate WPM based on correct word completions

### 3. Text-to-Speech Integration
- Automatically speak each word aloud when displayed
- Use browser's built-in Web Speech API (simple, clear pronunciation)
- Next word is spoken immediately after successful completion of current word

### 4. Steno Chord Hint System
- Steno keyboard chord patterns are hidden by default
- "Reveal" button shows the correct key press chords for the current word
- Helps users learn the proper finger positions and chord combinations
- Encourages users to try before looking at the answer

## Technical Stack (Proposed)
- Pure HTML/CSS/JavaScript (no framework needed initially)
- Web Speech API for text-to-speech
- LocalStorage for potential future features (tracking progress, preferences)

## User Flow
1. User loads the application
2. First word is displayed and spoken aloud
3. User attempts to type the word using their steno keyboard
4. If stuck, user can click "Reveal" to see the chord pattern
5. Upon successful completion, WPM updates and next word is immediately displayed and spoken
6. Process repeats

## Future Enhancements (Not in Initial Version)
- Expanded word bank with difficulty levels
- Session statistics and history
- Customizable word lists
- Practice modes (timed sessions, word count goals)
- Progress tracking over time
- Accuracy percentage
- Sound effects for correct/incorrect words
