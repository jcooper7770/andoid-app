"""
Utilities for trampoline app

TODO:
  - [DONE] incorporate '...' (stop in middle of turn)
  - [DONE] incorporate '%' and '--' (stop in middle of turn)
  - [DONE] incorporate '#' (comments)
  - [DONE] add in 'X' for bail during turn
  - [DONE] Log in with different users so multiple people can use the logger
  - [DONE] Add in notes for a practice or a turn
  - [DONE] Add in double mini
  - [DONE] Update difficulty for double mini
  - [DONE] Add about page on shortcuts
  - [DONE] Save in a database instead of text files
  - [DONE] Add athlete compulsory and optional
  - Add in visualizations per day. Maybe make table headers into links to visualization page
    i.e /vis?date=20220326&user=bob[&event=dmt]
  - [DONE] Fix deleting data for db
  - [DONE] Fix using test database
  - Split up front/back skills for skill dropdowns
  - Split up uncommon skills or remove them for skill dropdowns
  - [DONE] export data
"""
 
import datetime
import json
import os
import random
import re

from collections import defaultdict
from typing import OrderedDict

from flask import session

from application.utils.database import get_user, get_users_and_turns, save_athlete,\
    delete_from_db, get_from_db, add_to_db
from application.utils.utils import NON_SKILLS

NUM_FLIPS = {
    1: 0,
    2: 1,
    3: 2,
    5: 3,
    6: 4
}

CURRENT_USER = "bob"
CURRENT_ATHLETE = None
EVENT = "trampoline"


COMMON_ROUTINES = defaultdict(str, {
    "twisting swingtime": "40o 41o 42/ 41< 40< 43/ 40/ 41/ 44/",
    "swingtime": "40o 41o 40< 41< 40/ 41/",
    "three halfouts": "801< 40/ 801o 40/ 803<"
})

SKILLS = [
    # Singles
    "40", "41", "42", "43", "44", "45",
    # Doubles
    "800", "801", "802", "803", "805",
    "811", "813", "815",
    "822", "823", "824", "825", "826",
    "831", "833", "835",
    # Triples
    "12000", "12001", "12003",
    "12101", "12103",
    "12200", "12222"
]

# TODO: Add common and uncommon skill separators
# TODO: Or split up front and back skills
ALL_SKILLS = {
    "singles": ["40", "41", "42", "43", "44", "45"],
    "doubles": [
        "800", "801", "802", "803", "805",
        "811", "813", "815",
        "821", "822", "823", "824", "825", "826",
        "831", "833", "835",
    ],
    "triples": [
        "12000", "12001", "12003",
        "12101", "12103",
        "12200", "12222"
    ],
    "user added": []
}

TUCK_POS = "o"
PIKE_POS = "<"
STRAIGHT_POS = "/"
POSITIONS = [
    TUCK_POS, PIKE_POS, STRAIGHT_POS
]

ENGINE = None
DB_TABLE = None
TABLE_NAME = "test_data"
TABLE_NAME = "test_data" if os.environ.get("FLASK_ENV", "prod") == "prod" else "test_db"
print(f"Using table: {TABLE_NAME}")

def set_table_name(table_name):
    global TABLE_NAME
    TABLE_NAME = table_name


