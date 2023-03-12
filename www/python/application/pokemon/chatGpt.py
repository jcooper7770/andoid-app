import random

# Define the pokemon class with attributes and strategy function
'''
class Pokemon:
    def __init__(self, name, health, fast_move_power, fast_move_energy_gain, charge_move1_power, charge_move1_energy, charge_move2_power, charge_move2_energy):
        self.name = name
        self.health = health
        self.fast_move_power = fast_move_power
        self.fast_move_energy_gain = fast_move_energy_gain
        self.charge_move1_power = charge_move1_power
        self.charge_move1_energy = charge_move1_energy
        self.charge_move2_power = charge_move2_power
        self.charge_move2_energy = charge_move2_energy
        self.energy = 0  
'''
class ChargeMove:
    def __init__(self, name, damage, energy_cost):
        self.name = name
        self.damage = damage
        self.energy_cost = energy_cost
        
class FastMove:
    def __init__(self, name, damage, energy_gain):
        self.name = name
        self.damage = damage
        self.energy_gain = energy_gain

'''
class Pokemon:
    def __init__(self, name, type1, type2, fast_move, charge_moves, max_hp, attack, defense):
        self.name = name
        self.type1 = type1
        self.type2 = type2
        self.fast_move = fast_move
        self.charge_moves = charge_moves
        self.max_hp = max_hp
        self.hp = max_hp
        self.attack = attack
        self.defense = defense
        self.energy = 0
    
    def is_alive(self):
        return self.hp > 0
        
    def take_damage(self, damage):
        self.hp -= damage
        if self.hp < 0:
            self.hp = 0
'''

class Pokemon:
    def __init__(self, name, type_, max_hp, fast_move, charge_moves):
        self.name = name
        self.type_ = type_
        self.max_hp = max_hp
        self.hp = max_hp
        self.fast_move = fast_move
        self.charge_moves = charge_moves
        self.energy = 0

    def is_alive(self):
        return self.hp > 0
    
    def take_damage(self, damage):
        self.hp = max(0, self.hp - damage)

    def attack(self, opponent):
        self.energy += self.fast_move.energy_gain
        opponent.take_damage(self.fast_move.damage)
        if self.energy >= self.charge_moves[1].energy_cost:
            attack = random.choice([0, 1])
        elif self.energy >= self.charge_moves[0].energy_cost:
            attack = 0
        else:
            return
        opponent.take_damage(self.charge_moves[attack].damage)
        self.energy -= self.charge_moves[attack].energy_cost

# Define a strategy function that always chooses the nuke move
def always_nuke(pokemon, opponent):
    return 'nuke'

# Define a strategy function that alternates between the bait and nuke moves
def alternate_bait_nuke(pokemon, opponent):
    if hasattr(pokemon, 'last_move'):
        if pokemon.last_move == 'bait':
            pokemon.last_move = 'nuke'
            return 'nuke'
        else:
            pokemon.last_move = 'bait'
            return 'bait'
    else:
        pokemon.last_move = 'bait'
        return 'bait'

# Define a dict that maps each type to a list of types it is strong against
type_advantages = {
    'fire': ['grass', 'ice', 'bug', 'steel'],
    'water': ['fire', 'ground', 'rock'],
    'grass': ['water', 'ground', 'rock'],
    'electric': ['water', 'flying'],
    'normal': [],
    'flying': [],
    'ice': ['grass', 'ground', 'dragon', 'flying'],
    'psychic': ['fighting', 'poison'],
    'ground': ['fire', 'electric', 'poison', 'rock', 'steel'],
    'rock': ['fire', 'ice', 'flying', 'bug'],
    'fighting': ['normal', 'ice', 'rock', 'dark', 'steel'],
    'poison': ['grass', 'fairy'],
    'bug': ['grass', 'psychic', 'dark'],
    'dragon': ['dragon'],
    'ghost': ['psychic', 'ghost'],
    'dark': ['psychic', 'ghost'],
    'steel': ['ice', 'rock', 'fairy'],
    'fairy': ['fighting', 'dragon', 'dark']
}

