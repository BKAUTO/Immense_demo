# This files contains your custom actions which can be used to run
# custom Python code.
#
# See this guide on how to implement these action:
# https://rasa.com/docs/rasa/custom-actions


# This is a simple example for a custom action which utters "Hello World!"

from typing import Any, Text, Dict, List

from rasa_sdk.events import SlotSet
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from pymongo import MongoClient
from urllib.parse import quote_plus
import os, certifi

username = quote_plus('<username>')
password = quote_plus('ImmenseTeam19')
connection ="mongodb+srv://Immense:"+password+"@immense.qwjj6.mongodb.net/wine?retryWrites=true&w=majority"
client = MongoClient(connection, tlsCAFile=certifi.where())

db_wine = client.wine
wine_name = db_wine.wine_name
match = db_wine.wine_match

class ActionMatchMeal(Action):

    def name(self) -> Text:
        return "match_with_meal"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        meal = next(tracker.get_latest_entity_values("meal"), None)

        if not meal:
            msg = "no_match_meal"
            dispatcher.utter_message(text=msg)
            return []

        match_got = match.find_one({'meal': meal})
        print(match_got)

        if not match_got:
            msg = "no_match_meal"
            dispatcher.utter_message(text=msg)
            return []

        wines = []
        for matched_wine_type in match_got['matched_wine']:
            searched_wines = wine_name.find({'type': matched_wine_type})
            for wine in searched_wines:
                wines.append(wine['name'])
        wines = set(wines)
        print(wines)
        wines_to_recommend = wines
        print(wines_to_recommend)
        if len(list(wines_to_recommend)) == 0:
            msg = "no_recommend"
            dispatcher.utter_message(text=msg)
            return []

        wines_to_recommend = list(wines_to_recommend)
        # if len(list(wines_recommended))==0:
        msg = "ask_on_offer"
        dispatcher.utter_message(text=msg)
        return [SlotSet("wine_selection", wines_to_recommend)]
        # else:
        #     msg = recommend_wine + " is also a good choice considerring your meal."
        #     dispatcher.utter_message(text=msg)
        #     return []


class ActionEndOfConversation(Action):

    def name(self) -> Text:
        return "end_of_conversation"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        wines_recommended = set([])
        return []

class ActionOnOffer(Action):

    def name(self) -> Text:
        return "go_on_offer"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        wine_selection = tracker.get_slot("wine_selection")
        print(wine_selection)
        wine_selection = set(wine_selection)

        wines_on_offer = wine_name.find({"condition":"on offer"})
        wines_on_offer = [wine['name'] for wine in wines_on_offer]
        wines_on_offer = set(wines_on_offer)

        wine_recommendation = wine_selection.intersection(wines_on_offer)
        wine_recommendation = list(wine_recommendation)

        if len(wine_recommendation) == 0:
            msg = "no_recommend"
            dispatcher.utter_message(text=msg)
            return []
        else:
            msg = "meal_France"
            dispatcher.utter_message(text=msg)
            return []


class ActionMatchCountry(Action):

    def name(self) -> Text:
        return "match_with_country"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        country = next(tracker.get_latest_entity_values("country"), None)
        print(country)
        if not country:
            msg = "not_understand"
            dispatcher.utter_message(text=msg)
            return []

        wines = []
        searched_wines = wine_name.find({"$or":[{'origin': country}, {"production": country}]})
        for wine in searched_wines:
            wines.append(wine['name'])

        if len(wines) == 0:
            msg = "no_recommend"
            dispatcher.utter_message(text=msg)
            return []
        else:
            msg = "country_" + country
            dispatcher.utter_message(text=msg)
            return []