class Athlete:
    """
    Information about athlete
    """
    def __init__(self, name, private=False, compulsory=[], optional=[], dm_prelims1=[], dm_prelims2=[], dm_finals1=[], dm_finals2=[], password="", expand_comments=False, is_coach=False, athletes=[], first_login=False, signup_date=None, messages=[]):
        self.name = name
        self.compulsory = compulsory
        self.optional = optional
        self.private = private
        self.dm_prelim1 = dm_prelims1
        self.dm_prelim2 = dm_prelims2
        self.dm_finals1 = dm_finals1
        self.dm_finals2 = dm_finals2
        self.password = password
        self.expand_comments = expand_comments
        self.is_coach = is_coach
        self.athletes = athletes
        self.first_login = first_login
        self.signup_date = signup_date or datetime.datetime.today()
        self.messages = messages

    def set_comp(self, skills):
        """
        Sets the athlete's compulsory
        """
        self.compulsory = skills
        self.save()

    def set_opt(self, skills):
        """
        Sets the athlete's optional
        """
        self.optional = skills
        self.save()

    def save(self):
        """
        Saves the athlete into the database
        """
        file_name = os.path.join("athletes", f'{self.name}.json')
        if not os.path.isdir("athletes"):
            os.mkdir("athletes")

        athlete_data = {
            'name': self.name,
            'compulsory': self.compulsory,
            'optional': self.optional,
            'private': self.private,
            'dm_prelim1': self.dm_prelim1,
            'dm_prelim2': self.dm_prelim2,
            'dm_finals1': self.dm_finals1,
            'dm_finals2': self.dm_finals2,
            'password': self.password,
            'expand_comments': self.expand_comments,
            'is_coach': self.is_coach,
            'athletes': self.athletes,
            'first_login': self.first_login,
            'signup_date': str(self.signup_date),
            'messages': self.messages
        }
        with open(file_name, 'w') as athlete_file:
            json.dump(athlete_data, athlete_file)
        
        # Save to DB
        save_athlete(self)
    
    def __str__(self):
        return str(self.__dict__)

    @classmethod
    def load(self, name):
        """
        Loads in an athlete
        """
        # First check if user exists
        try:
            user = get_user(name)
            signup_date = datetime.datetime.strptime(user.get('signup_date'), '%Y-%m-%d') if user.get('signup_date') else None
            athlete = Athlete(
                user['name'], user["private"], user['compulsory'], user['optional'],
                password=user['password'], expand_comments=user.get('expand_comments', False),
                is_coach=user["is_coach"], athletes=user["athletes"], first_login=user['first_login'],
                signup_date=signup_date, messages=user['messages']
            )
        except Exception as error:
            print(f"Error loading user '{name}' because: {error}")
            athlete = None

        if athlete:
            return athlete

        file_path = os.path.join("athletes", f'{name}.json')

        if not os.path.exists(file_path):
            return Athlete(name)

        with open(file_path) as athlete_file:
            athlete_data = json.load(athlete_file)
            athlete = Athlete(
                athlete_data['name'],
                athlete_data.get("private", False),
                athlete_data["compulsory"],
                athlete_data["optional"],
                password=athlete_data.get('password', ''),
                expand_comments=athlete_data.get('expand_comments', False)
            )
            return athlete
        

