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

    card = deck.popleft() # Jokers dissapear if drawn by dealer, add logic to ignore dealer jokers.

    value, suit = card
    if value != "JOKER":
        scores[hand_index] += value
    elif hand_index != 0: 
        powerups.append(random.choice(range(0, 4))) #0-3, Expand to 0-22 for all 21 options

    hands[hand_index].append(card)
    
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

def use_powerup(powerup_index): # 0-10 Major, 10-21 Minor
    powerups.remove(powerup_index)
    match powerup_index:
        case 0: #Sun Major, show hidden dealer card.
            return hands[0][0]
        case 1: #Moon Major, look at the next card, draw it or the one after.
            return deck[0], deck[1] #Helper method called after user picks, use deck.rotate
        case 2: #Mercury Major,
            next_turn(False) # resets turn 
        case 3: #Venus Major, increase bet by 1.5x for each heart in hand.
            return sum(1 for value, suit in hands[1] if suit == "HEARTS") #MAKE INCREASE ACTUAL BET
        case 4: #Earth Major, split any hand
            pass
        case 5: #Mars Major, destroy dealers card
            pass
        case 6: #Jupter Major, search next 7 cards, draw the one that gets you closest to 21.
            pass
        case 7: #Saturn Major, next time you go over 21, loop back around from 1 and up. 
            pass
        case 8: #Uranus Major, randomize all cards both hands.
            pass
        case 9: #Neptune Major, search cards until you find one that wont make you bust then draw.
            pass
        case 10: #Pluto Major, triple down on any hand.
            pass
        case 11: #Sun Minor, show next card.
            return deck[0]
        case 12: #Moon Minor, 
            pass
        case 13: #Mercury Minor,
            pass
        case 14: #Venus Minor,
            pass
        case 15: #Earth Minor, 
            pass
        case 16: #Mars Minor, 
            pass
        case 17: #Jupiter Minor,
            pass
        case 18: #Saturn Minor, 
            pass
        case 19: #Uranus Minor, 
            pass
        case 20: #Neptune Minor, 
            pass
        case 21: #Pluto Minor,
            pass
        case _:
            print("Incorrect power-up value")