#!/usr/bin/python

import random
import math


class Arena(object):
    def __init__(self, width=10):
        self.width = width
        self.fighter_0 = None
        self.fighter_1 = None

    def set_fighters(self, fighters):
        self.fighter_0 = Fighter(self, 3, fighters["fighters"]["fighter_0"])
        self.fighter_1 = Fighter(self, 5, fighters["fighters"]["fighter_1"])

    @property
    def fighters(self):
        return (self.fighter_0, self.fighter_1)

    def start(self):
        self.log = {"fighter_0": [], "fighter_1": []}
        while not any([x.hp <= 0 for x in (self.fighter_0, self.fighter_1)]):
            state, message = self.fighter_0.choice()
            self.log["fighter_0"].append({"hp": self.fighter_0.hp, "state": state, "position": self.fighter_0.position, "message": message})
            state, message = self.fighter_1.choice()
            self.log["fighter_1"].append({"hp": self.fighter_1.hp, "state": state, "position": self.fighter_1.position, "message": message})
            assert self.fighter_0.position != self.fighter_1.position, "Duh! %s" % self.log

    def json(self):
        return {"width": self.width}


class Fighter(object):
    def __init__(self, arena, position, stats):
        self.arena = arena
        self.position = position
        self.step = 1
        self.state = 0
        self.act = {0: self.idle,
                1: self.walk_forward,
                2: self.walk_backward,
                3: self.kick,
                4: self.punch,
                5: self.block,
                6: self.beaten,
                }
        self.__dict__.update(dict([(key, stats[key]) for key in stats 
            if not any([key.endswith(suff) for suff in ("_id", "_count", "_url")])]))
        self.hp_max = self.size

    @property
    def attack(self):
        return math.log(self.forks or 1) * math.log(self.watchers or 1) * 15

    @property
    def sneak_attack(self):
        return math.log(self.forks or 1) * math.log(self.watchers or 1) * math.log(self.open_issues or 1)

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

    def walk_backward(self):
        old_position = self.position
        new_position = self.position - self.step
        if self.can_move(new_position):
            self.position = new_position
            return "%s moves backward from %s to %s" % (self, old_position, new_position)

    def punch(self):
        target = self.near()
        if target and target.state != 5:
            target.hp = max(target.hp - self.attack, 0)
            return "%s punches %s!" % (self, target)
        return "%s misses!" % self

    def kick(self):
        target = self.near()
        if target and target.state != 5:
            target.hp = max(target.hp - self.sneak_attack, 0)
            return "%s kicks %s!" % (self, target)
        return "%s misses!" % self

    def block(self):
        return "%s blocks!" % self

    def beaten(self):
        return "%s beaten!" % self

    def choice(self):
        self.state = random.randrange(len(self.act))
        message = self.act[self.state]()
        return self.state, message

if __name__ == "__main__":
    arena = Arena(8)
    arena.set_fighters()
    arena.start()
    print(arena.log)