class Practice:
    """
    All turns/skills done in a practice
    """
    def __init__(self, practice_date, turns, event):
        """
        :type date: datetime.date
        :type turns: [Routine]
        """
        self.date = practice_date
        self.turns = turns
        self.event = event

    def save(self, replace=False):
        """
        Save the current practice

        :param replace: Whether or not to replace the entire practice
        :type replace: bool
        """
        # save to the db
        #user_data = get_from_db(user=CURRENT_USER)
        user = session.get('name')
        user_data = get_from_db(user=user)
        try:
            last_turn_num = max([data[0] for data in user_data if data[2].date() == self.date and data[4] == self.event])
        except Exception as error:
            print(f"error when picking turn number: {error}")
            last_turn_num = 0

        turns = {}
        for turn_num, turn in enumerate(self.turns):
            turns[last_turn_num + turn_num + 1] = turn.toJSON()
        
        #saving_turns = [turn.toJSON() for turn in self.turns]
        #add_to_db(turns, CURRENT_USER, self.event, self.date, table=TABLE_NAME)
        if replace:
            delete_from_db(self.date, user=session.get('name'), event=self.event)
        add_to_db(turns, user, self.event, self.date, table=TABLE_NAME)

        # save to the file
        #user_dir = os.path.join("practices", CURRENT_USER)
        current_day = {
            str(self.date): {
                'turns': []
            }
        }
        '''
        user_dir = os.path.join("practices", user)
        file_name = os.path.join(user_dir, f"{self.date.strftime('%Y%m%d')}_{self.event}.txt")
        if not os.path.isdir(user_dir):
            os.mkdir(user_dir)
    
        if os.path.exists(file_name):
            with open(file_name) as practice_file:
                current_day = json.load(practice_file)

        with open(file_name, 'w') as practice_file:
            current_day[str(self.date)]['turns'].extend([turn.toJSON() for turn in self.turns])
            json.dump(current_day, practice_file)

        '''
        # Save the athlete also
        #athlete = Athlete.load(CURRENT_USER)
        athlete = Athlete.load(user)
        athlete.save()
        return current_day

    @classmethod
    def load(self, practice_data, event):
        """
        Loads in a practice
        """
        date = list(practice_data.keys())[0]
        return Practice(
            datetime.datetime.strptime(date, '%Y-%m-%d').date(),
            [Routine([Skill(skill, event=event) for skill in routine], event=event) if (routine and routine[0][0]!="-") else Routine([], note=routine[0][1:] if routine else routine) for routine in practice_data[date]['turns']],
            event
        )

    def raw(self):
        """
        Returns the raw log
        """
        #raw_log = ""
        log_lines = []
        for turn in self.turns:
            raw_turn = ' '.join([skill.shorthand for skill in turn.skills])
            log_lines.append(raw_turn)
            #for skill in turn.skills:
            #    raw_log = f"{raw_log} {skill.shorthand}"
            if turn.note:
                #raw_log = f"{raw_log}\n# {turn.note}"
                log_lines.append(f"# {turn.note}")
            #raw_log = f"{raw_log}\n"
        return '\n'.join(log_lines).strip()

    @classmethod
    def load_from_db(self, user, date=None, skills=None):
        """
        Returns practices from the db
        """
        practices = {}
        turns = get_from_db(user=user, date=date, skills=skills)
        for turn in turns:
            practice_date = turn[2]
            if practice_date not in practices:
                practices[practice_date] = {}
            event = turn[4]
            if event not in practices[practice_date]:
                practices[practice_date][event] = {}

            # {'1': '801o', '2': ...}
            #practices[practice_date][event][turn[0]] = turn[1]

            # {'1': {'skills': '801o', 'note': 'dfsd'}, '2': ...}
            practices[practice_date][event][turn[0]] = {'skills': turn[1], 'note': turn[5]}

        return_vals = []
        for practice_date, event_data in practices.items():
            for event, turns in event_data.items():# turns = [{0: {'skills': '801o', 'note': 'dsfd'}}...]
                turns_list = [y[1] for y in sorted(turns.items(), key=lambda x: x[0])]
                # make routines for practice object
                routines = []
                for turn in turns_list:
                    skills = turn['skills']
                    note = turn['note']
                    #print(f"{practice_date} - skills: '{skills}' - note: '{note}'")
                    # not a note
                    if skills and skills[0]!="-":
                        routine = Routine([Skill(skill, event=event) for skill in skills.split()], event=event, note=note)
                        routines.append(routine)
                        continue
                    # notes
                    routine = Routine([], note=skills[1:] if skills else note)
                    routines.append(routine)
                
                # make practice object
                p = Practice(
                    practice_date,
                    routines,
                    event
                )
                return_vals.append(p)
        return return_vals

    @classmethod
    def delete(self, practice_date, event=None):
        """
        Deletes the practice from the given day
        """
        deleted = False
        #user_dir = os.path.join("practices", CURRENT_USER)
        user_dir = os.path.join("practices", session.get('name'))
        for _, _, practice_files in os.walk(user_dir):
            print(f"files: {practice_files}")
            for practice_file in practice_files:
                if practice_file.startswith(f"{practice_date.strftime('%Y%m%d')}"):
                    file_name = os.path.join(user_dir, practice_file)
                    os.remove(file_name)
                    deleted = True

        #delete_from_db(practice_date, user=CURRENT_USER, event=event)
        delete_from_db(practice_date, user=session.get('name'), event=event)
        return deleted
        

