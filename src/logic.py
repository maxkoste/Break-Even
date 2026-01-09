from collections import deque
import random

chips = 200
deck_id = None  # Not needed?
deck = None
hands = [[], []]
scores = [0, 0]
powerups = [0, 5, 5]
powerup_info = None
game_started = False
celestial_data = None

VALUE_MAP = {
    "ACE": 11,
    "JACK": 10,
    "QUEEN": 10,
    "KING": 10,
}

def populate_deck(cards):  # Take data from the API call and place the cards inside the deck.
    global deck
    deck = deque(cards)


def start_game():  # Give both players 2 cards.
    global game_started
    game_started = True

    draw_card(0)
    draw_card(0)
    draw_card(1)
    draw_card(1)

    return game_state()


def draw_card(hand_index):
    global hands, scores, deck

    if hand_index == 0:
        while deck[0][0] == "JOKER":
            print("JOKER DETECTED, OBLITERATE")
            deck.rotate(1)

    card = deck.popleft()

    value, suit = card
    if value != "JOKER":
        scores[hand_index] += get_score(value)
    elif hand_index != 0:
        powerups.append(
            random.choice(range(0, 4))
        )  # 0-3, Expand to 0-22 for all 21 options

    hands[hand_index].append(card)

    # check if over 21
    if scores[hand_index] > 21:
        for card in hands[hand_index]:
            if card[0] == "ACE":  # ace found
                scores[hand_index] -= 10
                print(f"Ace converted to 1! New score: {scores[hand_index]}")
                break

        # check again if over 21
        # NOT >= 21 because we want to give players a chance to use a powerup.
        if scores[hand_index] > 21:
            return True

    return False

def set_celestial_data(data):
    global celestial_data
    celestial_data = data
    print("setting celestial data: \n", celestial_data)


def get_score(card_value):
    if card_value in VALUE_MAP:
        return VALUE_MAP[card_value]
    return int(card_value)


def bet(amount, hand_index=1):
    global chips

    # Ensure the bet is positive
    if amount <= 0:
        return "Bet must be greater than 0."

    # Ensure the player has enough chips
    if chips < amount:
        return "Not enough chips to place this bet."

    # Deduct the bet from the player's total chips
    chips -= amount

    # Store the bet in the hand (as the first element in the hand)
    hands[hand_index].append((amount, "BET"))

    if chips <= 0:
        return "GAME_OVER"

    return f"Bet of {amount} placed on hand {hand_index}."

def reset_game():
    global chips, hands, scores, game_started, powerups
    chips = 200
    hands = [[], []]
    scores = [0, 0]
    powerups = [0, 5, 5]
    game_started = False

def split():  # Place one of player's cards into a new hand.
    pass


def double_down(bet_amount, hand_index=0):
    # Use the bet() function to place the extra bet
    bet_result = bet(bet_amount, hand_index)
    if "Not enough chips" in bet_result:
        return bet_result

    # Draw exactly one card for the hand
    draw_card(hand_index)

    # After double down, the player's turn for this hand ends
    return f"Double down! Bet increased by {bet_amount} on hand {hand_index}, one card drawn."


def insurance():  # Place an insurance if dealers first card is an Ace
    pass


def dealer_turn():  # Algorithm for playing. Generally hit until 17 is reached, then stand.
    while scores[0] < 17:
        draw_card(0)


def game_over():  # Compare decks, if 1 over 21 other is the winner, otherwise highest wins. Return
    # winner or tie. Next turn.
    global chips
    player_score = scores[1]
    dealer_score = scores[0]

    bet_amount = 0
    for card in hands[1]:
        if isinstance(card, tuple) and len(card) == 2 and card[1] == "BET":
            bet_amount = card[0]
            break

    if dealer_score > 21:
        chips += bet_amount * 2
        winner = "Player wins! Dealer busted"
    elif player_score > 21:
        winner = "Dealer wins! Player busted"
    elif player_score > dealer_score:
        chips += bet_amount * 2
        winner = "Player wins!"
    elif dealer_score > player_score:
        winner = "Dealer wins!"
    else:
        chips += bet_amount
        winner = "It's a tie!"

        # Om spelaren har 0 chips efter detta, signalera GAME_OVER
    if chips <= 0:
        return "GAME_OVER"
    
    return winner


def game_state(winner=None, game_over=False):
    return {
        "player": hands[1],
        "dealer": hands[0],
        "player_score": scores[1],
        "dealer_score": scores[0],
        "chips": chips,
        "powerups": powerups,
        "powerup_info": powerup_info,
        "game_started": game_started,
        "game_over": game_over,
        "winner": winner,
    }


def next_turn(
    winner,
):  # Payout bet on win, nothing on loss, keep on table if tie. Reset hands
    # except joker maybe?
    global hands, scores

    hands = [[], []]
    scores = [0, 0]


def assign_powerups(selected_sign):  # Read celestial data and assign correct powerups
    print("assigning powerups ", selected_sign)

    powerups.append(0)


def draw_card_by_index(index, hand_index):
    deck.rotate(-index)  # index of 0 does nothing, -1 takes next in list, so on
    draw_card(hand_index)  # only used by player


def use_powerup(powerup_index):  # 0-10 Major, 10-21 Minor
    global powerup_info, scores
    powerups.remove(powerup_index)

    match powerup_index:
        case 0:  # Sun Major, show hidden dealer card.
            powerup_info = hands[0][0]
        case 1:  # Moon Major, look at the next card, draw it or the one after.
            return deck[0], deck[
                1
            ]  # Helper method called after user picks, use deck.rotate
        case 2:  # Mercury Major,
            pass
            # resets turn
        case 3:  # Venus Major, increase bet by 1.5x for each heart in hand.
            return sum(
                1 for value, suit in hands[1] if suit == "HEARTS"
            )  # MAKE INCREASE ACTUAL BET
        case 4:  # Earth Major, split any hand
            pass
        case 5:  # Mars Major, destroy dealers card
            powerup_info = f"Dealers {hands[0][1]} has been obliterated!!!"
            card_value, suit = hands[0][1]
            scores[0] -= get_score(card_value)
            del hands[0][1]
        case 6:  # Jupter Major, search next 7 cards, draw the one that gets you closest to 21.
            pass
        case (
            7
        ):  # Saturn Major, next time you go over 21, loop back around from 1 and up.
            pass
        case 8:  # Uranus Major, randomize all cards both hands.
            pass
        case 9:  # Neptune Major, search cards until you find one that wont make you bust then draw.
            pass
        case 10:  # Pluto Major, triple down on any hand.
            pass
        case 11:  # Sun Minor, show next card.
            return deck[0]
        case 12:  # Moon Minor,
            pass
        case 13:  # Mercury Minor,
            pass
        case 14:  # Venus Minor,
            pass
        case 15:  # Earth Minor,
            pass
        case 16:  # Mars Minor,
            pass
        case 17:  # Jupiter Minor,
            pass
        case 18:  # Saturn Minor,
            pass
        case 19:  # Uranus Minor,
            pass
        case 20:  # Neptune Minor,
            pass
        case 21:  # Pluto Minor,
            pass
        case _:
            print("Incorrect power-up value")

