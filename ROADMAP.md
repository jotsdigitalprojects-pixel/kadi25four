# Kadi: Project Evolution Roadmap

## 1. Vision Statement

**To transform Kadi from a single-player card game into the "Candy Crush" of online multiplayer mobile browser games.**

This vision entails a complete reimagining of the game's user experience, technical architecture, and engagement model. The goal is to create a highly accessible, visually appealing, and socially engaging game that players can enjoy in short, satisfying bursts, while offering deep strategic gameplay for long-term retention.

---

## 2. Core Principles

The entire development process will be guided by the following principles, derived from the most successful hyper-casual games:

1.  **"Juice" is Everything:** Every user interaction—from playing a card to winning a round—must be accompanied by delightful animations, crisp sound effects, and rewarding visual feedback to feel satisfying and addictive.
2.  **Snackable Sessions:** Game rounds should be quick (2-5 minutes), allowing players to engage meaningfully during short breaks in their day.
3.  **Constant Progression:** Players must always feel a sense of forward momentum. Even in a loss, they should be progressing towards a larger goal (e.g., a daily quest, experience points, or an achievement).
4.  **Frictionless Social Integration:** The experience must be amplified when shared. Competing on leaderboards, viewing friends' progress, and sending emotes are core to building a community.
5.  **Fair Monetization:** The game must be fun and winnable for free-to-play users. Monetization will focus on cosmetics, convenience, and expressing identity, strictly avoiding a "pay-to-win" model.

---

## 3. Current State Analysis (As of Project Inception)

-   **Platform:** Browser-based application.
-   **Technology:** React, TypeScript, Tailwind CSS.
-   **Core Gameplay:** A feature-rich, single-player card game against 1-3 AI opponents.
-   **Ruleset:** Complex and strategic, with multiple "special" cards (Aces, Kings, Jacks, Queens, etc.) and two distinct game modes ("Friendly" and "Bomb ni Bomb").
-   **UI/UX:** Functional, desktop-first layout. Lacks the "juice" and mobile-first design required for a mass-market casual game.
-   **Architecture:** The application employs a modern React architecture.
    -   **State Management:** Utilizes a centralized `useReducer` pattern to manage all game state, ensuring predictable and atomic state transitions.
    -   **Logic Separation:** Business logic is cleanly separated using custom hooks (`useComputerAI`, `useGameEffects`) for handling side-effects and AI, and a service layer (`gameLogic.ts`) for pure, testable functions.
    -   **Componentization:** The UI is broken down into small, reusable components.
    -   **Backend:** Client-side logic only; no backend, user accounts, or multiplayer capabilities.

---

## 4. Phased Development Roadmap

### Phase 1: The Foundation - Rebuilding for a Mobile-First, Multiplayer World

*Objective: Overhaul the core experience and implement the technical backbone for a real-time, social game.*

-   **Task 1.1: Complete UI/UX Overhaul**
    -   **Redesign for Portrait Mode:** Rebuild the entire interface for a vertical, one-handed mobile experience.
    -   **Develop a Vibrant Art Style:** Commission a new, stylized, and colorful art direction for cards, avatars, and game backgrounds.
    -   **Implement Intuitive Gestures:** The primary card-playing mechanic will be a satisfying drag-and-drop/flick gesture.
    -   **Enhance Visual Hierarchy:** Use animations, highlights, and clear iconography to make the game state (current player, active suit, penalties) instantly understandable.

-   **Task 1.2: Real-Time Multiplayer Architecture**
    -   **Backend Implementation:** Integrate a real-time backend service (e.g., Firebase - Firestore/Realtime Database) to manage game state, user data, and communication.
    -   **User Authentication:** Implement social logins (Google, Apple, etc.) for frictionless onboarding.
    -   **Matchmaking System:** Create a simple, one-button matchmaking service to quickly connect 2-4 players into a game.
    -   **Friends & Private Lobbies:** Build functionality for users to add friends and invite them to private games.

