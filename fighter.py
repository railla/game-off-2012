#!/usr/bin/python

import random
import math
import logging


class Arena(object):
    def __init__(self, width=10):
        self.width = width
        self.fighter_0 = None
        self.fighter_1 = None

    def set_fighters(self, fighters):
        self.fighter_0 = Fighter(self, 3, fighters["fighters"]["fighter_0"])
        self.fighter_1 = Fighter(self, 5, fighters["fighters"]["fighter_1"])

    def new_move(self):
        self.fighter_0.new_move = True
        self.fighter_1.new_move = True

    @property
    def fighters(self):
        return (self.fighter_0, self.fighter_1)

    def start(self):
        self.log = {"fighter_0": [], "fighter_1": []}
        fighters_idx = [0, 1]
        for key in ['fighter_0', 'fighter_1']:
            fighter = getattr(self, key)
            self.log[key].append({"hp": fighter.hp, "state": 0, "position": fighter.position, "message": "Starting the fight!"})
        while not any([x.hp <= 0 for x in (self.fighter_0, self.fighter_1)]):
            self.new_move()
            random.shuffle(fighters_idx)
            _ = dict((("fighter_%i" % i, getattr(self, "fighter_%i" % i).choice()) for i in fighters_idx))
            logging.debug(_)
            for key in _:
                fighter = getattr(self, key)
                self.log[key].append({"hp": fighter.hp, "state": fighter.state, "position": fighter.position, "message": _[key][1]})
            assert self.fighter_0.position != self.fighter_1.position, "Duh! %s" % self.log

    def json(self):
        return {"width": self.width}


class Fighter(object):
    def __init__(self, arena, position, stats):
        self.arena = arena
        self.position = position
        self.step = 1
        self.state = 0
        self.new_move = True
        self.act = {0: self.idle,
                1: self.walk_forward,
                2: self.walk_backward,
                3: self.punch,
                4: self.block,
                5: self.beaten,
                }
        self.__dict__.update(dict([(key, stats[key]) for key in stats 
            if not any([key.endswith(suff) for suff in ("_id", "_count", "_url")])]))
        self.hp_max = self.size

    @property
    def attack(self):
        return math.log(self.forks + min(self.hp, 100)) \
                * math.log(self.watchers + min(self.hp, 100)) \
                * math.log(self.open_issues + min(self.hp, 100))

    @property
    def hp(self):
        return self.size

    @hp.setter
    def hp(self, value):
        self.size = int(value)

    @property
    def range(self):
        return 1

    def __str__(self):
        return "%s (%d hp)" % (self.name, self.hp)
    
    def can_move(self, position):
        if not(1 < position < self.arena.width - 1):
            return False
        if self is self.arena.fighter_0:
            return position < self.arena.fighter_1.position
        return position > self.arena.fighter_0.position

    def adversary(self):
        if self is self.arena.fighter_0:
            return self.arena.fighter_1
        return self.arena.fighter_0

    def near(self):
        if abs(self.arena.fighter_0.position - self.arena.fighter_1.position) <= self.range:
            return self.adversary()

    def idle(self):
        return "%s remains idle" % self

    def walk_forward(self):
        old_position = self.position
        new_position = self.position + self.step
        if self.can_move(new_position):
            self.position = new_position
            return "%s moves forward from %s to %s" % (self, old_position, new_position)
        self.state = 0
        return self.idle()

    def walk_backward(self):
        old_position = self.position
        new_position = self.position - self.step
        if self.can_move(new_position):
            self.position = new_position
            return "%s moves backward from %s to %s" % (self, old_position, new_position)
        self.state = 0
        return self.idle()

    def punch(self):
        target = self.near()
        if target and target.state != 4:
            target.hp = max(target.hp - self.attack, 0)
            if target.new_move:
                target.state = len(self.act) - 1
                target.new_move = False
            return "%s punches %s!" % (self, target)
        return "%s misses!" % self

    def block(self):
        return "%s blocks!" % self

    def beaten(self):
        return "%s beaten!" % self

    def choice(self):
        if self.new_move:
            self.state = random.randrange(len(self.act) - 2)
        message = self.act[self.state]()
        self.new_move = False
        return self.state, message

if __name__ == "__main__":
    arena = Arena(8)
    arena.set_fighters()
    arena.start()
    logging.debug(arena.log)
