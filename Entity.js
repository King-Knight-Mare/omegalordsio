
Math = require("./math.js");
const Matter = require("matter-js")
const Timeout = require('./timeout.js')
const Engine = Matter.Engine,
      Render = Matter.Render,
      World = Matter.World,
      Bodies = Matter.Bodies,
      Body = Matter.Body,
      Vector = Matter.Vector;
const EventEmitter = require('events')
Vector.getDistance = function (vectorA, vectorB) {  
    return Math.sqrt(Math.pow(vectorA.x - vectorB.x, 2) + Math.pow(vectorA.y - vectorB.y, 2))
};
const {astar, Graph} = require('./astar.js')
// create an engine
const sleep = ms => {
  return new Promise(resolve => setTimeout(resolve, ms));
}

global.games = []
/** 
 * @param {SocketIO.Server} nsp
 * @param {String} ns
 */
module.exports = function (nsp, ns) {
    this.engine = Engine.create(); 
    let engine = this.engine
    let sunlight = 1
    let sunpertree = 1
    engine.world.gravity.y = 0
    this.map = {
        width:1500,
        height:1500
    }
    let walls = {
        top:Bodies.rectangle(this.map.width/2, -10, this.map.width, 20, {isStatic:true}),
        bottom:Bodies.rectangle(this.map.width/2, this.map.height + 10, this.map.width, 20, {isStatic:true}),
        left:Bodies.rectangle(-10, this.map.height/2, 20, this.map.height, {isStatic:true}),
        right:Bodies.rectangle(this.map.width + 10, this.map.height/2, 20, this.map.height, {isStatic:true})
    }
    World.add(engine.world, [ 
        walls.top, 
        walls.bottom,
        walls.left,
        walls.right
    ])
    this.nsp = nsp
    this.ns = ns
    let game = this
    
    class Entity {
        /**
         * 
         * @param {String} id 
         * @param {Number} x 
         * @param {Number} y 
         */
        constructor(id, x, y) {
            this.position = Vector.create(x, y);
            this.id = id;
        }
    }
    class mover extends Entity {
        constructor(id, x, y) {
            super(id, x, y)
            this.velocity = Vector.create(0, 0);
            this.acceleration = Vector.create(0, 0);
        }
        updatePosition() {
            Vector.add(this.position, this.velocity, this.position);
        }
    }
    class Mapper extends Map {
        constructor(iterator){
            super(iterator)
        }
        find(fn, thisArg){
            if (typeof thisArg !== 'undefined') fn = fn.bind(thisArg);
            for (const [key, val] of this) {
                if (fn(val, key, this)) return val;
            }
            return undefined;
        }
        findKey(fn, thisArg){
            if (typeof thisArg !== 'undefined') fn = fn.bind(thisArg);
            for (const [key, val] of this) {
                if (fn(val, key, this)) return key;
            }
            return undefined;
        }
        findAll(fn, thisArg) {
            if (typeof thisArg !== 'undefined') fn = fn.bind(thisArg);
            const results = [];
            for (const [key, val] of this) {
              if (fn(val, key, this)) results.push(val);
            }
            return results;
        }
    }
    class Crafter extends Mapper{
        constructor(){
            super([
                [
                    'Axe', 
                    {
                        recipe:[
                            {id:'wood', count:10},
                            {id:'stone', count:5}
                        ],
                        output:{
                            count:1,
                            image:'axe',
                            stackSize:1,
                            equipable:true
                        }
                    }
                ],
                [
                    'Pickaxe', 
                    {
                        recipe:[
                            {id:'wood', count:10},
                            {id:'stone', count:5}
                        ],
                        output:{
                            count:1,
                            image:'pickaxe',
                            stackSize:1,
                            equipable:true
                        }
                    }
                ],
                //['Spear', [{id:'wood', count:15, output:1, image;'spear'}]],
                //['Black Ability', [{id:'wood', count:20}]]
            ])
        }
        checkCraft(inventory){
            let craftables = []
            for(const [key, val] of this){
                let craftable = true
                val.recipe.forEach(supply => {
                    if(!inventory.find(slot => slot.count >= supply.count && slot.id == supply.id)) return craftable = false 
                })
                if(craftable) craftables.push(key)
            }
            return craftables;
        }
        craftItem(item, inventory){
            if(!this.checkCraft(inventory).find(craftable => craftable == item)) return console.log('Not found')
            var recipe = this.get(item).recipe
            let output =  this.get(item).output
            recipe.forEach(req => {
                let found = false
                inventory.forEach(slot => {
                    if(found) return
                    if(slot.count >= req.count){
                        slot.count -= req.count
                        if(slot.count <= 0) inventory.set(inventory.findKey(item => item == slot), 'empty')
                        found = true
                    }
                })
            })
            inventory.addItem(new Slot(item, 1, output.image, output.stackSize, output.equipable))
            //if(inventory.findKey(slot => slot == 'empty')) inventory.set(inventory.findKey(slot => slot == 'empty'), {id: 'Axe', count:1, image:'draw'})\
        }
    }
    //console.log(new Timeout(() => {}, 3000).timeLeft)
    class Slot {
        constructor(type, count, image, stackSize = 255, equipable = false){
            this.id = type
            this.count = count
            this.image = image
            this.stackSize = stackSize
            this.equipable = equipable
        }
    }
    class Inventory extends Mapper {
        constructor(){
            super([
                ['1', 'empty'],
                ['2', 'empty'], 
                ['3', 'empty'], 
                ['4', 'empty'], 
                ['5', 'empty'], 
                ['6', 'empty'], 
                ['7', 'empty'], 
                ['8', 'empty'], 
                ['9', 'empty']
            ])
        }
        listItems(){
            let itemArray = []
            this.forEach((item) => {
                if(item == 'empty') return itemArray.push(' ')
                else return itemArray.push({type:item.id, image:item.image,count:item.count})
            })
            return itemArray
        }
        addItem(toAdd){
            let found = false;
            let posSlots =  this.findAll(item => item.id == toAdd.id)
            posSlots.forEach(item => {
                if(found) return
                if(item.id == toAdd.id){
                    if(item.count >= item.stackSize){ 
                        found = false
                    } else {
                        if(item.count + toAdd.count > item.stackSize){
                            toAdd.count -= (item.stackSize - item.count)
                            item.count = item.stackSize
                            found = true
                            this.addItem(toAdd)
                            return
                        }
                        item.count += toAdd.count;
                        found = true
                    }
                }
            })
            if(found) return
            if(this.find(item => item == 'empty')) return this.set(this.findKey(item => item == 'empty'), toAdd)
        }
        
    }
    class Player extends EventEmitter{
        /**
         * @param {String} id 
         * @param {String} usr 
         */
        constructor(id, usr, socket, game) {
            super()
            this.game = game
            this.id = id
            this.socket = socket
            this.rad = 30
            this.body = Bodies.circle(Math.getRandomNum(this.rad, this.game.map.width - this.rad), Math.getRandomNum(this.rad, this.game.map.height - this.rad), this.rad, {friction:0.8, restitution:0.15})
            World.addBody(this.game.engine.world, this.body)
            //new Guns.types['pistol'](getRandomNum(25, 2090), getRandomNum(25,1463))
            this.inventory = new Inventory()
            this.crafter = new Crafter()
            this.mainHand = '-1'
            this.admin = false;
            this.bullets = [];
            this.score = 0
            this.punch = {
                speed: 3,
                ready:true,
                reload: {
                    speed: 20,
                    timer: 0
                },
                damage: 1 / 2,
                health: 1,
            }
            this.axe = {
                ready:true,
                reload: {
                    speed: 20,
                    timer: 0
                },
                damage: 3.75,
            }
            this.pickaxe = {
                ready:true,
                reload: {
                    speed: 20,
                    timer: 0
                },
                damage: 1.75,
            }
            this.hands = {
                l: {
                    hit: false,
                },
                r: {
                    hit: false,
                }
            }
            this.ram = 1;
            this.usr = usr;
            this.move = {
                r: false,
                l: false,
                u: false,
                d: false,
                att: false,
                run:false,
                ang: 0
            }
            this.hrad = this.rad/25 * 7.5
            this.hposfl = Vector.create(0, -35.34119409414458 * this.rad/25)
            this.hposfl.x = Math.cos(this.move.ang * Math.PI / 180) * Vector.magnitude(this.hposfl);
            this.hposfl.y = Math.sin(this.move.ang * Math.PI / 180) * Vector.magnitude(this.hposfl);
            Vector.add(this.body.position, this.hposfl, this.hposfl)

            this.hposfr = Vector.create(0, -35.34119409414458 * this.rad/25)
            this.hposfr.x = Math.cos(this.move.ang * Math.PI / 180) * Vector.magnitude(this.hposfr);
            this.hposfr.y = Math.sin(this.move.ang * Math.PI / 180) * Vector.magnitude(this.hposfr);
            Vector.add(this.body.position, this.hposfr, this.hposfr)
            this.next = 'l'
            this.lhit = false
            this.rhit = false
            this.maxSpd = 2;
            this.health = 20;
            this.maxHealth = 20;
            this.stamina = 20
            this.maxStamina = 20
            var self = this
            this.bulletSpeed = 1;
            this.targets = []
            this.treetargs = []
            this.stonetargs = []
            this.kills = 0;
            this.needsUpdate = false
            this.needsSelfUpdate = false
            this.mainHands = 'hand'
            this.afkTimer = setTimeout(function () {
                self.dead = true
                setInterval(function () {
                    self.health -= self.maxHealth / 100
                }, 100)
            }, 10000);
            this.dead = false;
            initPack.player.push({
                usr:this.usr,
                x: this.body.position.x,
                y: this.body.position.y,
                health: 20,
                mainHand: 'hand',
                id: this.id,
                maxHp: this.maxHealth,
                angle: this.move.ang,
                lhit: this.lhit,
                rhit: this.rhit
            })
            this.game.Players.list.push(this);
            this.on('unable',function(msg){
                game.nsp.to(this.id).emit('unable', msg)
            })
            this.on('death', function(){
                game.nsp.to(this.id).emit('death')
            })
        }
        updateSpd() {
          var m = this.move
          this.acc = Vector.create(0, 0)
          if(m.r) this.acc.x += this.maxSpd/3500
          if(m.l) this.acc.x -= this.maxSpd/3500
          if(m.d) this.acc.y += this.maxSpd/3500
          if(m.u) this.acc.y -= this.maxSpd/3500
          Body.applyForce(this.body, this.body.position, this.acc)
        }
        update() {
            if(this.move.run && this.stamina > .5 && Vector.magnitude(this.acc) > 0){
                this.maxSpd = 3
                this.stamina -= this.maxStamina/5/60
                this.needsSelfUpdate = true
            }else if(this.stamina < this.maxStamina){
                this.maxSpd = 2
                if(Vector.magnitude(this.acc) <= 0) this.stamina += this.maxStamina/25/60
                else this.stamina += this.maxStamina/100/60
                this.needsSelfUpdate = true
            }/*else if(this.health < this.maxHealth){
                
            }*/
            this.health += this.maxStamina/50/60
            if(this.crafter.checkCraft(this.inventory)) this.needsUpdate = true
            if(this.stamina > this.maxStamina) this.stamina = this.maxStamina
            if(this.health > this.maxHealth) this.health = this.maxHealth
            this.updateSpd();
            if(Vector.magnitude(this.body.velocity) > this.maxSpd) Vector.mult(Vector.normalise(this.body.velocity), {x:this.maxSpd, y:this.maxSpd}, this.body.velocity)            
            this.targets = []
            this.treetargs = []
            this.stonetargs = []
            this.setHands()

            if (this.axe.reload.timer > 0) {
                this.axe.reload.timer--
            }
            if (this.punch.reload.timer > 0) {
                this.punch.reload.timer--
            }
            if (this.inventory.get(this.mainHand) == undefined) {
                this.mainHands = 'hand'
            } else {
                this.mainHands = this.inventory.get(this.mainHand).id
                if (this.axe.ready && this.move.att && this.mainHands == 'Axe') {
                    if(this.axe.timeout) clearTimeout(this.axe.timeout.timeout)
                    let axerad = this.rad/25 * 15
                    let hposfl = Vector.create(0, -60 * this.rad/25)
                    hposfl.x = Math.cos(this.move.ang * Math.PI / 180) * Vector.magnitude(hposfl);
                    hposfl.y = Math.sin(this.move.ang * Math.PI / 180) * Vector.magnitude(hposfl);
                    Vector.add(this.body.position, hposfl, hposfl)

                    let hposfr = Vector.create(0, -60 * this.rad/25)
                    hposfr.x = Math.cos(this.move.ang * Math.PI / 180) * Vector.magnitude(hposfr);
                    hposfr.y = Math.sin(this.move.ang * Math.PI / 180) * Vector.magnitude(hposfr);
                    Vector.add(this.body.position, hposfr, hposfr)
                    this.axe.ready = false
                    this.hitting = true
                    this.axe.timeout = new Timeout(() => {
                        this.hitting = false
                        this.axe.timeout = null
                        this.axe.ready = true
                    }, 5000/3)
                    for (var i = 0; i < Players.list.length; i++) {
                        var p = Players.list[i]
                        if ((Vector.getDistance(hposfr, p.body.position) < p.rad + axerad || 
                             Vector.getDistance(hposfl, p.body.position) < p.rad + axerad) && this.id != p.id) {
                            this.targets.push(p)
                        }
                    }
                    this.game.STrees.list.forEach(tree => {
                        if ((Vector.getDistance(
                            hposfl, {x: tree.x, y:tree.y + tree.acumheight}) < axerad - tree.acumheight || 
                            Vector.getDistance(hposfl, {x: tree.x, y:tree.y - tree.acumheight}) < axerad + tree.acumheight)) {
                            this.treetargs.push(tree)
                        }
                    })
                    this.axe.reload.timer = this.axe.reload.speed
                    this.targets.forEach( p => {
                        p.health -= this.axe.damage
                        if (p.health <= 0) {
                            this.score += p.score/2 + 2
                        }
                    })
                    this.treetargs.forEach(tree => {
                        this.inventory.addItem(new Slot('wood', 4, 'draw', 255, false))
                        this.score += 32
                        this.needsSelfUpdate = true
                    })
                }
                if (this.pickaxe.ready && this.move.att && this.mainHands == 'Pickaxe') {
                    console.log(this.mainHands)
                    if(this.pickaxe.timeout) clearTimeout(this.pickaxe.timeout.timeout)
                    let axerad = this.rad/25 * 15
                    let hposfl = Vector.create(0, -60 * this.rad/25)
                    hposfl.x = Math.cos(this.move.ang * Math.PI / 180) * Vector.magnitude(hposfl);
                    hposfl.y = Math.sin(this.move.ang * Math.PI / 180) * Vector.magnitude(hposfl);
                    Vector.add(this.body.position, hposfl, hposfl)

                    let hposfr = Vector.create(0, -60 * this.rad/25)
                    hposfr.x = Math.cos(this.move.ang * Math.PI / 180) * Vector.magnitude(hposfr);
                    hposfr.y = Math.sin(this.move.ang * Math.PI / 180) * Vector.magnitude(hposfr);
                    Vector.add(this.body.position, hposfr, hposfr)
                    this.pickaxe.ready = false
                    this.hitting = true
                    this.pickaxe.timeout = new Timeout(() => {
                        this.hitting = false
                        this.pickaxe.timeout = null
                        this.pickaxe.ready = true
                    }, 5000/3)
                    for (var i = 0; i < Players.list.length; i++) {
                        var p = Players.list[i]
                        if ((Vector.getDistance(hposfr, p.body.position) < p.rad + axerad || 
                             Vector.getDistance(hposfl, p.body.position) < p.rad + axerad) && this.id != p.id) {
                            this.targets.push(p)
                        }
                    }
                    this.game.Stones.list.forEach(stone => {
                        if ((Vector.getDistance(
                            hposfl, {x: stone.x, y:stone.y + 50}) < axerad - 50 || 
                            Vector.getDistance(hposfl, {x: stone.x, y:stone.y - 50}) < axerad + 50)) {
                            this.treetargs.push(stone)
                        }
                    })
                    this.pickaxe.reload.timer = this.axe.reload.speed
                    this.targets.forEach( p => {
                        p.health -= this.pickaxe.damage
                        if (p.health <= 0) {
                            this.score += p.score/2 + 2
                        }
                    })
                    this.treetargs.forEach(tree => {
                        this.inventory.addItem(new Slot('stone', 4, 'draw', 255, false))
                        this.score += 16
                        this.needsSelfUpdate = true
                    })
                }
            }
            if (this.move.att) {
                if (this.inventory.get(this.mainHand) == undefined) {
                    this.hit()
                }
            }
        }
        hit() {        
            if (this.punch.ready) {
                //if(this.punch.timeout) clearTimeout(this.punch.timeout.timeout)
                this.punch.ready = false
                this.punch.timeout = new Timeout(() => {
                    this.punch.timeout = null
                    this.punch.ready = true
                    this.lhit =  false
                    this.rhit = false
                }, 1500/3)
                for (var i = 0; i < Players.list.length; i++) {
                    var p = Players.list[i]
                    if ((
                        Vector.getDistance(this.hposfr, p.body.position) < p.rad + this.hrad || 
                        Vector.getDistance(this.hposfl, p.body.position) < p.rad + this.hrad) && this.id != p.id) {
                        this.targets.push(p)
                    }
                }
                this.game.STrees.list.forEach(tree => {
                    if ((Vector.getDistance(
                        this.hposfr, {x: tree.x, y:tree.y}) < this.hrad - tree.acumheight || 
                        Vector.getDistance(this.hposfl, {x: tree.x, y:tree.y}) < this.hrad + tree.acumheight)) {
                        this.treetargs.push(tree)
                    }
                })
                
                this.game.Stones.list.forEach(stone => {
                    if ((Vector.getDistance(
                        this.hposfr, {x: stone.x, y:stone.y}) < this.hrad + 50 || 
                        Vector.getDistance(this.hposfl, {x: stone.x, y:stone.y}) < this.hrad + 50)) {
                        this.stonetargs.push(stone)
                    }
                })
                if (this.next == 'l' && this.lhit == false && this.rhit == false) {
                    this.lhit = true
                    this.next = 'r'
                } else if (this.next == 'r' && this.lhit == true) {
                    this.lhit = false
                } else if (this.next == 'r' && this.rhit == false) {
                    this.rhit = true
                    this.next = 'l'
                } else if (this.next == 'l' && this.rhit == true) {
                    this.rhit = false
                }
                this.punch.reload.timer = this.punch.reload.speed
                this.targets.forEach( p => {
                    p.health -= this.punch.damage
                    if (p.health <= 0) {
                        this.score += p.score/2 + 2
                    }
                })
                this.treetargs.forEach(tree => {
                    this.inventory.addItem(new Slot('wood', 1, 'draw', 255, false))
                    this.score += 8
                    this.needsSelfUpdate = true;
                })
                this.stonetargs.forEach(tree => {
                    this.inventory.addItem(new Slot('stone', 1, 'draw', 255, false))
                    this.score += 12
                    this.needsSelfUpdate = true
                })
            }
        }
        getUpdatePack() {
            var pack = {
                usr:this.usr,
                x: this.body.position.x,
                y: this.body.position.y,
                health: this.health,
                mainHand: this.mainHands,
                id: this.id,
                maxHp: this.maxHealth,
                angle: this.move.ang,
                lhit: this.lhit,
                rhit: this.rhit,
                hitting: this.hitting
            }
            if(this.punch.timeout) pack.punchper = Math.roundToDeci(this.punch.timeout.percntDone, 1000) > 0.95 ? 1 : Math.roundToDeci(this.punch.timeout.percntDone, 1000)
            if(this.hitting && this.mainHands != 'hand') pack.per = Math.roundToDeci(this[this.inventory.get(this.mainHand).image].timeout.percntDone, 1000) > 0.97 ? 1 : Math.roundToDeci(this[this.inventory.get(this.mainHand).image].timeout.percntDone, 1000)
            return pack
        }
        getSelfUpdatePack() {
          return {
               inventory:this.inventory.listItems(),
               stamina:this.stamina,
               maxStamina:this.maxStamina,
               craftables:this.crafter.checkCraft(this.inventory)
           }
        }
        setHands(){
            this.hrad = this.rad/25 * 7.5
            this.hposfl = Vector.create(0, -35.34119409414458 * this.rad/25)
            this.hposfl.x = Math.cos(this.move.ang * Math.PI / 180) * Vector.magnitude(this.hposfl);
            this.hposfl.y = Math.sin(this.move.ang * Math.PI / 180) * Vector.magnitude(this.hposfl);
            Vector.add(this.body.position, this.hposfl, this.hposfl)

            this.hposfr = Vector.create(0, -35.34119409414458 * this.rad/25)
            this.hposfr.x = Math.cos(this.move.ang * Math.PI / 180) * Vector.magnitude(this.hposfr);
            this.hposfr.y = Math.sin(this.move.ang * Math.PI / 180) * Vector.magnitude(this.hposfr);
            Vector.add(this.body.position, this.hposfr, this.hposfr)
        }
    }
    class Bullet extends mover {
        constructor(id, x, y, angle, stats, parentId) {
            super(id, x, y);
            this.speed = stats.speed;
            this.damage = stats.damage;
            this.health = stats.health;
            this.velocity = Vector.create(0, this.speed);
            this.velocity.setDirection(angle);
            this.timer = 0;
            this.toRemove = false;
            this.parentId = parentId;
            Bullets.list.push(this);
        }
        update() {
            this.health -= 0.01
            for (var i = 0; i < Players.list.length; i++) {
                var p = Players.list[i]
                if (this.position.getDistance(p.position) < 29 && this.parentId != p.id) {
                    p.health -= this.damage
                    this.health -= p.ram
                }
            }
            for (var i = 0; i < Bullets.list.length; i++) {
                var b = Bullets.list[i]
                if (this.position.getDistance(b.position) < 8 && this.parentId != b.parentId) {
                    b.health -= this.damage
                    this.health -= b.damage
                }
            }
            this.updatePosition();
        }
    }
    class Leaderboard {
        constructor(players){
            this.list = players.sort(function(a, b) {
                return b.score - a.score;
            }) || [];
        }
        addPlayer(player){
            this.list.push(player)
            this.list.sort(function(a, b) {
                return b.score - a.score;
            })
        }
        removePlayer(id){
            this.list.splice(this.list.findIndex(function (element) {
                return element.id === id
            }), 1);
        }
        update(){
            this.list.sort(function(a, b) {
                return b.score - a.score;
            })
        }
        getUpdate(){
            var pack = []
            this.list.forEach(player => {
                pack.push({
                    name:player.usr,
                    id:player.id,
                    score:player.score
                })
            })
            return pack
        }
    }
    var leaderboard = new Leaderboard([])
    var STrees = {
        list:[],
        update:function(){
            var pack = []
            STrees.list.forEach(tree=>{
                if(tree.needsUpdate) pack.push(tree.getUpdatePack())
            })
            return pack
        }
    }
    class STree {
        constructor(x, y, baselen = 100){
            this.x = x
            this.y = y
            this.id = Math.random()
            this.wood = 0
            this.growInterval = setInterval(() => {
                this.wood += 1
            }, 1000)
            this.acumheight = 50
            setTimeout(() => {
                clearTimeout(this.growInterval)
                removePack.tree.push(this.id)
                STrees.list.splice(STrees.list.findIndex(element => element.id === this.id), 1);
                World.remove(engine.world, this.body)
            }, 600000)
            this.body = Bodies.circle(this.x, this.y, 50, {isStatic:true})
            World.addBody(engine.world, this.body)
            this.toplayer = 8
            this.baselen = baselen
            this.needsUpdate = false
            //grow(this)
            var pack = {
                x:this.x,
                y:this.y,
                baselen:this.baselen,
                id:this.id,
                dead:this.dead || false
            }
            STrees.list.push(this)
            initPack.tree.push(pack)
        }
        getInitPack(){
            var pack = {
                x:this.x,
                y:this.y,
                baselen:this.baselen,
                id:this.id,
                dead:this.dead || false
            }
            return pack
        }
        
    }
    var Stones = {
        list:[],
        update:function(){
            var pack = []
            STrees.list.forEach(tree=>{
                if(tree.needsUpdate) pack.push(tree.getUpdatePack())
            })
            return pack
        }
    }
    class Stone {
        constructor(x, y){
            this.x = x
            this.y = y
            this.id = Math.random()
            this.stone = 0
            this.growInterval = setInterval(() => {
                this.stone += 1
            }, 1000)
            setTimeout(() => {
                clearTimeout(this.growInterval)
                removePack.stone.push(this.id)
                Stones.list.splice(Stones.list.findIndex(element => element.id === this.id), 1);
                World.remove(engine.world, this.body)
            }, 600000)
            this.body = Bodies.circle(this.x, this.y, 50, {isStatic:true})
            World.addBody(engine.world, this.body)
            this.toplayer = 8
            this.needsUpdate = false
            //grow(this)
            var pack = {
                x:this.x,
                y:this.y,
                id:this.id
            }
            Stones.list.push(this)
            initPack.stone.push(pack)
        }
        getInitPack(){
            var pack = {
                x:this.x,
                y:this.y,
                id:this.id
            }
            return pack
        }
        
    }
    var Players = {
        list: [],
        onConnect: function (id, socket, nm) {
            var player = new Player(id, nm, socket, game)
            leaderboard.addPlayer(player)
            game.nsp.to(id).emit('selfUpdate', player.getSelfUpdatePack())
            socket.on('movement', function (data) {
                if (Players.list.length > 0) {
                    var player = Players.list.find(function (element) {
                        return element.id === id;
                    })
                    if (player) {
                        clearTimeout(player.afkTimer);
                        player.afkTimer = setTimeout(function () {
                            setInterval(function () {
                                player.health -= player.maxHealth / 100
                            }, 100)
                        }, 10000);
                        player.move.l = data.left;
                        player.move.r = data.right
                        player.move.u = data.up
                        player.move.d = data.down
                        player.move.run = data.running
                        player.move.att = data.pressingAttack;
                        //io.emit("chat message", {usrnm:"SERVER",msg:data.angle})
                        player.move.ang = data.angle;
                    }
                }
            });
        },
        update: function () {
            var pack = [];
            for (var i = 0; i < Players.list.length; i++) {
                /**
                 * @type {Player}
                 */
                var player = Players.list[i];
                player.update();
                if(player.needsSelfUpdate){
                    player.needsSelfUpdate = false
                    game.nsp.to(player.id).emit('selfUpdate', player.getSelfUpdatePack())
                }
                if (player.health <= 0) {
                    player.emit('death')
                    removePack.player.push(player.id)
                    Players.list.splice(Players.list.findIndex(function (element) {
                        return element.id === player.id
                    }), 1);
                    World.remove(engine.world, player.body)
                    leaderboard.removePlayer(player.id)
                }
                pack.push(player.getUpdatePack())
            }
            return pack;
        }
    }
    var Bullets = {
        list: [],
        update: function () {
            var pack = [];
            for (var i in Bullets.list) {
                /**
                 * @type {Bullet}
                 */
                var bullet = Bullets.list[i];
                if (typeof bullet === 'function' || typeof bullet === 'undefined') {

                } else {
                    bullet.update();
                    if (bullet.health <= 0) {
                        Bullets.list.splice(Bullets.list.findIndex(function (element) {
                            return element.id === bullet.id
                        }), 1);
                    } else {
                        pack.push({
                            x: Math.round(bullet.position.x),
                            y: Math.round(bullet.position.y)
                        });
                    }
                }
            }
            return pack;
        }
    }
    var initPack = {
        player: [],
        bullet: [],
        tree:[],
        stone:[]
    }
    var removePack = {
        player: [],
        bullet: [],
        tree:[],
        stone:[]
    }   
    var self = this
    //console.log(Math.getRandomInt(0, 30) * 100 + 50)
    setInterval(function(){
        if(STrees.list.length >= 10) return
        let tempx = Math.getRandomInt(0, game.map.width/100 - 1) * 100 + 50
        let tempy = Math.getRandomInt(0, game.map.height/100 - 1) * 100 - 50
        //console.log(tempx)
        //let tempx = Math.getRandomInt(0, 30) * 100 + 50
        //let tempy = Math.getRandomInt(0, 30) * 100 + 50
        let inWay = false
        STrees.list.forEach(tree => {
            if(Vector.getDistance({x:tempx, y:tempy}, tree) <= 1) inWay = true
        })
        Players.list.forEach(player => {
            if(Vector.getDistance({x:tempx, y:tempy}, player.body.position) <= 150) inWay = true
        })
        Stones.list.forEach(stone => {
            if(Vector.getDistance({x:tempx, y:tempy}, stone.body.position) <= 1) inWay = true
        })
        //console.log(inWay)
        while(inWay){
            let tempx = Math.getRandomInt(0, game.map.width/100 - 1) * 100 + 50
            let tempy = Math.getRandomInt(0, game.map.height/100 - 1) * 100 + 50
            inWay = false
            STrees.list.forEach(tree => {
                if(Vector.getDistance({x:tempx, y:tempy}, tree) <= 200) inWay = true
            })
            Players.list.forEach(player => {
                if(Vector.getDistance({x:tempx, y:tempy}, player.body.position) <=200) inWay = true
            })
            Stones.list.forEach(stone => {
                if(Vector.getDistance({x:tempx, y:tempy}, stone.body.position) <= 200) inWay = true
            })
        }
        new STree(tempx, tempy)
    }, 1000)
    
    setInterval(function(){
        if(Stones.list.length >= 7) return
        let tempx = Math.getRandomInt(0, game.map.width/100 - 1) * 100 + 50
        let tempy = Math.getRandomInt(0, game.map.height/100 - 1) * 100 + 50
        let inWay = false
        STrees.list.forEach(tree => {
            if(Vector.getDistance({x:tempx, y:tempy}, tree) <= 1) inWay = true
        })
        Players.list.forEach(player => {
            if(Vector.getDistance({x:tempx, y:tempy}, player.body.position) <= 200) inWay = true
        })
        Stones.list.forEach(stone => {
            if(Vector.getDistance({x:tempx, y:tempy}, stone.body.position) <= 1) inWay = true
        })
        while(inWay){
            let tempx = Math.getRandomInt(0, game.map.width/100 - 1) * 100 + 50
            let tempy = Math.getRandomInt(0, game.map.height/100 - 1) * 100 + 50
            inWay = false
            STrees.list.forEach(tree => {
                if(Vector.getDistance({x:tempx, y:tempy}, tree) <= 200) inWay = true
            })
            Players.list.forEach(player => {
                if(Vector.getDistance({x:tempx, y:tempy}, player.body.position) <= 200) inWay = true
            })
            Stones.list.forEach(stone => {
                if(Vector.getDistance({x:tempx, y:tempy}, stone.body.position) <= 200) inWay = true
            })
        }
        new Stone(tempx, tempy, 10)
    }, 1000)
    this.nsp.on('connection', function (socket) {
        socket.on('log', log => console.log(log))
        socket.on('craft', item => {
            let playa = Players.list.find(player => player.id == socket.id)
            playa.crafter.craftItem(item, playa.inventory)
            playa.needsSelfUpdate = true
        })
        socket.on('lc', slotnum => {
            slotnum = slotnum.toString()
            let playa = Players.list.find(player => player.id == socket.id)
            let slot = playa.inventory.get(slotnum)
            if(playa.mainHand == slotnum) return playa.mainHand = '-1'
            if(!slot.equipable) return 
            playa.mainHand = slotnum
            playa.needsSelfUpdate = true
        })
        socket.on('rc', slotnum => {
            slotnum = slotnum.toString()
            let playa = Players.list.find(player => player.id == socket.id)
            let slot = playa.inventory.get(slotnum)
            if(slot == 'empty') return 
            playa.inventory.set(slotnum, 'empty')
            if(playa.mainHand == slotnum)playa.mainHand = '-1'
            playa.needsSelfUpdate = true
        })
        socket.on('new player', function (usr) {
            var uppedTrees = STrees.update()
            var pack = {
                player: [],
                bullet: [],
                tree: [],
                stone:[],
                leaderboard: leaderboard.getUpdate(),
            }
            Players.list.forEach(function (player) {
                pack.player.push(player.getUpdatePack())
            })
            Stones.list.forEach( stone => pack.stone.push(stone.getInitPack()))
            STrees.list.forEach( tree => pack.tree.push(tree.getInitPack()))

            /*
            Bullets.list.forEach(function(bullet){
                pack.bullet.push(bulle)
            })*/
            this.nsp.to(socket.id).emit('initPack', pack)
            Players.onConnect(socket.id, socket, usr);
            
        });
    })
    setInterval(function () {
        if (Players.list[0] === undefined) return
        Engine.update(engine);
        leaderboard.update()
        let pack = {
            player: Players.update(),
            bullet: Bullets.update(),
            tree:STrees.update(),
            stone:Stones.update(),
            leaderboard: leaderboard.getUpdate()
        }
        if (initPack.player.length > 0 || initPack.bullet.length > 0 || initPack.leaderboard > 0 || initPack.tree.length > 0 || initPack.stone.length > 0) {
            self.nsp.emit('initPack', initPack)
            initPack = {
                player: [],
                bullet: [],
                tree:[],
                stone:[]
            }
        }
        self.nsp.emit('state', pack)
        if (removePack.player.length > 0 || removePack.bullet.length > 0 || removePack.leaderboard > 0 || removePack.tree.length > 0 || initPack.stone.length > 0) {
            self.nsp.emit('removePack', removePack)
            removePack = {
                player: [],
                bullet: [],
                tree:[],
                stone:[],
            }
        }
    }, 1000 / 60);
    this.STrees = STrees
    this.Stones = Stones
    this.Entity = Entity;
    this.Bullet = Bullet;
    this.Bullets = Bullets;
    this.Player = Player;
  
    this.Players = Players;
    global.games.push(this)
}