# Define a battle function for two pokemon
def battle_function(pokemon1, pokemon2):
    while pokemon1.is_alive() and pokemon2.is_alive():
        # Check if Pokemon 1 has enough energy for the larger energy charge move
        if pokemon1.energy >= max(pokemon1.charge_moves[0].energy_cost, pokemon1.charge_moves[1].energy_cost):
            # If both Pokemon have enough energy, choose randomly
            if random.random() < 0.5:
                # Use the lower energy charge move
                pokemon2.take_damage(pokemon1.charge_moves[1].damage)
                pokemon1.energy -= pokemon1.charge_moves[1].energy_cost
            else:
                # Use the higher energy charge move
                pokemon2.take_damage(pokemon1.charge_moves[0].damage)
                pokemon1.energy -= pokemon1.charge_moves[0].energy_cost
        # If Pokemon 1 does not have enough energy, use fast move
        else:
            pokemon2.take_damage(pokemon1.fast_move.damage)
            pokemon1.energy += pokemon1.fast_move.energy_gain

        # Check if Pokemon 2 has enough energy for the larger energy charge move
        if pokemon2.energy >= max(pokemon2.charge_moves[0].energy_cost, pokemon2.charge_moves[1].energy_cost):
            # If both Pokemon have enough energy, choose randomly
            if random.random() < 0.5:
                # Use the lower energy charge move
                pokemon1.take_damage(pokemon2.charge_moves[1].damage)
                pokemon2.energy -= pokemon2.charge_moves[1].energy_cost
            else:
                # Use the higher energy charge move
                pokemon1.take_damage(pokemon2.charge_moves[0].damage)
                pokemon2.energy -= pokemon2.charge_moves[0].energy_cost
        # If Pokemon 2 does not have enough energy, use fast move
        else:
            pokemon1.take_damage(pokemon2.fast_move.damage)
            pokemon2.energy += pokemon2.fast_move.energy_gain

    # Return the winning Pokemon
    if pokemon1.is_alive():
        return pokemon1
    else:
        return pokemon2
'''
def battle_function(pokemon1, pokemon2):
    pokemon1_health = pokemon1.health
    pokemon2_health = pokemon2.health
    
    while pokemon1_health > 0 and pokemon2_health > 0:
        # Pokemon 1's turn
        fast_move_dmg = pokemon1.fast_move_power
        pokemon2_health -= fast_move_dmg
        pokemon1.energy += pokemon1.fast_move_energy_gain
        
        # Check if pokemon1 has enough energy for either charge move
        if pokemon1.energy >= pokemon1.charge_move1_energy:
            charge_move_dmg = pokemon1.charge_move1_power
            pokemon2_health -= charge_move_dmg
            pokemon1.energy -= pokemon1.charge_move1_energy
        elif pokemon1.energy >= pokemon1.charge_move2_energy:
            charge_move_dmg = pokemon1.charge_move2_power
            pokemon2_health -= charge_move_dmg
            pokemon1.energy -= pokemon1.charge_move2_energy
        
        # Check if pokemon2 has fainted
        if pokemon2_health <= 0:
            break
        
        # Pokemon 2's turn
        fast_move_dmg = pokemon2.fast_move_power
        pokemon1_health -= fast_move_dmg
        pokemon2.energy += pokemon2.fast_move_energy_gain
        
        # Check if pokemon2 has enough energy for either charge move
        if pokemon2.energy >= pokemon2.charge_move1_energy:
            charge_move_dmg = pokemon2.charge_move1_power
            pokemon1_health -= charge_move_dmg
            pokemon2.energy -= pokemon2.charge_move1_energy
        elif pokemon2.energy >= pokemon2.charge_move2_energy:
            charge_move_dmg = pokemon2.charge_move2_power
            pokemon1_health -= charge_move_dmg
            pokemon2.energy -= pokemon2.charge_move2_energy
    
    # Return the winner
    if pokemon1_health <= 0:
        return pokemon2
    else:
        return pokemon1
'''
'''
def battle_function(pokemon1, pokemon2):
    while True:
        # Pokemon 1 attacks first
        choice = pokemon1.strategy_function(pokemon1, pokemon2)
        if choice == 'bait':
            damage = pokemon1.bait_attack
        elif choice == 'nuke':
            damage = pokemon1.nuke_attack
        
        # Apply type advantages
        if pokemon2.type in type_advantages[pokemon1.type]:
            damage *= 1.5
        
        pokemon2.health -= damage
        
        if pokemon2.health <= 0:
            return True
        
        # Pokemon 2 attacks second
        choice = pokemon2.strategy_function(pokemon2, pokemon1)
        if choice == 'bait':
            damage = pokemon2.bait_attack
        elif choice == 'nuke':
            damage = pokemon2.nuke_attack

        # Apply type advantages
        if pokemon1.type in type_advantages[pokemon2.type]:
            damage *= 1.5
        
        pokemon1.health -= damage
        
        if pokemon1.health <= 0:
            return False
''' 
def select_best_pokemon(teams, pokemon_options):
    best_pokemon = None
    best_pokemon_win_ratio = 0
    for pokemon in pokemon_options:
        total_wins = 0
        total_battles = 0
        
        for team in teams:
            for opposing_pokemon in team:
                result = battle_function(pokemon, opposing_pokemon)
                if result:
                    total_wins += 1
                total_battles += 1
        
        win_ratio = total_wins / total_battles
        if win_ratio > best_pokemon_win_ratio:
            best_pokemon = pokemon
            best_pokemon_win_ratio = win_ratio

    return best_pokemon

