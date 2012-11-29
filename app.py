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
    return jsonify({"fighters": arena.json_fighters, "log": arena.log})

@app.route("/get_random_pair")
def get_random_pair():
    pair = []
    for idx in [0, 1]:
        repo = repos.find().limit(-1).skip(randint(1, repos_count)).next()
        print repo
        pair.append('%s/%s' % (repo['owner']['login'], repo['name']))
    return jsonify({"pair": pair})

if __name__ == "__main__":
    app.run(debug = True, port = 6000)

