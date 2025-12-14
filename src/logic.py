from collections import deque
import random

chips = 200
deck_id = None #Not needed?
deck = None
hands = [[], []]
#Should be double array, to store several hands when splitting, each with cards.
#Maybe the last value in card arrays is the player's bet? Maybe last hand contains jokers?
#There may not be a point in saving info about cards other than score. Aces?
#A player should have a "turn" for each hand they currently have, excluding joker hand.
#Maybe that is tracked in JS? 
scores = [0, 0] 
powerups = []

def populate_deck(cards): #Take formatted data from the API call and place the cards inside the deck.
    global deck
    deck = deque(cards)

def start_game(): #Give both players 2 cards. DOES NOT account for Jokers, do in loop until 2 cards
    draw_card(0)
    draw_card(0)
    draw_card(1)
    draw_card(1)
    print("Hands after initial deal:")
    for i, hand in enumerate(hands):
        print(f"Hand {i}: {hand}, Score: {scores[i]}")

def draw_card(hand_index):
    global hands, scores, deck

    card = deck.popleft() # Jokers dissapear if drawn by dealer, bug or feature?
    hands[hand_index].append(card)

    value, suit = card
    if value != "JOKER":
        scores[hand_index] += value
    elif hand_index != 0: 
        powerups.append(random.choice(range(0, 1))) #0-0, Expand to 0-24 for all 24 options
    if scores[hand_index] > 21:
        game_over()

def split(): #Place one of player's cards into a new hand.
    pass

def double_down(): #Double the bet.
    pass

def insure(): #Some weird stuff I dunno
    pass

def dealer_turn(): #Algorithm for playing. Generally hit until 17 is reached, then stand.
    pass

def game_over(): #Compare decks, if 1 over 21 other is the winner, otherwise highest wins. Return
    # winner or tie. Next turn.
    print("game over")

def next_turn(win_or_tie): #Payout bet on win, nothing on loss, keep on table if tie. Reset hands
    # except joker maybe?
    pass

def assign_powerups(player_data): #Read celestial data and assign correct powerups
    powerups.append(0)

def use_powerup(powerup_index): # 0-11 Major, 12-24 Minor
    powerups.remove(powerup_index)
    match powerup_index:
        case 0: #Sun Major, show hidden dealer card.
            return hands[0][0]
        case 1: #Moon Major, 
            pass
        case 2:
            pass
        case 3:
            pass
        case 4:
            pass
        case 5:
            pass
        case 6:
            pass
        case 7:
            pass
        case 8:
            pass
        case 9:
            pass
        case 10:
            pass
        case 11:
            pass
        case 12:
            pass
        case 13:
            pass
        case 14:
            pass
        case 15:
            pass
        case 16:
            pass
        case 17:
            pass
        case 18:
            pass
        case 19:
            pass
        case 20:
            pass
        case 21:
            pass
        case 22:
            pass
        case 23:
            pass
        case _:
            print("Incorrect power-up value")