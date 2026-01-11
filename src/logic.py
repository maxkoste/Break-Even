from collections import deque
import random

chips = 250
debt = 10000
deck_id = None  # Not needed?
deck = None
hands = [[], []]
scores = [0, 0]
powerups = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10]
powerup_info = []
game_started = False
celestial_data = None
player_sign= None
active_hand_index = 1
saturn_active = False

VALUE_MAP = {
    "ACE": 11,
    "JACK": 10,
    "QUEEN": 10,
    "KING": 10,
}

#int corresponds to the case in the method use_powerup()
BODY_POWERUPS = {
    "Moon": 0,
    "Sun": 1,
    "Mercury": 2,
    "Venus": 3,
    "Earth": 4,
    "Mars": 5,
    "Jupiter": 6,
    "Saturn": 7,
    "Uranus": 8,
    "Neptune": 9,
    "Pluto": 10
}

def populate_deck(cards):  # Take data from the API call and place the cards inside the deck.
    """Initializes the deck with cards fetched from the API."""
    global deck
    deck = deque(cards)

def deck_ready():
    """
    Checks if the deck has any cards remaining.

    Returns:
        bool: True if there are cards left in the deck, False otherwise.
    """
    return bool(deck)

def start_game():
    """
    Starts a new round by dealing two cards to each player.

    Returns:
        dict: The initial game state.
    """
    global game_started
    game_started = True

    draw_card(0)
    draw_card(0)
    draw_card(1)
    draw_card(1)

    return game_state()


def draw_card(hand_index):
    """
    Draws a card from the deck and adds it to the specified hand.

    Updates the hand's score and returns whether the hand is bust.

    Args:
        hand_index (int): Index of the hans (0 = dealer, 1 = player).

    Returns:
        bool: True if the hand's score exceeds 21, otherwise False.
    """
    global hands, scores, deck

    if hand_index == 0:
        while deck[0][0] == "JOKER":
            deck.rotate(1)

    card = deck.popleft()
    hands[hand_index].append(card)

    if card[0] == "JOKER" and hand_index != 0:
        powerups.append(random.choice(range(0, 4)))

    recalculate_score(hand_index)

    return scores[hand_index] > 21


def recalculate_score(hand_index):
    """
    Recalculates the total score for a hand according to Blackjack rules.

    Handles ace values (11 or 1) and ignores non-card entries such as bets.

    Args:
        hand_index (int): Index of the hans (0 = dealer, 1 = player).
    """
    global saturn_active
    score = 0
    aces = 0

    for card in hands[hand_index]:
        # 🔹 Hoppa över bets
        if isinstance(card, tuple) and card[1] == "BET":
            continue

        value, suit = card

        if value == "ACE":
            score += 11
            aces += 1
        elif value in VALUE_MAP:
            score += VALUE_MAP[value]
        elif value != "JOKER":
            score += int(value)

    while score > 21 and aces > 0:
        score -= 10
        aces -= 1

    scores[hand_index] = score

    if scores[hand_index] > 21 and saturn_active:
        scores[hand_index] = (scores[hand_index] - 1) % 21 + 1
        saturn_active = False


def set_celestial_data(data):
    """
    Processes celestial data and assigns power-ups based on the player's zodiac sign.

    Args:
        data (dict): Mapping of celestial bodies to constellation names.
    """
    global celestial_data
    celestial_data = data

    celestial_data = {
        body: sign.strip().lower()
        for body, sign in data.items()
        if isinstance(sign, str)
    }

    matched = False

    for body, sign in celestial_data.items():
        if sign == player_sign and body in BODY_POWERUPS:
            powerup_id = BODY_POWERUPS.get(body)
            print(f"Match found: body={body}, sign={sign}, powerup={powerup_id}")
            assign_powerups(BODY_POWERUPS[body])
            matched = True

    if not matched:
        print(f"No power up match found for player sign: {player_sign}")


