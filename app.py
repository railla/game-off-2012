import os
import json
from random import choice
from flask import Flask, jsonify, request
from fighter import Arena, Fighter

app = Flask(__name__)
arena = Arena(8)

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

if __name__ == "__main__":
    app.run(debug = True)
