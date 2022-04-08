import json
from pymongo import MongoClient
from urllib.parse import quote_plus
import os, certifi

def read_json(root):
    wine = None
    wine_match = None
    with open(os.path.join(root, 'wine_match.json'), 'r') as f:
        wine_match = json.load(f)
    with open(os.path.join(root, 'wine.json'), 'r') as f:
        wine = json.load(f)
    return wine, wine_match

def upload_database(client, wine, wine_match):
    db_wine = client.wine
    wine_name = db_wine.wine_name
    wine_name.drop()
    for data in wine:
        result = wine_name.insert_one(data)
    match = db_wine.wine_match
    match.drop()
    for data in wine_match:
        match.insert_one(data)
    return

if __name__ == '__main__':
    root = './'
    wine, wine_match = read_json(root)
    username = quote_plus('<username>')
    password = quote_plus('ImmenseTeam19')
    connection ="mongodb+srv://Immense:"+password+"@immense.qwjj6.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
    client = MongoClient(connection, tlsCAFile=certifi.where())
    upload_database(client, wine, wine_match)