class Skill:
    """
    A skill converted from a string
    """
    flips_str = {1: 'singles', 2: 'doubles', 3: 'triples'}
    def __init__(self, string, event=EVENT):
        self.flips = 0
        self.twists = []
        self.pos = string[-1]
        self.shorthand = string
        self.event = event

        if string not in NON_SKILLS:
            self.flips = self.get_flips_from_skill(string)
            self.twists = [int(n)/2.0 for n in string[len(str(int(self.flips*4))):-1]]
            self.difficulty = get_skill_difficulty(self) if event != "dmt" else get_dmt_difficulty(self)
        else:
            self.flips, self.twists, self.difficulty = (0, [0], 0)
        
        current_skills = ALL_SKILLS.get(self.flips_str.get(self.flips, -1), None)
        # Add to ALL_SKILLS if matches criteria:
        #   - at least one flip
        #   - proper format of a skill (i.e. 40/ not 4/)
        #   - not already in the list of skills
        if self.flips and self.shorthand[:-1] not in ALL_SKILLS['user added'] and (not current_skills or self.shorthand[:-1] not in current_skills):
            #ALL_SKILLS['user added'] = []
            if self.validate_skill():
                ALL_SKILLS['user added'].append(self.shorthand[:-1])
                ALL_SKILLS['user added'] = sorted(ALL_SKILLS['user added'], key=lambda x: (self.get_flips_from_skill(f"{x} "), self.get_twists_from_skill(f"{x} ")))

    def validate_skill(self):
        """
        Validate the skill is written properly
            by checking the the number of characters is correct
            i.e. '4/' should be '40/'
        """
        num_chars = round(self.flips) + len(str(int(self.flips*4)))
        if len(self.shorthand) < num_chars + 1:
            return False
        return True


    @staticmethod
    def get_flips_from_skill(skill):
        """
        Returns the number of flips in the skill
        """
        flips = float(skill[:-(NUM_FLIPS[len(skill[:-1])]+1)])/4.0
        return flips

    @staticmethod
    def get_twists_from_skill(skill, flips=None):
        """
        Returns the total number of twists in a skill
        """
        flips = flips or float(skill[:-(NUM_FLIPS[len(skill[:-1])]+1)])/4.0
        twists = [int(n)/2.0 for n in skill[len(str(int(flips*4))):-1]]
        return sum(twists)

    def __str__(self):
        return f"{self.shorthand} - {self.flips} flips - {self.twists} twists - {self.pos} position ({self.difficulty:0.1f})"

    def __repr__(self):
        return str(self)


class Routine():
    """
    Routine
    """
    def __init__(self, skills, event=EVENT, note=None):
        self.skills = skills
        self.event = event
        self.note = note
        self.total_flips = sum([skill.flips for skill in self.skills])
        self.total_twists = sum([sum(skill.twists) for skill in self.skills])
        self.difficulty = sum([skill.difficulty for skill in self.skills])

    def __str__(self):
        return f'{self.total_flips} flips - {self.total_twists} twists ({self.difficulty:0.1f})'

    def __repr__(self):
        return str(self)

    def toJSON(self):
        return {
            "skills": [skill.shorthand for skill in self.skills],
            "note": self.note or ""
        }
        '''
        if self.skills:
            return [skill.shorthand for skill in self.skills]
        return [f"-{self.note}"]
        '''
    
    def add_skill(self, skill):
        """ Add the given skill(s) to the routine """
        # Skills ending in 'ooo' or 'o</' should be multiple of the same skill
        if skill in NON_SKILLS:
            self.skills.append(Skill(skill, event=self.event))
            return
        no_pos_skill = ''.join(s for s in skill if s.isdigit())
        skill_pos = ''.join(s for s in skill if not s.isdigit())
        new_skills_list = []
        for pos in skill_pos:
            new_skill = Skill(f"{no_pos_skill}{pos}", event=self.event)
            new_skills_list.append(new_skill)
        self.skills.extend(new_skills_list)

        # re-adjust total metrics
        self.total_flips = sum([skill.flips for skill in self.skills])
        self.total_twists = sum([sum(skill.twists) for skill in self.skills])
        self.difficulty = sum([skill.difficulty for skill in self.skills])


def current_user():
    """
    Returns the current user
    """
    #return CURRENT_USER
    return session.get('name')


def set_current_user(user):
    """
    Sets the current user
    """
    global CURRENT_USER
    CURRENT_USER = user
    session["name"] = user


def current_event():
    """
    Returns the current event
    """
    return session.get('event', EVENT)


