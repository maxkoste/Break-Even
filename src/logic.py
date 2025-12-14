from collections import deque

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

def populate_deck(cards): #Take formatted data from the API call and place the cards inside the deck.
    global deck
    deck = deque(cards)

def start_game(): #Give both players 2 cards.
    draw_card(0)
    draw_card(0)
    draw_card(1)
    draw_card(1)
    print("Hands after initial deal:")
    for i, hand in enumerate(hands):
        print(f"Hand {i}: {hand}, Score: {scores[i]}")



#Hand 0 is dealers hand, player hands increment up.
def hit(active_hand): #Take the first card from the deck, if a joker place in joker storage, if total  
# exceeds 21 then trigger game over, else add card to active hand (one of player hands or dealer hand).
    pass

def draw_card(hand_index):
    global hands, scores, deck

    card = deck.popleft()
    hands[hand_index].append(card)

    value, suit = card
    if value != "JOKER":
        scores[hand_index] += value


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
    pass

def next_turn(win_or_tie): #Payout bet on win, nothing on loss, keep on table if tie. Reset hands
    # except joker maybe?
    pass