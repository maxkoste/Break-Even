# Break Even  
A tiny 8-bit blackjack descent into desperation.

## Premise

You’re Mike.  
You’re a washed-up, pixelated gambler with a talent for bad decisions and exactly $200 left in chips.

Your phone buzzes.  
It’s your wife, furious again:  
“Where are you? I hope you’re not out there gambling again, Mike!”

Too late.  
You’re already $10,000 in the hole.  
Your only goal now is to claw your way back to zero before the last chip disappears and your life collapses into a heap of 8-bit shame.

Welcome to *Break Even* — a blackjack simulator about pressure, probability, and poor life choices.

## What This Is

A game hosted on the web built with a JavaScript frontend and a Python backend. The game simulates blackjack with the single objective of returning your balance to zero. You start with $200. You will almost certainly lose. That’s part of the charm.

No casinos.  
No flashy animations.  
Just you, the deck, and a mounting sense that Mike might never emotionally recover from this.

### Features
- A simple, responsive browser UI written in JavaScript.
- A Python backend that handles shuffling, dealing, hit/stand logic, and balance updates.
- A persistent running total of your monstrous debt.
- Text messages from your wife reminding you what’s at stake.
- The hollow thrill of chasing losses in retro 8-bit style.

### Gameplay Loop
1. Start at –$10,000.  
2. Hold $200 in chips.  
3. Play blackjack hands and try to climb back to zero.  
4. If you hit zero, you “break even” and Mike can go home with something resembling dignity.  
5. If you bust your last chip, you lose the game and face the music.

### Tech Overview

**Frontend:**  
- JavaScript  
- Simple UI rendering  
- Fetch requests to communicate with the backend  

**Backend:**  
- Python  
- Deck of Cards API  
- Returns hand results, updated balance, and game state  


### Instructions

- Running the server:

```
source .venv/bin/activate

flask --app src/app run
```