def set_player_sign(sign):
    """
    Stores the player's selected zodiac sign.

    Args:
        sign (dict): JSON data containing the selected zodiac sign.
    """
    global player_sign
    selected_sign = sign["selectedSign"].strip().lower()
    player_sign = selected_sign

def get_score(card_value):
    """
    Returns the Blackjack point value of a card.

    Args:
        card_value (str): The value of the card (e.g. "ACE", "KING", "7").

    Returns:
        int: The numerical score associated with the card.
    """
    if card_value in VALUE_MAP:
        return VALUE_MAP[card_value]
    return int(card_value)


def bet(amount, hand_index=1):
    """
    Places a bet on the specified hand and deducts chips from the player.

    Args:
        amount (int): The amount of chips to bet.
        hand_index(int, optional): Index of the hand to place the bet on.
            Defaults to 1 (player hand).

    Returns:
        str: A message indicating the result of the bet.
    """
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
    """
    Resets the game state to its initial values.

    Restores chips, clears hands and scores, resets powerups,
    and marks the game as not started
    """
    global chips, hands, scores, game_started, powerups, active_hand_index, debt
    chips = 250
    debt = 10000
    hands = [[], []]
    scores = [0, 0]
    powerups = []
    powerup_info = []
    game_started = False
    active_hand_index = 1

def split(allow_any_split=False):
    """
    Attempts to split the current player hand into two hands.

    Normal split:
    - Exactly 2 cards
    - Matching values
    - Costs chips equal to bet

    Earth split (allow_any_split=True):
    - Any hand length >= 2
    - No value check
    - Free bet on new hand
    """
    global hands, chips, scores, active_hand_index

    if active_hand_index >= len(hands):
        return "Invalid hand index for split."

    current_hand = hands[active_hand_index]

    # Extract cards (ignore BET)
    actual_cards = [
        card for card in current_hand
        if isinstance(card, tuple) and card[1] != "BET"
    ]

    if not allow_any_split and len(actual_cards) != 2:
        return "You need exactly 2 cards to split."

    if len(actual_cards) < 2:
        return "Not enough cards to split."

    if not allow_any_split:
        card1_val = get_score(actual_cards[0][0])
        card2_val = get_score(actual_cards[1][0])

        if card1_val != card2_val:
            return f"Values do not match: {actual_cards[0][0]} vs {actual_cards[1][0]}"

    original_bet = next(
        card[0] for card in current_hand
        if isinstance(card, tuple) and card[1] == "BET"
    )

    if not allow_any_split:
        if chips < original_bet:
            return "Not enough chips to split."
        chips -= original_bet

    card_to_move = actual_cards[-1]  # last card
    current_hand.remove(card_to_move)

    new_hand_index = len(hands)

    new_hand = [
        (original_bet, "BET"),
        card_to_move
    ]

    hands.append(new_hand)

    scores.append(get_score(card_to_move[0]))

    remaining_cards = [
        c for c in current_hand
        if isinstance(c, tuple) and c[1] != "BET"
    ]
    scores[active_hand_index] = sum(get_score(c[0]) for c in remaining_cards)

    #draw_card(active_hand_index)
    #draw_card(new_hand_index)

    return "Split successful."

def stand():
    """
    Ends the current player's turn. 

    Moves to the next hand if the player has split hands, otherwise lets the dealer play.

    Returns:
        dict: Updated game state after the player's or dealer's turn.
    """
    global active_hand_index
    # Move to the next hand if there are more split hands
    if active_hand_index < len(hands) - 1:
        active_hand_index += 1
        # Returning game_state tells the frontend Player 2 is now active
        return game_state()
    else:
        # If no more hands, dealer takes their turn
        dealer_turn()
        return game_state(winner=game_over(), game_over=True)