def set_current_event(event):
    """
    Sets the current event
    """
    session['event'] = event


def set_current_athlete(name):
    """
    Sets the current athlete
    """
    global CURRENT_ATHLETE
    CURRENT_ATHLETE = Athlete.load(name)


def get_dmt_difficulty(skill):
    """
    Returns the difficulty/tarrif of the double mini skill

    Got DD from: https://usagym.org/PDFs/Forms/T&T/DD_DMT.pdf
    """
    flip_difficulty = 0 # difficulty per flip
    twist_difficulty = 0 # difficulty per half twist
    total_twists = sum(skill.twists) * 2
    # Single flips
    if skill.flips == 1.0:
        if skill.pos == TUCK_POS:
            if total_twists == 0.0: # No twist
                return 0.5
            elif total_twists == 1.0: # Barani
                return 0.7
        elif skill.pos in [PIKE_POS, STRAIGHT_POS]:
            if total_twists == 0.0: # No twist
                return 0.6
            elif total_twists == 1.0: # Barani
                return 0.7
            elif total_twists == 2.0: # Full
                return 0.9
            elif total_twists == 3.0: # Rudi
                return 1.2
            elif total_twists == 4.0: # Double full
                return 1.5
            elif total_twists == 5.0: # Randi
                return 1.9
            elif total_twists == 6.0: # Triple full
                return 2.3
            elif total_twists > 6.0:
                # 0.5 per 1/2 twist more than triple twist
                return 2.3 + 0.5 * (total_twists - 6.0)
    # Double flips
    elif skill.flips == 2.0:
        twist_difficulty = 0.4
        if skill.pos == TUCK_POS:
            flip_difficulty = 2.0
        elif skill.pos == PIKE_POS:
            flip_difficulty = 2.4
        elif skill.pos == STRAIGHT_POS:
            flip_difficulty = 2.8
    # Triple flips
    elif skill.flips == 3.0:
        twist_difficulty = 0.6
        if skill.pos == TUCK_POS:
            flip_difficulty = 4.5
        elif skill.pos == PIKE_POS:
            flip_difficulty = 5.3
        elif skill.pos == STRAIGHT_POS:
            flip_difficulty = 6.1
    # Quad flips
    elif skill.flips == 4.0:
        twist_difficulty = 0.8
        if skill.pos == TUCK_POS:
            flip_difficulty = 8.0
        elif skill.pos == PIKE_POS:
            flip_difficulty = 9.6
        elif skill.pos == STRAIGHT_POS:
            flip_difficulty = 11.2
    return flip_difficulty + total_twists * twist_difficulty


def get_skill_difficulty(skill):
    """
    Returns the difficulty/tarrif of the skill
    """
    if skill.event == "dmt":
        return get_dmt_difficulty(skill)
    difficulty_per_flip = 0.5 if skill.pos in [TUCK_POS, 't'] else 0.6
    flip_difficulty = (skill.flips - skill.flips%1) * difficulty_per_flip + \
                      (skill.flips % 1 / 0.25) * 0.1
    
    return flip_difficulty \
           + sum([2*twist for twist in skill.twists]) * 0.1 \
           + (0.1 if skill.flips == 3 else 0) # extra 0.1 for a triple flip


