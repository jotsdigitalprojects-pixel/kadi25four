# Kadi

A dynamic, browser-based card game built with React, TypeScript, and Tailwind CSS. This project features a single-player mode against AI opponents, a clean user interface, and strategic gameplay centered around special card abilities.

## Features

- **Single-Player vs. AI:** Play against 1 to 3 computer-controlled opponents.
- **Multiple Game Modes:** Choose between "Friendly" and the upcoming "Bomb ni Bomb" mode.
- **Interactive UI:** A clean, responsive interface that provides clear feedback on player actions.
- **Strategic Gameplay:** Rules that are easy to learn but offer strategic depth, especially with special cards.
- **Stateful Logic:** Robust turn management that handles complex scenarios like stacked skips and counter-plays.

## Game Modes

Kadi features different game modes with unique rules.

### Friendly
This is the standard game mode with the original rules. The goal is to empty your hand by making valid plays, with a special win condition requiring your last played card to be a non-special number card.

### Bomb ni Bomb
This is a more intense version of the game with more punishing rules.
 
**Rule Change #1: Stacking & Mixed Draws**
- **Cumulative Draws:** All draw penalties are cumulative.
  - **Combo Plays:** When you play multiple draw cards, their values are added together.
  - **Counter Plays:** When a player counters a draw penalty, the new value is added to the existing penalty. If Player A plays a '2' (draw 2) and Player B counters with a '2', Player C must now draw 4.
- **Mixed Draw Combos:** Players can combine different draw cards (`2`s, `3`s, and `Joker`s) in a single play, even if they have different ranks.
  - To be valid, any non-Joker cards in this combo must **share the same suit**.
  - **Example:** A player can play a `2 of Spades` and a `3 of Spades` together. The draw values are cumulative, so the next player must draw 5 cards. A `Joker` could also be added to this play, making it a draw 10.

## Game Rules

### 1. Setup
- The game is for one human player against 1-3 computer opponents.
- Each player is dealt an initial hand of 4 cards.
- A single card is drawn from the deck to start the "active pile."

### 2. Objective
The goal is to be the first player to get rid of all the cards in your hand.

**Winning Rule:** To win, a player's final play must result in a **non-special card** being at the top of the pile.

- **Winning Cards:** 4, 5, 6, 7, 9, 10.
- **Non-Winning (Special) Cards:** 2, 3, Ace, Jack, King, Joker, Queen, Eight.

If a player empties their hand by playing a special card as the final card of their turn (e.g., playing a King, a solo Queen, or a 2), they have **not yet won**. The special card's effect is applied as normal, and play continues. When the turn returns to that player, they will be forced to draw one card.

A player *can* win using a Queen or Eight, but only if it's part of a "Question & Answer" play where the final card placed on the pile is a non-special "Answer" card (e.g., playing a Q♥ with a 4♥ makes the 4♥ the top card, which is a valid winning move).

### 3. Gameplay
- On your turn, you may play one or more cards. If you cannot play any cards, or if you choose not to play, you must draw one card from the deck. Drawing a card immediately ends your turn.
- If the draw deck runs out of cards, the active pile is shuffled (leaving the top card) and becomes the new deck.

### 4. Playing Cards
- **Single Card:** A card can be played if it matches the **suit** or the **rank** of the top card on the active pile. Wild cards (Ace, Joker) can be played at any time.

- **Multiple Cards (Combos):** You can play multiple cards in a single turn as a combo. Valid combos include:
    - **Same Rank:** Multiple cards of the same rank (e.g., three `7`s).
    - **Joker Combos:** One or more Jokers combined with multiple `2`s or `3`s.
    - **Question & Answer:** A complex play involving "Question" cards (Queen, Eight) and "Answer" cards. (See Special Cards section for details).

- **Player-Controlled Order:** The order in which you select and play your cards is critical. The game does **not** automatically reorder your play.
    - **First Card Rule:** The **first** card you select in a combo must be a valid play on its own against the top card of the pile.
    - **Last Card Rule:** The **last** card you select in a combo is placed on top of the pile. Its effect (e.g., draw 2, skip, reverse) is the one that applies to the next player.