'''
teams = [[Pokemon("Pikachu", 100, 10, 2, 30, 50, 40, 100),
          Pokemon("Charmander", 120, 8, 3, 25, 40, 35, 90),
          Pokemon("Squirtle", 110, 9, 2, 20, 30, 25, 80),
          Pokemon("Jigglypuff", 90, 11, 1, 25, 45, 35, 95),
          Pokemon("Meowth", 95, 9, 2, 20, 35, 30, 85),
          Pokemon("Psyduck", 100, 8, 3, 15, 30, 25, 75)
         ],
         [Pokemon("Bulbasaur", 130, 7, 4, 20, 40, 30, 70),
          Pokemon("Chikorita", 140, 6, 5, 15, 30, 20, 60),
          Pokemon("Cyndaquil", 150, 5, 6, 10, 20, 10, 50),
          Pokemon("Totodile", 140, 6, 5, 15, 35, 25, 65),
          Pokemon("Bayleef", 130, 7, 4, 20, 40, 30, 70),
          Pokemon("Noctowl", 145, 5, 6, 10, 25, 15, 55)
         ]
        ]
options = [Pokemon("Bulbasaur", 130, 7, 4, 20, 40, 30, 70),
        Pokemon("Chikorita", 140, 6, 5, 15, 30, 20, 60),
        Pokemon("Cyndaquil", 150, 5, 6, 10, 20, 10, 50),
        Pokemon("Totodile", 140, 6, 5, 15, 35, 25, 65),
        Pokemon("Bayleef", 130, 7, 4, 20, 40, 30, 70),
        Pokemon("Noctowl", 145, 5, 6, 10, 25, 15, 55)
        ]
'''
pikachu = Pokemon("Pikachu", "Electric", 50, FastMove("Quick Attack", 10, 10), [ChargeMove("Thunderbolt", 20, 100), ChargeMove("Thunder", 30, 150)])

bulbasaur = Pokemon("Bulbasaur", "Grass", 60, FastMove("Tackle", 5, 10), [ChargeMove("Vine Whip", 20, 100), ChargeMove("Razor Leaf", 25, 120)])

charmander = Pokemon("Charmander", "Fire", 55, FastMove("Scratch", 10, 10), [ChargeMove("Ember", 15, 100), ChargeMove("Flamethrower", 25, 120)])

squirtle = Pokemon("Squirtle", "Water", 65, FastMove("Bubble", 5, 10), [ChargeMove("Water Gun", 20, 100), ChargeMove("Hydro Pump", 30, 150)])

winner = battle_function(pikachu, charmander)
print(winner.name)

teams = [
    [pikachu, bulbasaur],
    [charmander, bulbasaur],
    [squirtle, charmander]
]
options = [pikachu, bulbasaur, charmander, squirtle]

best_pokemon = select_best_pokemon(teams, options)
print(best_pokemon.name)


def parse_moves(fast_move_dict, charge_move_dict):
    fast_moves = {}
    for move in fast_move_dict:
        fast_moves[move["moveId"]] = FastMove(move["moveId"], move["power"], move["energyGain"])

    charge_moves = {}
    for move in charge_move_dict:
        charge_moves[move["moveId"]] = ChargeMove(move["moveId"], move["energy"], move["power"])

    return fast_moves, charge_moves

fast_moves = [{"moveId": "move id 1", "power": 6, "energyGain": 5},
              {"moveId": "move id 2", "power": 5, "energyGain": 7}]
charge_moves = [{"moveId": "move id 1", "power": 5, "energy": 50},
                {"moveId": "move id 2", "power": 8, "energy": 70}]

fast_moves_dict, charge_moves_dict = parse_moves(fast_moves, charge_moves)

if __name__ == '__main__':
    from application.pokemon.move_counts import get_game_master

    game_master = get_game_master()
    moves = game_master.get("moves", [])

    fast_moves, charge_moves = [], []
    for move in moves:
        print(move)
        # charge move
        if move.get('energyGain', 0) == 0:
            charge_moves.append(move)
        else:
            fast_moves.append(move)
    
    f, c = parse_moves(fast_moves, charge_moves)
    print(f,c)
