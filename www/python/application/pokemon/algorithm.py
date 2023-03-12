"""
  Algorithm checker by making histograms of leads and opponent teams

  TODO:
    - Make a visualization based on the data for typings

  $ python -m application.pokemon.algorithm
"""

import os
from collections import defaultdict
import json

from matplotlib import pyplot as plt

from cv2 import IMWRITE_JPEG2000_COMPRESSION_X1000
from application.pokemon.move_counts import get_game_master
from application.utils.database import create_engine


def get_data(league):
    """
    Get reported league data
    """
    engine = create_engine()
    query_results = engine.execute(f'SELECT * from `pokemon_data` WHERE pokemon_data.league="{league}";')
    results = [result for result in query_results]
    return json.loads(json.loads(results[0][1]))


def get_pokemon_datas(game_master):
    """
    Return data for each pokemon
    """
    data ={}
    for pokemon in game_master.get('pokemon'):
        data[pokemon['speciesId']] = pokemon
    return data


def make_histogram(league_data, game_master):
    """
    Make a histogram based on leads

    {
        lead1: {
            lead: {
                opp_lead1: 1,
                opp_lead2: 3,...
            },
            back: {
                opp_back: 1, ...
            }
        }
    }
    """
    pokemon_data = get_pokemon_datas(game_master)
    results = defaultdict(dict)
    typing_results = defaultdict(dict)
    for record in league_data.get('records', []):
        team = record['team'].split('/')
        first = team[0].split(':')[0]
        opp_team = record['oppo_team'].split('/')
        opp_lead = opp_team[0].split(':')[0]
        opp_back1 = opp_team[1].split(':')[0]
        opp_back2 = opp_team[2].split(':')[0]

        if first not in results:
            results[first] = {'lead': defaultdict(int), 'back': defaultdict(int)}

        results[first]['lead'][opp_lead] += 1
        results[first]['back'][opp_back1] += 1
        results[first]['back'][opp_back2] += 1

        # Typing here
        first_types = pokemon_data.get(first, {}).get('types', [])
        for pokemon_type in first_types:
            if pokemon_type =="none":
                continue
            if pokemon_type not in typing_results:
                typing_results[pokemon_type] = {'lead': defaultdict(int), 'back': defaultdict(int)}
        
            opp_lead_types = pokemon_data.get(opp_lead, {}).get('types', [])
            opp_back1_types = pokemon_data.get(opp_back1, {}).get('types', [])
            opp_back2_types = pokemon_data.get(opp_back2, {}).get('types', [])
            for opp_type in opp_lead_types:
                if opp_type == 'none':
                    continue
                typing_results[pokemon_type]['lead'][opp_type] += 1
            for back_type in opp_back1_types+opp_back2_types:
                if back_type == 'none':
                    continue
                typing_results[pokemon_type]['back'][back_type] += 1

    return results, typing_results


def pretty_print(results):
    """
    Pretty print the results
    """
    for lead, result in sorted(results.items(), key=lambda x: x[0]):
        lead_data = sorted(result['lead'].items(), key=lambda x: x[1], reverse=True)
        back_data = sorted(result['back'].items(), key=lambda x: x[1], reverse=True)

        print(f"{lead}: ")
        '''
        print("  Leads:")
        for opp_lead, count in sorted(result['lead'].items(), key=lambda x: x[1], reverse=True):
            print(f"\t{opp_lead}: {count}")
        print("  Backs:")
        for opp_back, count in sorted(result['back'].items(), key=lambda x: x[1], reverse=True):
            print(f"\t{opp_back}: {count}")
        '''
        print(f"  {'Leads:':17}\tBacks:")
        for num in range(min(len(lead_data), len(back_data))):
            lead_mon, lead_count = lead_data[num]
            back_mon, back_count = back_data[num]
            lead_text = f"{lead_mon}: {lead_count}"
            back_text = f"{back_mon}: {back_count}"
            #print(f"    {lead_mon}: {lead_count}\t{back_mon}: {back_count}")
            print(f"    {lead_text:12}\t{back_text:20}")

def plot_algo_data(typing_results):
    """
    Plot results
    """
    width = 0.2
    spacing = 0.6
    if not os.path.exists("algo_plots"):
        os.mkdir("algo_plots")
    for p_type in typing_results.keys():
        # Plot the lead pokemon
        leads = sorted(typing_results[p_type]['lead'].items(), key=lambda x: x[1], reverse=True)
        lead_keys = [l[0] for l in leads]
        lead_values = [l[1] for l in leads]
        norm_lead_values = [float(l)/max(lead_values) for l in lead_values]
        key_positions = {key:i*spacing+width/2 for i, key in enumerate(lead_keys)}
        lead_positions = [i*spacing for i in range(len(leads))]
        plt.bar(lead_positions, norm_lead_values, width=width, label="lead", color="blue")

        # Plot the back pokemon
        backs = sorted(typing_results[p_type]['back'].items(), key=lambda x: x[0])
        back_keys = [l[0] for l in backs]
        #  align back graphs with lead ones
        back_key_pos = []
        for key in back_keys:
            back_key_pos.append(key_positions.get(key, -1) + width/2)

        back_values = [l[1] for l in backs]
        norm_back_values = [float(l)/max(back_values) for l in back_values]
        back_positions = [i*spacing+width for i in range(len(backs))]
        plt.bar(back_key_pos, norm_back_values, width=width, label='back', color='red')

        # Tick values
        tick_positions = [i*spacing+width/2 for i in range(len(leads))]
        plt.xticks(tick_positions, lead_keys)
        plt.legend()
        plt.title(f"Leads against {p_type}")
        plt.xticks(rotation=90)
        plt.tight_layout()
        plt.savefig(f"algo_plots/{p_type}_algo.jpg")
        plt.clf()


if __name__ == '__main__':
    mlpc_data = get_data("MLPC")
    ml_data = get_data("ML")
    gl_data = get_data("GL")
    ul_data = get_data("UL")

    data = {
        'records': mlpc_data['records'] + ml_data['records'] + gl_data['records'] + ul_data['records']
    }
    game_master = get_game_master()
    results, typing_results = make_histogram(data, game_master)
    #print(results)
    #pretty_print(results)
    pretty_print(typing_results)
    plot_algo_data(typing_results)