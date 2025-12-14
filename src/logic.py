chips = 200
deck_id = None
deck = {}
player_hands = {} #Should be double array, to store several hands when splitting, each with cards.
#Maybe the last value in card arrays is the player's bet? Maybe last hand contains jokers?
dealer_hand = {} #There may not be a point in saving info about cards other than score. Aces?
#A player should have a "turn" for each hand they currently have, excluding joker hand.
#Maybe that is tracked in JS? 

def populate_deck(cards): #Take formatted data from the API call and place the cards inside the deck.
    pass

def start_game(): #Give both players 2 cards.
    pass

def hit(active_hand): #Take the first card from the deck, if a joker place in joker storage, if total  
# exceeds 21 then trigger game over, else add card to active hand (one of player hands or dealer hand).
    pass

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