def convert_form_data(form_data, logger=print, event=EVENT, notes=None, get_athlete=True):
    """
    Converts the data from the form into trampoline routines
    and returns a list of Routine objs
    """
    if get_athlete:
        athlete = Athlete.load(session.get('name')) 

    if logger:
        logger(f"Comp: {athlete.compulsory}")
        logger(f"opt: {athlete.optional}")

    if not form_data:
        return []

    # Expands any thing inside of a parentethese
    #  i.e. (40o 41o)x2 -> 40o 41o 40o 41o
    #matches = re.findall("(\((.[^x]*)\)x([0-9]*))", form_data)
    # fix for allowing "(40o<//<o x2)x2 (40ooo)x3"
    # 'laziness instead of greediness'
    # https://www.regular-expressions.info/repeat.html
    matches = re.findall("(\(([^)]*)\)x([0-9]*))", form_data)
    for match in matches:
        form_data = form_data.replace(
            # Takes the entire string
            match[0],
            # and replaces it with the correct number of what is inside the parentethese
            ' '.join([match[1]]*int(match[2]))
        )

    '''
    # Replace common routines
    for common_name, common_routine in COMMON_ROUTINES.items():
        form_data = form_data.replace(common_name, common_routine)

    # Replace compulsory or optional
    if get_athlete:
        form_data = form_data.replace('compulsory', ' '.join(athlete.compulsory))
        form_data = form_data.replace('optional', ' '.join(athlete.optional))
    '''
    
    # Split by spaces for each skill
    #turns = form_data.split('\r\n')
    turns = form_data.splitlines()
    turn_skills = [turn.split(' ') for turn in turns]
    if logger:
        logger(f"turn_skills: {turn_skills}")

    skill_turns = []
    for turn in turn_skills:
        if not turn:
            continue
        # notes start with '-'
        if turn[0] and turn[0][0] in ['-', '#']:
            note_str = ' '.join(turn)
            if skill_turns and skill_turns[-1].skills and not skill_turns[-1].note:
                skill_turns[-1].note = note_str.strip('-').strip('#')
            else:
                routine = Routine([], event=event, note=note_str.strip('-').strip('#'))
                skill_turns.append(routine)
            continue
    
        # Replace compulsory and optional in turn
        #  and also common routines
        new_turn = []
        for skill in turn:
            if get_athlete:
                if skill == "compulsory":
                    new_turn.extend(athlete.compulsory.split())
                    continue
                elif skill == "optional":
                    new_turn.extend(athlete.optional.split())
                    continue
            # Replace common routines
            for common_name, common_routine in COMMON_ROUTINES.items():
                if skill == common_name:
                    new_turn.extend(common_routine.split())
            new_turn.append(skill)
        turn = new_turn
            
        # Set athlete compulsory or optional
        if turn[0] == 'comp:' and get_athlete:
            athlete.set_comp(turn[1:])
            athlete.save()
        elif turn[0] == 'opt:' and get_athlete:
            athlete.set_opt(turn[1:])
            athlete.save()

        routine = Routine([], event=event)
        for skill_num, skill in enumerate(turn):
            # Catch repeat skills with skill x#
            skill = skill.replace('\\', '/')
            repeats = re.findall("x([0-9]*)", skill)
            if repeats:
                for _ in range(int(repeats[0]) - 1):
                    if skill_num > 0:
                        routine.add_skill(turn[skill_num-1])
                continue

            try:
                # Allow multiple of the same skill (i.e. 40o<//<o)
                routine.add_skill(skill)
            except:
                if logger:
                    logger(f"Cannot convert '{skill}' into a skill")
                continue
        skill_turns.append(routine)
    # add the notes to the beginning
    if notes:
        skill_turns.insert(
            0,
            Routine([], event=event, note=notes)
        )

    return skill_turns


def pretty_print(routine, logger=print):
    """
    Prety print the routine
    """
    for turn_num, turn in enumerate(routine):
        logger(f"{turn_num}:")
        for skill in turn.skills:
            logger(f"\t{skill}")
        logger(turn)


def get_user_turns(user, from_date="", to_date=""):
    """
    Returns all turns for the given user in order of date
    [(skill_num, skills, date, user, event, note)]
    """
    _, all_turns = get_users_and_turns()
    if not all_turns:
        all_turns = [
            #[skill_num, '801<', datetime.datetime.now(), user, random.choice(["trampoline", "dmt"])]
            [skill_num, '801<', str(datetime.datetime.now()), user, random.choice(["trampoline", "dmt"])]
            for skill_num in range(10)
        ]
    user_turns = [turn for turn in all_turns if turn[3].lower() == user]
    if from_date:
        from_date = from_date.replace('/', '-')
        try:
            from_date = datetime.datetime.strptime(from_date, "%Y-%m-%d")
            user_turns = [turn for turn in user_turns if turn[2]>=from_date]
        except:
            print(f"Failed to convert {from_date} to datetime")
    if to_date:
        to_date = to_date.replace('/', '-')
        try:
            to_date = datetime.datetime.strptime(to_date, "%Y-%m-%d")
            user_turns = [turn for turn in user_turns if turn[2]<=to_date]
        except:
            print(f"Failed to convert {to_date} to datetime")
    return sorted(user_turns, key=lambda turn: turn[2])