def double_down(bet_amount, hand_index=0):
    """
    Doubles the bet for a hand and draws exactly one card.

    Args:
        bet_amount (int): The additional amount to bet.
        hand_index (int, optional): The index of the hand to double down. Defaults to 0.

    Returns:
        str: Result message or error if not enough chips.
    """
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


def dealer_turn():
    """
    Plays the dealer's turn automatically according to Blackjack rules.

    The delaer draws until the score reaches at least 17.
    """
    while scores[0] < 17:
        draw_card(0)


def game_over():
    """
    Determines the outcome of the current round and updates chips accordingly.

    Compares player and dealer scores:
    - If one hand is over 21, the other wins.
    - Otherwise, the highest score wins.
    - Ties return the bet to the player.

    Returns:
        str: A message indicating the winner, or "GAME_OVER" if the player has no chips left.
    """
    global chips, debt
    dealer_score = scores[0]
    total_reward = 0

    for i in range(1, len(hands)):
        hand = hands[i]
        player_score = scores[i]

        # Find bet for this hand
        bet_amount = next(
            (card[0] for card in hand if isinstance(card, tuple) and card[1] == "BET"),
            0
        )
        chips_before_bet = chips + bet_amount

        if dealer_score > 21:
            total_reward += bet_amount * 2
            winner = "Player wins! Dealer busted"
        elif player_score > 21:
            winner = "Dealer wins! Player busted"
        elif player_score > dealer_score:
            total_reward += bet_amount * 2
            winner = "Player wins!"
        elif dealer_score > player_score:
            winner = "Dealer wins!"
        else:
            total_reward += bet_amount
            winner = "It's a tie!"
        
        chips += total_reward
        chips_change = chips - chips_before_bet
        debt -= chips_change

        # Om spelaren har 0 chips efter detta, signalera GAME_OVER
    if chips <= 0:
        return "GAME_OVER"
    
    return winner


def game_state(winner=None, game_over=False):
    """
    Returns the current state of the game as a dictionary.

    Args:
        winner (str, optional): The winner message for the round. Defaults to None.
        game_over (bool, optional): Indicates if the game has ended. Defaults to False.

    Returns:
        dict: A dictionary containging player and dealer hands, scores, chips, powerups,
        game status and the winner if available.
    """
    player_hand_slice = hands[1:]
    # UI works with player hand indices starting at 0, while dealer is stored at index 0
    active_player_index = max(active_hand_index - 1, 0)

    return {
        "player": hands[1],
        "player_hands": player_hand_slice,
        "player_scores": [scores[i] for i in range(1, len(scores))],
        "active_hand_index": active_player_index,
        "dealer": hands[0],
        "player_score": scores[1],
        "dealer_score": scores[0],
        "chips": chips,
        "debt": debt,
        "powerups": powerups,
        "powerup_info": powerup_info,
        "player_sign" : player_sign,
        "game_started": game_started,
        "game_over": game_over,
        "winner": winner,
    }


def next_turn(winner):  
    """
    Prepares for the next round by resetting hands and scores.

    Args:
        winner (str): The winner of the previous round (unused in this function.)
    """
    global hands, scores, active_hand_index

    hands = [[], []]
    scores = [0, 0]
    active_hand_index = 1


def assign_powerups(powerup_id):  # Read celestial data and assign correct powerups
    """
    Assigns a power-up to the player by adding it to the powerups list.

    Args:
        powerup_id (int): The ID of the power-up to assign.
    """
    print("assigning powerup", powerup_id)
    powerups.append(powerup_id)


def rotate_deck(index):
    """
    Rotates deck to a specific position.

    Rotates the deck so that the card at the specified index is drawn next.

    Args:
        index (int): The position in the deck.
    """
    deck.rotate(-index)


