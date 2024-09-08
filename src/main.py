from players import HumanPlayer, AIPlayer
from game import play_game

def main():
    print("Welcome to the Chess Game!")
    print("1. Human vs Human")
    print("2. Human vs AI")
    print("3. AI vs AI")
    
    choice = input("Please select a game mode (1-3): ")
    
    if choice == "1":
        white_player = HumanPlayer("white")
        black_player = HumanPlayer("black")
    elif choice == "2":
        white_player = HumanPlayer("white")
        black_player = AIPlayer("black")
    elif choice == "3":
        white_player = AIPlayer("white")
        black_player = AIPlayer("black")
    else:
        print("Invalid choice. Defaulting to Human vs AI.")
        white_player = HumanPlayer("white")
        black_player = AIPlayer("black")
    
    play_game(white_player, black_player)

if __name__ == "__main__":
    main()