def get_turn_dds():
    """
    Returns all turns and their dds for each event

    { 
        'trampoline': [
            {'turn': '801<', 'user': 'user', date: '01-02-2022', 'dd': 10.5},
            ...
        ],
        ...
    }
    """
    user_data, all_turns = get_users_and_turns()

    # Gather all turns
    event_turns = {}
    for turn in all_turns:
        event = turn[4]
        if event not in event_turns:
            event_turns[event] = []
        
        # Get dd of skills
        skills_text = turn[1]
        routines = convert_form_data(skills_text, event=event, logger=None, get_athlete=False) # List of Routine objs
        turn_dd = sum([skill.difficulty for routine in routines for skill in routine.skills])
        turn_flips = sum([skill.flips for routine in routines for skill in routine.skills])
        turn_note = turn[5]

        # add to all turns
        single_turn = {
            "turn": skills_text,
            "user": turn[3].lower(),
            "date": turn[2],
            "dd": turn_dd,
            "flips": turn_flips,
            "note": turn_note
        }
        event_turns[event].append(single_turn)
    return event_turns, user_data


def get_leaderboards():
    """
    Creates the leaderboards from data in the db
    """
    # Gather all turns
    event_turns, user_data = get_turn_dds()

    # Sort the turns and take top for each user
    top_turns = {}
    user_turns = {}
    user_flips = {}
    for event in event_turns:
        event_turns[event] = sorted(event_turns[event], key=lambda x:x["dd"], reverse=True)

        top_turns[event] = {}
        user_turns[event] = defaultdict(int)
        user_flips[event] = defaultdict(int)
        for turn in event_turns[event]:
            user = turn["user"].lower()
            #if user in top_turns[event]:
            #    continue
            # Ignore private users
            if user in user_data and user_data[user]["private"]:
                continue

            user_turns[event][user] += 1
            user_flips[event][user] += turn['flips']
            # Only include if there are 10 skills on trampoline or 2-3 skills on double mini
            turn_skills = turn['turn'].split()
            if event == 'trampoline' and len(turn_skills) != 10:
                continue
            if event == "dmt" and len(turn_skills) not in [2, 3]:
                continue

            turn_date = turn['date'].date().strftime('%m/%d/%Y')
            if user not in top_turns[event]:
                top_turns[event][user] = f"{turn['dd']:.1f} ({turn_date})"

    # Order the user turns by number of turns per event
    sorted_user_turns = {
        event: OrderedDict(
            [(result[0], result[1]) for result in sorted(user_event_turns.items(), key=lambda x: x[1], reverse=True)]
        )
        for event, user_event_turns in user_turns.items()
    }
    sorted_user_flips = {
        event: OrderedDict(
            [(result[0], result[1]) for result in sorted(user_event_flips.items(), key=lambda x: x[1], reverse=True)]
        )
        for event, user_event_flips in user_flips.items()
    }
    # Convert to leaderboard
    leaderboards = {"DD": top_turns, "TURNS": sorted_user_turns, "FLIPS": sorted_user_flips}
    print(f"Leaderboard: {leaderboards}")

    return leaderboards


if __name__ == '__main__':
    pretty_print(convert_form_data('12001o 811< 803< 40/'))
    print()
    routines = convert_form_data('11000o 800o 901o 40o 40/ 40< 41o 800o 801o 822o')
    pretty_print(routines)

    routines = convert_form_data('12001< 811< 12001o 822/ 823/ 811o 821< 831< 801< 833/')
    pretty_print(routines)

    routines = convert_form_data('12001< 811< 12001o 811o 803< 813o 803o 800< 801< 813<')
    pretty_print(routines)

    routines = convert_form_data('40o X 40o 41o ... 822/')
    pretty_print(routines)

    routines = convert_form_data('swingtime 822/')
    pretty_print(routines)

    routines = convert_form_data('(swingtime)x3 822/')
    pretty_print(routines)