def use_powerup(powerup_index):  # 0-10 Major, 10-21 Minor
    """
    Applies a selected power-up to the current game state.

    The effect depends on the power-up index:
    - 0-10: Major power-ups
    - 11-21: Minor power-ups

    Some power-ups may return values such as cards or counts
    depending on their effect.

    Args:
        powerup_index (int): The index of the power-up to use.

    Returns:
        Optional[any]: Some power-ups return additional info
        (e.g., a card or count), others return None.
    """
    global powerup_info, scores, chips
    powerups.remove(powerup_index)

    match powerup_index:
        case 0:  # Sun Major, show hidden dealer card.
            powerup_info = hands[0][0]
            return game_state()
        case 1:  # Moon Major, look at the next card, draw it or the one after.
            powerup_info = deck[0]
            return game_state()
         # Helper method called after user picks, use deck.rotate
        case 2:  # Mercury Major,
            scores = [0, 0]
            winner = game_over()
            next_turn(winner)
            return game_state(winner, game_over=True)
            # resets turn
        case 3:  # Venus Major
            hand = hands[active_hand_index]
            heart_count = sum(1 for value, suit in hand if isinstance(value, str) and suit == "HEARTS")
            current_bet, _ = next(card for card in hand if card[1] == "BET")
            new_bet = int(current_bet * (1.5 ** heart_count))
            for i, card in enumerate(hand):
                if card[1] == "BET":
                    hand[i] = (new_bet, "BET")
                break
            return game_state()
        case 4:  # Earth Major, split any hand
            split(allow_any_split=True)
            return game_state()
        case 5:  # Mars Major, destroy dealers card
            powerup_info = f"Dealers {hands[0][1]} has been obliterated!!!"
            card_value, suit = hands[0][1]
            scores[0] -= get_score(card_value)
            del hands[0][1]
            return game_state()
        case 6:  # Jupiter Major, examine next 7 cards, pick the one that brings active hand closest to 21
            checked_cards = []
            best_card_index = 0
            best_score = 0

            current_score = scores[active_hand_index]
            limit = min(7, len(deck))

            for i in range(limit):
                card = deck[i]
                # Account for ACE as both 11 and 1
                potential_scores = []
                if card[0] == "ACE":
                    potential_scores = [current_score + 11, current_score + 1]
                elif card[0] in VALUE_MAP:
                    potential_scores = [current_score + VALUE_MAP[card[0]]]
                else:
                    potential_scores = [current_score + get_score(card[0]) for card in next_seven_cards if card[0] != "JOKER"]

                for s in potential_scores:
                    if s <= 21 and s > best_score:
                        best_score = s
                        best_card_index = i

                checked_cards.append(card)

            rotate_deck(best_card_index)
            powerup_info = checked_cards
            return game_state()

        case 7:  # Saturn Major, next time you go over 21, loop back around from 1 and up.
            global saturn_active
            saturn_active = True
            return game_state()

        case 8:  # Uranus Major, randomize all cards both hands.
            player_hand = hands[active_hand_index]
            dealer_hand = hands[0]

            player_bets = [card for card in player_hand if isinstance(card, tuple) and card[1] == "BET"]
            player_cards = [card for card in player_hand if not (isinstance(card, tuple) and card[1] == "BET")]

            dealer_bets = [card for card in dealer_hand if isinstance(card, tuple) and card[1] == "BET"]
            dealer_cards = [card for card in dealer_hand if not (isinstance(card, tuple) and card[1] == "BET")]

            hands[active_hand_index] = player_bets + dealer_cards
            hands[0] = dealer_bets + player_cards

            recalculate_score(active_hand_index)
            recalculate_score(0)

            return game_state()
        case 9:  # Neptune Major, search cards until you find one that wont make you bust then draw.
            current_score = scores[active_hand_index]
            draw_index = 0
            for i, card in enumerate(deck):
                val = get_score(card[0])
                if current_score + val <= 21:
                    draw_index = i
                    break
            rotate_deck(draw_index)
            return game_state()
        case 10:  # Pluto Major, gain a joker.
            deck.appendleft(("JOKER", "BLACK"))
            return game_state()
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