- **Example:** The pile shows a `King of Spades`. You want to play a `Joker` and a `3 of Spades`.
    - **Scenario 1:** You select the `3 of Spades` first (valid, matches suit), then the `Joker`. The `Joker` is the last card played, so its "draw 5" effect applies.
    - **Scenario 2:** You select the `Joker` first (valid, it's wild), then the `3 of Spades`. The `3 of Spades` is the last card played, so its "draw 3" effect applies.


### 5. Special Cards

#### The Queen and Eight (Question Cards)
- Queens and Eights are "Question" cards that allow for complex, multi-card plays. They can be played in two main ways:

- **Playing Multiple Question Cards:** When playing more than one Question card in a single turn, they must form a "connected" group. This means that every card in the group must link to at least one other card in the group by sharing either the same **rank** or the same **suit**. This allows for creating chains of Question cards.
    - **Valid:** `Q♥ + Q♠` (connected by rank)
    - **Valid:** `Q♥ + 8♥` (connected by suit)
    - **Valid:** `Q♥ + 8♥ + 8♠` (Q and 8 of Hearts are connected by suit; 8 of Hearts and 8 of Spades are connected by rank)
    - **Invalid:** `Q♥ + 8♠` (not connected by rank or suit)

- **Option 1: Play with an Answer from Your Hand**
    - This involves playing one or more "Question" cards (you can mix Queens and Eights) along with one or more "Answer" cards.
    - **Answer Cards:** Answer cards can be of any rank except for **Jack** and **King**.
    - **Rule 1 (Suit Match):** The first non-Joker "Answer" card played must **match the suit** of at least one of the "Question" cards. If all answers are Jokers, this rule is waived as they are wild.
    - **Rule 2 (Rank Match):** Any additional non-Joker "Answer" cards must **match the rank** of the first non-Joker Answer card. Jokers are wild and can be used to match any rank.
    - **Rule 3 (Pile Match):** To play a Question/Answer combination, the **first card you select** for the play must be a valid move on its own against the top card of the pile.
    - **Rule 4 (Special Card Answers):** You can use special cards like a `2`, `3`, or `Ace` as "Answer" cards. A `Joker` is also a valid "Answer" card, but remember that **any play containing a Joker cannot be a winning play**. The **Last Card Rule** is critical: if a special card is the last one played, its effect (e.g., "draw 2") applies, and you cannot win the game if it is the final card from your hand.
    - **Example 1 (Stacked Answers):** The pile is a 7 of Hearts. A player can select a `Queen of Hearts` first (valid Question card), followed by a `4 of Hearts` (first Answer, matches suit), a `4 of Spades` (second Answer, matches rank), and a `4 of Diamonds` (third Answer, matches rank) all in one turn. The `4 of Diamonds` becomes the new top card.
    - **Example 2 (Wild Answer):** The pile is a 7 of Spades. A player can select a `Queen of Spades` (Question) first, followed by a `Joker` (Answer). This is a valid move because the Joker is wild and can stand in for any suit and rank.

- **Option 2: Play a Question and Draw a Card**
    - If you don't have a valid Answer card (or choose not to play one), you can play one or more Question cards on their own. You can mix Queens and Eights in this play.
    - After playing them, you must immediately **draw one card** from the deck.
    - Your turn ends after you draw.
    - **Example:** The pile is a 7 of Clubs. You can play a `Queen of Clubs` and an `8 of Clubs` together. You then draw a card, and your turn ends.

#### The Jack (Skip)
- **Playing Jacks (Sequential Skip):** Playing one or more Jacks applies that many skips to your opponents sequentially. The player who played the Jacks is immune to their own play. After all skips are resolved, the turn passes to the player who would normally play **after the last player who was skipped**.
  - **Wrap-Around:** If the number of Jacks played exceeds the number of opponents, the skips will "wrap around" and apply to opponents again in sequence until all skips have been used.
  - **Example:** In a 4-player game (P1, P2, P3, P4), if P1 plays **4** Jacks: P2 is skipped, P3 is skipped, P4 is skipped, and the final skip wraps around to skip P2 again. The last player skipped was P2, so the turn passes to the next player in sequence: **P3**.

- **Receiving Skips:** The next player in sequence is now under threat of being skipped. Their options are:
  - **If they have a Jack:** They can either:
    1.  **Counter:** Play their own Jack(s). This action counters the incoming skip threat and **replaces** it with a new one. The old skip count is discarded. For example, if you are facing 1 skip and you play 2 Jacks, the new skip sequence starts from you, and the next two opponents will be skipped.
    2.  **Accept Skip:** Forfeit their turn. One skip is consumed, and any remaining skips are passed to the next player.
  - **If they do NOT have a Jack:** Their turn is **automatically skipped**. One skip is consumed, and the game immediately moves to the next player to resolve any remaining skips. This continues until all skips are gone or a player who can counter is reached.

#### The King (Kickback)
- Playing a King triggers a "Kickback," which reverses the direction of play (e.g., from clockwise to counter-clockwise).
- **Multiple Kings:** Each King played triggers its own reversal.
  - Playing an **odd** number of Kings (1, 3) will result in a net reversal of play direction.
  - Playing an **even** number of Kings (2, 4) will cause the direction to reverse and then reverse back, resulting in **no net change** to the direction of play.
- The King(s) must still be a valid play (matching the previous card's suit or rank).
- The effect is immediate and cannot be countered.

#### The 2 and 3 (Forced Draw)
- When a `2` is played, the next player must draw 2 cards. When a `3` is played, they must draw 3. This is subject to the **Last Card Rule**.
- **Counter-Play:** If the next player has a `2`, `3`, or Joker they can play, they may play it instead of drawing. This **replaces** the previous draw penalty with the new one, passing the new total to the following player. For example, if Player A plays a Joker (draw 5) and Player B counters with a `2`, Player C must now only draw 2 cards.
- If a player cannot (or chooses not to) counter, they must draw the required number of cards, and their turn is over.

#### The Joker (Wild Draw 5)
- The Joker is a wild card. It can be played on any card, regardless of suit or rank.
- Any card can be played on top of a Joker.
- When a Joker is the top card of a play, the next player must draw 5 cards.
- **As a Combo Card:** You can play Jokers along with a set of `2`s or `3`s. The rules for this depend on the game mode:
  - **Friendly Mode:** Any non-Joker cards in the combo must share the **same rank** (e.g., a Joker + two `2`s).
  - **Bomb ni Bomb Mode:** Non-Joker cards can have different ranks (e.g., a `2` and a `3`), but they must share the **same suit**.
The order you select them still matters: the last card you select will be on top of the pile and determine the effect. For example, playing `3, 3, Joker` will result in a "draw 5", while playing `Joker, 3, 3` results in a "draw 3".
- **As a Counter:** If you are facing a draw penalty, you can play a Joker to counter. This replaces the previous penalty, forcing the next player to draw 5 cards.
- **Cannot Be a Winning Card:** A Joker is a special card. If a play involving a Joker empties your hand, you have **not yet won**. The special effect is applied, and when your turn comes around again, you will be forced to draw one card.

#### The Ace (Wild & Suit Changer)
- The Ace has two powerful abilities depending on when it's played:
  1.  **As a Counter:** If a player is facing a "forced draw" from a 2, 3, or Joker, they can play an Ace (or two!) to counter.
    - **Single Ace:** Playing one Ace will **completely cancel** the draw penalty. The draw is reset to 0. The Ace's own suit becomes the new suit to follow (e.g., playing an Ace of Hearts means the next player must play a Heart).
    - **Double Ace:** Playing two Aces at once will also **cancel** the draw penalty. In addition, the player gets to **choose the next suit** for the game to follow.
  2.  **As a Normal Play:** An Ace can be played at any time on any card, as it does not need to match suit or rank. When played this way, the player who played the Ace **chooses the next suit** for the game to follow (e.g., they can declare "Spades"). The next player must then play a card of the chosen suit or another wild card.

## Project Structure

```
.
├── components/
│   ├── ActionFeedback.tsx
│   ├── GameSetup.tsx
│   ├── GameTable.tsx
│   ├── OpponentStub.tsx
│   ├── PlayerActions.tsx
│   ├── PlayerHand.tsx
│   ├── PlayingCard.tsx
│   ├── RulesModal.tsx
│   ├── SuitSelectionModal.tsx
│   └── WinnerModal.tsx
├── hooks/
│   ├── useComputerAI.ts
│   └── useGameEffects.ts
├── services/
│   ├── deckService.ts
│   └── gameLogic.ts
├── state/
│   └── gameReducer.ts
├── App.tsx
├── constants.ts
├── index.html
├── index.tsx
├── types.ts
└── README.md
```

## How to Run Locally

This project is set up to run in a specific web-based development environment. If you were to run it on a local machine, you would follow standard React project procedures:

1.  **Install dependencies:**
    ```bash
    npm install
    ```
2.  **Start the development server:**
    ```bash
    npm start
    ```
3.  Open your browser to `http://localhost:3000` (or the port specified by your environment).