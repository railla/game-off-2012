#!/usr/bin/python

import random

class Arena(object):
    def __init__(self, width = 10):
        self.width = width
        self.fighter_0 = None
        self.fighter_1 = None

    def set_fighters(self, fighter_0, fighter_1):
        self.fighter_0 = fighter_0
        self.fighter_1 = fighter_1

    @property
    def fighters(self):
        return (self.fighter_0, self.fighter_1)

    def start(self):
        self.log = {x.name: [] for x in self.fighters}
        while not any([x.hp <= 0 for x in (self.fighter_0, self.fighter_1)]):
            for x in (self.fighter_0, self.fighter_1):
                state, message = x.choice()
                self.log[x.name].append({"hp": x.hp, "state": state, "position": x.position, "message": message})
                assert self.fighter_0.position != self.fighter_1.position, "Duh! %s" % self.log

    def json(self):
        return {"width": self.width}

    @property
    def json_fighters(self):
        return {x.name: {"hp": x.hp_max, "position": x.position} for x in self.fighters}


class Fighter(object):
    def __init__(self, arena, name = "Fighter", position = 1):
        self.position = position
        self.name = name
        self.step = 1
        self.attack = 5
        self.hp_max = 30
        self.hp = self.hp_max
        self.range = 1 
        self.arena = arena
        self.position = position
        self.state = 0
        self.act = {0: self.idle,
                1: self.walk_forward,
                2: self.walk_backward,
                3: self.punch,
                4: self.kick,
                5: self.block,
                6: self.beaten,
                }

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
            target.hp -= self.attack
            return "%s punches %s!" % (self, target)
        return "%s misses!" % self

    def kick(self):
        target = self.near()
        if target and target.state != 5:
            target.hp -= self.attack
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
    arena.set_fighters(Fighter(arena, "F1", 5), Fighter(arena, "F2", 3))
    arena.start()
    print(arena.log)
