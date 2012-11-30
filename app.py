import os
import json
from random import randint
from flask import Flask, jsonify, request
from fighter import Arena, Fighter
from pymongo import MongoClient

app = Flask(__name__)
arena = Arena(8)

repos = MongoClient().githunt.repos
repos_count = repos.count()

fights = MongoClient().gitfighter.fights

def get_full_name(repo):
    return '%s/%s' % (repo['owner']['login'], repo['name'])

@app.route("/arena")
def arena_json():
    print(arena.json)
    return jsonify(arena.json)

@app.route("/fight", methods=['POST'])
def fight():
    fighters_stats = request.json
    print fighters_stats
    arena.set_fighters(fighters_stats)
    arena.start()
    fight = {"log": arena.log}
    response = jsonify(fight)

    for key in ["fighter_0", "fighter_1"]:
        fight[key] = fighters_stats["fighters"][key]
    fight["unique"] = "/".join(sorted([get_full_name(fight["fighter_0"]), get_full_name(fight["fighter_1"])]))
    fights.insert(fight)

    return response

@app.route("/get_random_pair")
def get_random_pair():
    pair = []
    for idx in [0, 1]:
        repo = repos.find().limit(-1).skip(randint(1, repos_count)).next()
        pair.append(get_full_name(repo))
    return jsonify({"pair": pair})

@app.route("/history")
def history():
    history = []
    for item in fights.find().sort("$natural", -1).limit(10):
        history.append(item["log"])
    return jsonify({"history": history})

if __name__ == "__main__":
    app.run(debug = True, port = 6000)
