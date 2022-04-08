# This files contains your custom actions which can be used to run
# custom Python code.
#
# See this guide on how to implement these action:
# https://rasa.com/docs/rasa/custom-actions


# This is a simple example for a custom action which utters "Hello World!"

from typing import Any, Text, Dict, List

from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from pymongo import MongoClient
from urllib.parse import quote_plus
import os, certifi

username = quote_plus('<username>')
password = quote_plus('ImmenseTeam19')
connection ="mongodb+srv://Immense:"+password+"@immense.qwjj6.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
client = MongoClient(connection, tlsCAFile=certifi.where())

db_wine = client.wine
wine_name = db_wine.wine_name
match = db_wine.wine_match
wines_recommended = set([])

class ActionFindMatches(Action):

    def name(self) -> Text:
        return "find_matches"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        meal = next(tracker.get_latest_entity_values("meal"), None)

        if not meal:
            msg = "Could you tell me what are you going to eat again? I didn't quite get your idea."
            dispatcher.utter_message(text=msg)
            return []

        match_got = match.find_one({'meal': meal})
        print(match_got)

        if not match_got:
            msg = "I don't get what will you eat, could you describe it in another way?"
            dispatcher.utter_message(text=msg)
            return []

        wines = []
        for matched_wine_type in match_got['matched_wine']:
            wines += wine_name.find_one({'type': matched_wine_type})['name']
        wines = set(wines)
        print(wines)
        wines_to_recommend = wines.difference(wines_recommended)
        print(wines_to_recommend)
        if len(list(wines_to_recommend)) == 0:
            msg = "Sorry, there is no more wine I could recommend to you, maybe you could ask someone else in this store."
            dispatcher.utter_message(text=msg)
            return []

        wines_to_recommend = list(wines_to_recommend)
        recommend_wine = wines_to_recommend[0]
        if len(list(wines_recommended))==0:
            msg = "Then I will recommend to get " + recommend_wine
            dispatcher.utter_message(text=msg)
            return []
        else:
            msg = recommend_wine + " is also a good choice considerring your meal."
            dispatcher.utter_message(text=msg)
            return []


class ActionEndOfConversation(Action):

    def name(self) -> Text:
        return "end_of_conversation"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        wines_recommended = set([])
        return []

