#!/usr/bin/python

import random
import math

true = True
false = False
null = None

stub_fighters = {"fighters":{"f1":{"open_issues":2,"pushed_at":"2012-11-14T17:27:48Z","ssh_url":"git@github.com:some_login/some_name.git","has_downloads":true,"forks_count":60,"forks":60,"created_at":"2011-12-18T15:22:51Z","owner":{"login":"some_login","avatar_url":"https://secure.gravatar.com/avatar/9ba739c8f3288e256b13553e4d257b5e?d', u'https://example.com/example.png","gravatar_id":"blah","id":1,"url":"https://api.github.com/users/some_login"},"full_name":"some_login/some_name","network_count":60,"mirror_url":null,"homepage":"","organization":{"login":"some_login","avatar_url":"https://secure.gravatar.com/avatar/some_avatar","gravatar_id":"blah","id":1,"url":"https://api.github.com/users/some_login"},"watchers":823,"has_wiki":true,"open_issues_count":2,"updated_at":"2012-11-14T17:54:48Z","clone_url":"https://github.com/some_login/some_name.git","svn_url":"https://github.com/some_login/some_name","description":"some_name is a","master_branch":"master","git_url":"git://github.com/some_login/some_name.git","size":872,"has_issues":true,"fork":false,"language":"ActionScript","name":"some_name","watchers_count":823,"html_url":"https://github.com/some_login/some_name","private":false,"id":2,"url":"https://api.github.com/repos/some_login/some_name"},"f2":{"open_issues":1,"pushed_at":"2012-11-14T13:05:35Z","ssh_url":"git@github.com:some_other_project/other_name.git","has_downloads":true,"forks_count":2,"forks":2,"created_at":"2012-11-11T19:02:54Z","owner":{"login":"some_other_project","avatar_url":"https://secure.gravatar.com/avatar/another_avatar","gravatar_id":"blah","id":308,"url":"https://api.github.com/users/some_other_project"},"full_name":"some_other_project/other_name","network_count":2,"mirror_url":null,"homepage":null,"watchers":34,"has_wiki":true,"open_issues_count":1,"updated_at":"2012-11-14T14:52:10Z","clone_url":"https://github.com/some_other_project/other_name.git","svn_url":"https://github.com/some_other_project/other_name","description":"some description","master_branch":"master","git_url":"git://github.com/some_other_project/other_name.git","size":140,"has_issues":true,"fork":false,"language":"Python","name":"other_name","watchers_count":34,"html_url":"https://github.com/some_other_project/other_name","private":false,"id":3,"url":"https://api.github.com/repos/some_other_project/other_name"}}}


class Arena(object):
    def __init__(self, width=10):
        self.width = width
        self.fighter_0 = None
        self.fighter_1 = None

    def set_fighters(self, fighters=stub_fighters):
        print fighters, fighters.__class__, fighters.keys()
        for key in fighters["fighters"]["f2"].keys():
            print "\n", key, fighters["fighters"]["f1"][key], fighters["fighters"]["f2"][key]
        self.fighter_0 = Fighter(self, 3, fighters["fighters"]["f1"])
        self.fighter_1 = Fighter(self, 5, fighters["fighters"]["f2"])

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
    def __init__(self, arena, position, stats):
        self.arena = arena
        self.position = position
        self.step = 1
        self.state = 0
        self.act = {0: self.idle,
                1: self.walk_forward,
                2: self.walk_backward,
                3: self.punch,
                4: self.kick,
                5: self.block,
                6: self.beaten,
                }
        self.__dict__.update({key: stats[key] for key in stats 
            if not any([key.endswith(suff) for suff in ("_id", "_count", "_url")])})
        print self.__dict__, self.forks
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