-   **Task 1.3: Real-Time Voice & Video Chat (NEW)**
    -   **UI/UX Integration:** Design and implement non-intrusive video feeds (e.g., small circles in screen corners) into the portrait mode layout.
    -   **In-Game Controls:** Provide easy-to-access controls for players to mute their own mic/camera, and to mute or report other players.
    -   **WebRTC Implementation:** Integrate a managed WebRTC service (e.g., Agora, Twilio) to handle reliable, low-latency video and audio streaming.
    -   **Permissions Handling:** Create a clear, user-friendly prompt to request camera and microphone access. Add settings for players to opt-out by default.

### Phase 2: The Engagement Loop - Making Kadi a Daily Habit

*Objective: Introduce systems that encourage daily play and give players a constant sense of progression.*

-   **Task 2.1: Player Progression System**
    -   **Levels & XP:** Implement an experience point system where every game played grants XP, leading to player level-ups that unlock cosmetic rewards.
    -   **Quests:** Introduce daily and weekly quests (e.g., "Play 5 King cards," "Win 2 games") that grant in-game currency.
    -   **Achievements:** Create a system for long-term goals that award permanent badges or titles for player profiles.

-   **Task 2.2: In-Game Economy**
    -   **Soft Currency (Coins):** An earnable currency from playing games and completing quests, used to purchase standard cosmetic items.
    -   **Hard Currency (Gems):** A premium currency, primarily acquired via in-app purchases, used for exclusive cosmetics and special items.

-   **Task 2.3: Social Features**
    -   **Leaderboards:** Implement weekly "Friends" and "Global" leaderboards.
    -   **Player Profiles:** Create simple, customizable profiles to display level, achievements, and selected cosmetics.
    -   **In-Game Emotes:** Add a system of pre-set animated emotes for quick, fun, and safe communication during matches.

### Phase 3: Monetization & Long-Term Growth

*Objective: Introduce fair and optional monetization mechanics that enhance the player experience without compromising game balance.*

-   **Task 3.1: The Kadi Store**
    -   **Cosmetic Items:** Create an in-game shop where players can spend Coins and Gems on:
        -   Custom Card Backs
        -   Animated Game Board Themes
        -   Special "Win" and "Play" Effects
        -   Player Avatars and Profile Frames

-   **Task 3.2: The "Kadi Pass" (Battle Pass System)**
    -   Implement a seasonal progression track with free and premium tiers. The premium pass will offer a high volume of exclusive cosmetic rewards to players who purchase it.

-   **Task 3.3: Rewarded Ads**
    -   Integrate an optional, rewarded ad system (e.g., "Watch an ad for 100 bonus Coins").

### Phase 4: Expanding the Universe

*Objective: Keep the experience fresh and engaging for the long term with new content and features.*

-   **Task 4.1: Competitive & Ranked Mode**
    -   Develop a separate matchmaking queue with a seasonal ranking system (e.g., Bronze, Silver, Gold) and exclusive end-of-season rewards for top players.

-   **Task 4.2: Special Game Modes & Events**
    -   Design and implement limited-time events with unique rule modifiers to keep the meta fresh and drive engagement.

-   **Task 4.3: Live Ops**
    -   Establish a cadence for regular updates, including new Kadi Pass seasons, new cosmetic items in the store, and community engagement initiatives.

---

## 5. Proposed Technology Stack

-   **Frontend:** React, TypeScript, Tailwind CSS (Refactored for mobile-first and component reusability).
-   **State Management:** Evolve from `useState` to a more robust client-side solution like Zustand or Redux Toolkit to manage complex UI and game state.
-   **Backend:** Firebase (Authentication, Firestore for real-time data, Cloud Functions for server-side logic).
-   **Real-Time Communication:** A managed WebRTC service (e.g., Agora, Twilio) for voice and video chat.
-   **Animation:** A dedicated animation library (e.g., Framer Motion) to achieve the required level of "juice".
