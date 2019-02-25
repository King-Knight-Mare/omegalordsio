Math = require("./math.js");
const Matter = require("matter-js")
const Timeout = require('./timeout.js')

const {Engine, Render, World, Bodies, Body, Vector} = require('matter-js')
const EventEmitter = require('events')
const PF = require('pathfinding')
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
    let timeOfDay = 'day'
    let dayTimeout
    let setDayTimeout = () => {
        dayTimeout = new Timeout(() => {
            if(timeOfDay == 'day') timeOfDay = 'night'
            else if(timeOfDay == 'night') timeOfDay = 'day'
            setDayTimeout()
        }, 60000)
    }
    dayTimeout = new Timeout(() => {
        if(timeOfDay == 'day') timeOfDay = 'night'
        else if(timeOfDay == 'night') timeOfDay = 'day'
        setDayTimeout()
    }, 60000)
    this.map = {
        width:5000,
        height:5000
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
                    'Stone Axe', 
                    {
                        recipe:[
                            {id:'wood', count:5},
                            {id:'stone', count:5}
                        ],
                        output:{
                            count:1,
                            image:'stoneaxe',
                            stackSize:1,
                            equipable:true
                        }
                    }
                ],
                [
                    'Stone Pickaxe', 
                    {
                        recipe:[
                            {id:'wood', count:10},
                            {id:'stone', count:5}
                        ],
                        output:{
                            count:1,
                            image:'stonepickaxe',
                            stackSize:1,
                            equipable:true
                        }
                    }
                ],
                [
                    'Stone Sword', 
                    {
                        recipe:[
                            {id:'wood', count:5},
                            {id:'stone', count:10}
                        ],
                        output:{
                            count:1,
                            image:'stonesword',
                            stackSize:1,
                            equipable:true
                        }
                    }
                ],
                [
                    'Stone Hammer', 
                    {
                        recipe:[
                            {id:'stone', count:20},
                            {id:'wood', count:15},
                        ],
                        output:{
                            count:1,
                            image:'stonehammer',
                            stackSize:1,
                            equipable:true
                        }
                    }
                ],
                [
                    'Iron Axe', 
                    {
                        recipe:[
                            {id:'iron', count:20},
                            {id:'stone', count:10}
                        ],
                        output:{
                            count:1,
                            image:'ironaxe',
                            stackSize:1,
                            equipable:true
                        }
                    }
                ],
                [
                    'Iron Pickaxe', 
                    {
                        recipe:[
                            {id:'iron', count:20},
                            {id:'stone', count:15}
                        ],
                        output:{
                            count:1,
                            image:'ironpickaxe',
                            stackSize:1,
                            equipable:true
                        }
                    }
                ],
                [
                    'Iron Sword', 
                    {
                        recipe:[
                            {id:'iron', count:10},
                            {id:'stone', count:15},
                            {id:'wood', count:10}
                          
                        ],
                        output:{
                            count:1,
                            image:'ironsword',
                            stackSize:1,
                            equipable:true
                        }
                    }
                ],
                [
                    'Iron Hammer', 
                    {
                        recipe:[
                            {id:'iron', count:20},
                            {id:'stone', count:15},
                        ],
                        output:{
                            count:1,
                            image:'ironhammer',
                            stackSize:1,
                            equipable:true
                        }
                    }
                ],
                [
                    'Gold Axe', 
                    {
                        recipe:[
                            {id:'gold', count:20},
                            {id:'iron', count:10}
                        ],
                        output:{
                            count:1,
                            image:'goldaxe',
                            stackSize:1,
                            equipable:true
                        }
                    }
                ],
                [
                    'Gold Pickaxe', 
                    {
                        recipe:[
                            {id:'gold', count:20},
                            {id:'iron', count:15}
                        ],
                        output:{
                            count:1,
                            image:'goldpickaxe',
                            stackSize:1,
                            equipable:true
                        }
                    }
                ],
                [
                    'Gold Sword', 
                    {
                        recipe:[
                            {id:'gold', count:10},
                            {id:'iron', count:15},
                            {id:'stone', count:10}
                        ],
                        output:{
                            count:1,
                            image:'goldsword',
                            stackSize:1,
                            equipable:true
                        }
                    }
                ],
                [
                    'Gold Hammer', 
                    {
                        recipe:[
                            {id:'gold', count:20},
                            {id:'iron', count:15},
                        ],
                        output:{
                            count:1,
                            image:'goldhammer',
                            stackSize:1,
                            equipable:true
                        }
                    }
                ],
                [
                    'Diamond Axe', 
                    {
                        recipe:[
                            {id:'diamond', count:20},
                            {id:'iron', count:10}
                        ],
                        output:{
                            count:1,
                            image:'diamondaxe',
                            stackSize:1,
                            equipable:true
                        }
                    }
                ],
                [
                    'Diamond Pickaxe', 
                    {
                        recipe:[
                            {id:'diamond', count:20},
                            {id:'iron', count:15}
                        ],
                        output:{
                            count:1,
                            image:'diamondpickaxe',
                            stackSize:1,
                            equipable:true
                        }
                    }
                ],
                [
                    'Diamond Sword', 
                    {
                        recipe:[
                            {id:'diamond', count:10},
                            {id:'iron', count:15},
                            {id:'gold', count:10}
                        ],
                        output:{
                            count:1,
                            image:'diamondsword',
                            stackSize:1,
                            equipable:true
                        }
                    }
                ],
                [
                    'Diamond Hammer', 
                    {
                        recipe:[
                            {id:'diamond', count:20},
                            {id:'iron', count:15},
                        ],
                        output:{
                            count:1,
                            image:'diamondhammer',
                            stackSize:1,
                            equipable:true
                        }
                    }
                ],
                [
                    'Wood Wall', 
                    {
                        recipe:[
                            {id:'wood', count:20},
                        ],
                        output:{
                            count:2,
                            image:'woodwall',
                            stackSize:255,
                            equipable:true
                        }
                    }
                ],
                [
                    'Stone Wall', 
                    {
                        recipe:[
                            {id:'stone', count:20},
                            {id:'wood', count:5}
                        ],
                        output:{
                            count:1,
                            image:'stonewall',
                            stackSize:255,
                            equipable:true
                        }
                    }
                ],
                [
                    'Wood Door', 
                    {
                        recipe:[
                            {id:'wood', count:10},
                            {id:'stone', count:1},
                            {id:'iron', count:1},
                        ],
                        output:{
                            count:2,
                            image:'wooddoor',
                            stackSize:255,
                            equipable:true
                        }
                    }
                ],
                [
                    'Wood Floor', 
                    {
                        recipe:[
                            {id:'wood', count:10},
                        ],
                        output:{
                            count:4,
                            image:'woodfloor',
                            stackSize:255,
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
                inventory.forEach((slot, num) => {
                    if(slot == 'empty') return
                    if(req.count == 0) return
                    if(slot.id != req.id) return
                    slot.count -= req.count
                    console.log(item, output)
                    if(slot.count == 0)inventory.set(num, 'empty')
                })
            })
            inventory.addItem(new Slot(item, output.count, output.image, output.stackSize, output.equipable))
            //if(inventory.findKey(slot => slot == 'empty')) inventory.set(inventory.findKey(slot => slot == 'empty'), {id: 'Axe', count:1, image:'draw'})\
        }
    }
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
                ['1', new Slot('Stone Sword', 1, 'stonesword', 1, true)],
                ['2', 'empty'],
                ['3', 'empty'],
                ['4', 'empty'],
                ['5', 'empty'],
                ['6', 'empty'],
                ['7', 'empty'],
                ['8', 'empty'],
                ['9', 'empty'],
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
                        if(item.count + toAdd.count > item.stackSize && 
                            this.find(item => {
                                if(item == 'empty') return true; 
                                if(item.id == toAdd.id && item.count != item.stackSize) return true;
                                return false;
                            })
                        ){
                            toAdd.count -= (item.stackSize - item.count)
                            item.count = item.stackSize
                            found = true
                            this.addItem(toAdd)
                            return
                        }else if(item.count + toAdd.count > item.stackSize){
                            item.count = item.stackSize
                            found = true
                            return
                        }
                        item.count += toAdd.count;
                        found = true
                    }
                }
            })
            if(found) return
            if(this.find(item => item == 'empty') ) return this.set(this.findKey(item => item == 'empty'), toAdd)
        }
        addItemMax(toAdd){
            let found = false;
            let posSlots =  this.findAll(item => item.id == toAdd.id)
            let ret = true
            if(!ret) return
            while(this.find(item => {
                if(item == 'empty') return true; 
                if(item.id == toAdd.id && item.count !== item.stackSize) return true;
                return false;
            }) && toAdd.count && ret){
                let i = this.find(item => {
                    if(item == 'empty') return true; 
                    if(item.id == toAdd.id && item.count !== item.stackSize) return true;
                    return false;
                })
                if(i == 'empty'){ 
                    ret = false
                    this.set(this.findKey(item => item == 'empty'), toAdd)
                    return 

                }
                if(toAdd.count + i.count > i.stackSize){
                    toAdd.count -= (i.stackSize - i.count)
                    i.count = i.stackSize
                }else {
                    i.count += toAdd.count
                    ret = false
                }
            }
            if(ret) return toAdd
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
            let tempx = Math.getRandomInt(0, game.map.width/100 - 1) * 100 + 50
            let tempy = Math.getRandomInt(0, game.map.height/100 - 1) * 100 + 50
            let inWay = false

            Players.list.forEach(player => {
                if(Vector.getDistance({x:tempx, y:tempy}, player.body.position) <= 150) inWay = true
            })

            STrees.list.forEach(tree => {
                if(tempx == tree.body.position.x && tempy == tree.body.position.y) inWay = true
            })
            Stones.list.forEach(stone => {
                if(tempx == stone.body.position.x && tempy == stone.body.position.y) inWay = true
            })
            Irons.list.forEach(iron => {
                if(tempx == iron.body.position.x && tempy == iron.body.position.y) inWay = true
            })
            Golds.list.forEach(gold => {
                if(tempx == gold.body.position.x && tempy == gold.body.position.y) inWay = true
            })
            Diamonds.list.forEach(diamond => {
                if(tempx == diamond.body.position.x && tempy == diamond.body.position.y) inWay = true
            })
            Walls.list.forEach(wall => {
                if(tempx == wall.body.position.x && tempy == wall.body.position.y) inWay = true
            })
            Doors.list.forEach(door => {
                if(tempx == door.body.position.x && tempy == door.body.position.y) inWay = true
            })
            Floors.list.forEach(floor => {
                if(tempx == floor.body.position.x && tempy == floor.body.position.y) inWay = true
            })
            while(inWay){
                tempx = Math.getRandomInt(0, game.map.width/100 - 1) * 100 + 50
                tempy = Math.getRandomInt(0, game.map.height/100 - 1) * 100 + 50
                inWay = false

                Players.list.forEach(player => {
                    if(Vector.getDistance({x:tempx, y:tempy}, player.body.position) <= 150) inWay = true
                })

                STrees.list.forEach(tree => {
                    if(tempx == tree.body.position.x && tempy == tree.body.position.y) inWay = true
                })
                Stones.list.forEach(stone => {
                    if(tempx == stone.body.position.x && tempy == stone.body.position.y) inWay = true
                })
                Irons.list.forEach(iron => {
                    if(tempx == iron.body.position.x && tempy == iron.body.position.y) inWay = true
                })
                Golds.list.forEach(gold => {
                    if(tempx == gold.body.position.x && tempy == gold.body.position.y) inWay = true
                })
                Diamonds.list.forEach(diamond => {
                    if(tempx == diamond.body.position.x && tempy == diamond.body.position.y) inWay = true
                })
                Walls.list.forEach(wall => {
                    if(tempx == wall.body.position.x && tempy == wall.body.position.y) inWay = true
                })
                Doors.list.forEach(door => {
                    if(tempx == door.body.position.x && tempy == door.body.position.y) inWay = true
                })
                Floors.list.forEach(floor => {
                    if(tempx == floor.body.position.x && tempy == floor.body.position.y) inWay = true
                })
            }
            this.body = Bodies.circle(tempx, tempy, this.rad, {frictionAir:0.02, restitution:0.15})
            World.addBody(this.game.engine.world, this.body)
            //new Guns.types['pistol'](getRandomNum(25, 2090), getRandomNum(25,1463))
            this.inventory = new Inventory()
            this.crafter = new Crafter()
            this.mainHand = '-1'
            this.admin = false;
            this.bullets = [];
            this.score = 0
            this.alusd = false
            this.walls = []
            this.doors = []
            this.floors = []
            this.pang = 'left'
            this.punch = {
                speed: 3,
                ready:true,
                reload: {
                    speed: 20,
                    timer: 0
                },
                damage: 1/2,
                health: 1,
            }
            this.axe = {
                ready:true,
                timeout:null,
                stone:{
                    damage:3.75,
                    walldam:3,
                    mines:[{item:'wood', count:3}]
                },
                iron:{
                    damage:4.5,
                    walldam:9,
                    mines:[{item:'wood', count:5}]
                },
                gold:{
                    damage:6,
                    walldam:19,
                    mines:[{item:'wood', count:8}]
                },
                diamond:{
                    damage:7.5,
                    walldam:25,
                    mines:[{item:'wood', count:12}]
                },
            }
            this.pickaxe = {
                ready:true,
                timeout:null,
                stone:{
                    damage:3.75,
                    walldam:2,
                    mines:[{item:'stone', count:3}, {item:'iron', count:2}]
                },
                iron:{
                    damage:4,
                    walldam:6,
                    mines:[{item:'stone', count:5}, {item:'iron', count:3}, {item:'gold', count:2}, {item:'diamond', count:1}]
                },
                gold:{
                    damage:4.5,
                    walldam:8,
                    mines:[{item:'stone', count:9}, {item:'iron', count:5}, {item:'gold', count:3}, {item:'diamond', count:2}]
                },
                diamond:{
                    damage:5,
                    walldam:15,
                    mines:[{item:'stone', count:20}, {item:'iron', count:9}, {item:'gold', count:5}, {item:'diamond', count:3}]
                },
            }
            this.sword = {
                ready:true,
                timeout:null,
                stone:{
                    damage:5,
                    walldam:1,
                },
                iron:{
                    damage:7,
                    walldam:5,
                },
                gold:{
                    damage:9,
                    walldam:7
                },
                diamond:{
                    damage:12,
                    walldam:10
                },
            }
            this.hammer = {
                ready:true,
                timeout:null,
                stone:{
                    damage:4,
                    walldam:25,
                },
                iron:{
                    damage:6,
                    walldam:30,
                },
                gold:{
                    damage:7,
                    walldam:37.5
                },
                diamond:{
                    damage:8,
                    walldam:50
                },
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
                ang: 0,
                mdis:0
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
            }
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
            if(this.move.grab){
                if((dropped.length || this.doors.length) && !this.alusd){
                    let possible = new Mapper()
                    dropped.forEach((item, i)=> {
                        if(Vector.getDistance(item, this.body.position) < 32 + this.rad) possible.set(i, item)
                    })
                    let dis
                    let nearest
                    if(possible.size){
                        possible.forEach((item, index) => {
                            if(!nearest){nearest = index; dis = Vector.getDistance(item, this.body.position); return}
                            if(Vector.getDistance(item, this.body.position) < dis){dis = Vector.getDistance(item, this.body.position); nearest = index}
                        })
                    }
                    let posd = new Mapper()
                    this.doors.forEach((door, i)=> {
                        if(Vector.getDistance(door, this.body.position) < 70.7 + this.rad) posd.set(i, door)
                    })
                    let disd
                    let nearestd
                    if(posd.size){
                        posd.forEach((door, index) => {
                            if(!nearestd){nearestd = index; disd = Vector.getDistance(door, this.body.position); return}
                            if(Vector.getDistance(door, this.body.position) < disd){disd = Vector.getDistance(door, this.body.position); nearestd = index}
                        })
                    }
                    if(!posd.size && !possible.size) return
                    if(!dis || (dis > disd && !this.doors[nearestd].opening)){
                        let door = this.doors[nearestd]
                        if(door.ang == 'left' && !door.open){
                            Body.translate(door.body, Vector.create(-100, -100))
                        }
                        if(door.ang == 'up' && !door.open){
                            Body.translate(door.body, Vector.create(100, -100))
                        }
                        if(door.ang == 'right' && !door.open){
                            Body.translate(door.body, Vector.create(100, 100))
                        }
                        if(door.ang == 'down' && !door.open){
                            Body.translate(door.body, Vector.create(-100, 100))
                        }
                        if(door.open){
                            Body.translate(door.body, {x:door.x - door.body.position.x, y:door.y - door.body.position.y})
                        }
                        door.opentimeout = new Timeout(() => {door.open = !!!door.open; door.opening = false}, 1000)
                        door.opening = true
                        door.needsUpdate = true
                        this.alusd = true
                    }else if((!disd || disd > dis)){
                        let res = this.inventory.addItemMax(dropped[nearest].item)
                        if(!res) dropped.splice(nearest, 1);
                        this.needsSelfUpdate = true
                        this.alusd = true
                    }
                }
            }
            if (this.punch.reload.timer > 0) {
                this.punch.reload.timer--
            }
            if (this.inventory.get(this.mainHand) == undefined) {
                this.mainHands = 'hand'
                
            } else {
                this.mainHands = this.inventory.get(this.mainHand).id
                let toolReg = /\w+\s(Axe|Pickaxe|Sword|Hammer)/
                if(toolReg.test(this.mainHands)){
                    if(/Axe/.test(this.mainHands) && this.axe.ready && this.move.att){
                        let u
                        this.tool = 'axe'
                        if(/^Stone/.test(this.mainHands)) u = 'stone'
                        else if(/^Iron/.test(this.mainHands)) u = 'iron'
                        else if(/^Gold/.test(this.mainHands)) u = 'gold'
                        else if(/^Diamond/.test(this.mainHands)) u = 'diamond'
                        if(this.axe.timeout) clearTimeout(this.axe.timeout.timeout)
                        let axerad = this.rad/25 * 15
                        let axep = Vector.create(0, 70 * this.rad/25)
                        axep.x = Math.cos(this.move.ang * Math.PI / 180) * Vector.magnitude(axep);
                        axep.y = Math.sin(this.move.ang * Math.PI / 180) * Vector.magnitude(axep);
                        Vector.add(this.body.position, axep, axep)
                        let treetargs = []
                        let targs = []
                        let dtargs = []
                        let destargs = []
                        let stonetargs = []
                        let irontargs = []
                        let goldtargs = []
                        let diamondtargs = []
                        let walltargs = []
                        this.axe.ready = false
                        this.hitting = true
                        this.axe.timeout = new Timeout(() => {
                            this.hitting = false
                            this.axe.timeout = null
                            this.axe.ready = true
                            this.tool = null
                        }, 5000/3)
                        for (var i = 0; i < Players.list.length; i++) {
                            var p = Players.list[i]
                            if (Vector.getDistance(axep, p.body.position) < p.rad + axerad
                                  && this.id != p.id) {
                                targs.push(p)
                            }
                        }
                        for (var i = 0; i < Demons.list.length; i++) {
                            var d = Demons.list[i]
                            if (Vector.getDistance(axep, d.body.position) < d.rad + axerad) {
                                dtargs.push(d)
                            }
                        }
                        for (var i = 0; i < Destroyers.list.length; i++) {
                            var d = Destroyers.list[i]
                            if (Vector.getDistance(axep, d.body.position) < d.rad + axerad) {
                                destargs.push(d)
                            }
                        }
                        this.game.STrees.list.forEach(tree => {
                            if(Vector.getDistance(axep, tree.body.position) < axerad + 50) {
                                treetargs.push(tree)
                            }
                        })
                        this.game.Stones.list.forEach(stone => {
                            if(Vector.getDistance(axep, stone.body.position) < axerad + 50) {
                                stonetargs.push(stone)
                            }
                        })
                        this.game.Irons.list.forEach(iron => {
                            if(Vector.getDistance(axep, iron.body.position) < axerad + 50) {
                                irontargs.push(iron)
                            }
                        })
                        this.game.Golds.list.forEach(gold => {
                            if(Vector.getDistance(axep, gold.body.position) < axerad + 50) {
                                goldtargs.push(gold)
                            }
                        })
                        this.game.Diamonds.list.forEach(diamond => {
                            if(Vector.getDistance(axep, diamond) < axerad + 50) {
                                diamondtargs.push(diamond)
                            }
                        })
                        Walls.list.forEach(wall => {
                            if(Vector.getDistance(axep, wall.body.position) < axerad + 50) {
                                walltargs.push(wall)
                            }
                        })
                        Doors.list.forEach(wall => {
                            if(Vector.getDistance(axep, wall.body.position) < axerad + 50) {
                                walltargs.push(wall)
                            }
                        })
                        Floors.list.forEach(wall => {
                            if(Vector.getDistance(axep, wall.body.position) < axerad + 50) {
                                walltargs.push(wall)
                            }
                        })
                        targs.forEach( p => {
                            p.health -= this.axe[u].damage
                            if (p.health <= 0) {
                                this.score += p.score/2 + 2
                            }
                        })
                        dtargs.forEach( p => {
                            p.health -= this.axe[u].damage
                            if (p.health <= 0) {
                                this.score += 300
                            }
                        })
                        destargs.forEach( p => {
                            p.health -= this.axe[u].damage
                            if (p.health <= 0) {
                                this.score += 600
                            }
                        })
                        let self = this
                        new Timeout(() => {
                            treetargs.forEach(tree => {
                                let rem = this.inventory.addItemMax(new Slot('wood', this.axe[u].mines[0].count, 'draw', 255, false))
                                this.score += this.axe[u].mines[0].count * 1
                                if(rem){
                                    let ang = Math.getRandomNum(0, 360)
                                    let offset = Vector.create(0, 50 + 20)
                                    offset.x = Math.cos(ang * Math.PI / 180) * Vector.magnitude(offset);
                                    offset.y = Math.sin(ang * Math.PI / 180) * Vector.magnitude(offset);
                                    Vector.add(tree.body.position, offset, offset)
                                    let self = {
                                        item:rem,
                                        x:offset.x,
                                        y:offset.y, 
                                        timeout:new Timeout(() => {
                                            dropped.splice(dropped.findIndex(function (element) {
                                                return element === self
                                            }), 1);
                                        }, 5000)
                                    }
                                    dropped.push(self)
                                }
                                self.needsSelfUpdate = true
                                tree.health -= this.axe[u].walldam
                            })
                            stonetargs.forEach(stone => {
                                self.needsSelfUpdate = true
                                stone.health -= this.axe[u].walldam
                            })
                            irontargs.forEach(iron => {
                                self.needsSelfUpdate = true
                                iron.health -= this.axe[u].walldam
                            })
                            goldtargs.forEach(gold => {
                                self.needsSelfUpdate = true
                                gold.health -= this.axe[u].walldam
                            })
                            diamondtargs.forEach(diamond => {
                                self.needsSelfUpdate = true
                                diamond.health -= this.axe[u].walldam
                            })
                            walltargs.forEach(wall => {
                                self.needsSelfUpdate = true
                                wall.health -= this.axe[u].walldam
                            })
                            targs.forEach( p => {
                                p.health -= this.axe[u].damage
                                if (p.health <= 0) {
                                    this.score += p.score/2 + 2
                                }
                            })
                            dtargs.forEach( d => {
                                d.health -= this.sword[u].damage
                                if (d.health <= 0) {
                                    this.score += 300
                                }
                            })
                            destargs.forEach( d => {
                                d.health -= this.sword[u].damage
                                if (d.health <= 0) {
                                    this.score += 600
                                }
                            })
                        }, 2500/3)
                    }
                    if(/Pickaxe/.test(this.mainHands) && this.pickaxe.ready && this.move.att){
                        let u
                        this.tool = 'pickaxe'
                        if(/^Stone/.test(this.mainHands)) u = 'stone'
                        else if(/^Iron/.test(this.mainHands)) u = 'iron'
                        else if(/^Gold/.test(this.mainHands)) u = 'gold'
                        else if(/^Diamond/.test(this.mainHands)) u = 'diamond'
                        if(this.pickaxe.timeout) clearTimeout(this.pickaxe.timeout.timeout)
                        let paxerad = this.rad/25 * 30
                        let paxep = Vector.create(0, 70 * this.rad/25)
                        paxep.x = Math.cos(this.move.ang * Math.PI / 180) * Vector.magnitude(paxep);
                        paxep.y = Math.sin(this.move.ang * Math.PI / 180) * Vector.magnitude(paxep);
                        Vector.add(this.body.position, paxep, paxep)
                        let treetargs = []
                        let stonetargs = []
                        let irontargs = []
                        let goldtargs = []
                        let diamondtargs = []
                        let targs = []
                        let dtargs = []
                        let destargs = []
                        let walltargs = []
                        this.pickaxe.ready = false
                        this.hitting = true
                        this.pickaxe.timeout = new Timeout(() => {
                            this.hitting = false
                            this.pickaxe.timeout = null
                            this.pickaxe.ready = true
                            this.tool = null
                        }, 5000/3)
                        for (var i = 0; i < Players.list.length; i++) {
                            var p = Players.list[i]
                            if (Vector.getDistance(paxep, p.body.position) < p.rad + paxerad
                                  && this.id != p.id) {
                                targs.push(p)
                            }
                        }
                        for (var i = 0; i < Demons.list.length; i++) {
                            var d = Demons.list[i]
                            if (Vector.getDistance(paxep, d.body.position) < d.rad + paxerad) {
                                dtargs.push(d)
                            }
                        }
                        for (var i = 0; i < Destroyers.list.length; i++) {
                            var d = Destroyers.list[i]
                            if (Vector.getDistance(paxep, d.body.position) < d.rad + paxerad) {
                                destargs.push(d)
                            }
                        }
                        for (var i = 0; i < Destroyers.list.length; i++) {
                            var d = Destroyers.list[i]
                            if (Vector.getDistance(paxep, d.body.position) < d.rad + paxerad) {
                                destargs.push(d)
                            }
                        }
                        this.game.STrees.list.forEach(tree => {
                            if(Vector.getDistance(paxep, tree.body.position) < paxerad + 50) {
                                treetargs.push(tree)
                            }
                        })
                        this.game.Stones.list.forEach(stone => {
                            if(Vector.getDistance(paxep, stone.body.position) < paxerad + 50) {
                                stonetargs.push(stone)
                            }
                        })
                        this.game.Irons.list.forEach(iron => {
                            if(Vector.getDistance(paxep, iron.body.position) < paxerad + 50) {
                                irontargs.push(iron)
                            }
                        })
                        this.game.Golds.list.forEach(gold => {
                            if(Vector.getDistance(paxep, gold.body.position) < paxerad + 50) {
                                goldtargs.push(gold)
                            }
                        })
                        this.game.Diamonds.list.forEach(diamond => {
                            if(Vector.getDistance(paxep, diamond.body.position) < paxerad + 50) {
                                diamondtargs.push(diamond)
                            }
                        })
                        Walls.list.forEach(wall => {
                            if(Vector.getDistance(paxep, wall.body.position) < paxerad + 50) {
                                walltargs.push(wall)
                            }
                        })
                        Doors.list.forEach(wall => {
                            if(Vector.getDistance(paxep, wall.body.position) < paxerad + 50) {
                                walltargs.push(wall)
                            }
                        })
                        Floors.list.forEach(wall => {
                            if(Vector.getDistance(paxep, wall.body.position) < paxerad + 50) {
                                walltargs.push(wall)
                            }
                        })
                        let self = this
                        new Timeout(() => {
                            targs.forEach( p => {
                                p.health -= this.pickaxe[u].damage
                                if (p.health <= 0) {
                                    this.score += p.score/2 + 2
                                }
                            })
                            dtargs.forEach( p => {
                                p.health -= this.pickaxe[u].damage
                                if (p.health <= 0) {
                                    this.score += 300
                                }
                            })
                            destargs.forEach( p => {
                                p.health -= this.pickaxe[u].damage
                                if (p.health <= 0) {
                                    this.score += 600
                                }
                            })
                            self.needsSelfUpdate = true
                            treetargs.forEach(tree => {
                                self.needsSelfUpdate = true
                                tree.health -= this.axe[u].walldam
                            })
                            stonetargs.forEach(stone => {
                                let rem = this.inventory.addItemMax(new Slot('stone', this.pickaxe[u].mines[0].count, 'stone', 255, false));
                                this.score += 3 * this.pickaxe[u].mines[0].count
                                if(rem){
                                    let ang = Math.getRandomNum(0, 360)
                                    let offset = Vector.create(0, 50 + 20)
                                    offset.x = Math.cos(ang * Math.PI / 180) * Vector.magnitude(offset);
                                    offset.y = Math.sin(ang * Math.PI / 180) * Vector.magnitude(offset);
                                    Vector.add(stone.body.position, offset, offset)
                                    let self = {
                                        item:rem,
                                        x:offset.x,
                                        y:offset.y, 
                                        timeout:new Timeout(() => {
                                            dropped.splice(dropped.findIndex(function (element) {
                                                return element === self
                                            }), 1);
                                        }, 5000)
                                    }
                                    dropped.push(self)
                                }
                                stone.health -= this.pickaxe[u].walldam
                            })
                            irontargs.forEach(iron => {
                                let rem = this.inventory.addItemMax(new Slot('iron', this.pickaxe[u].mines[1].count, 'iron', 255, false));
                                this.score += 8 * this.pickaxe[u].mines[1].count
                                if(rem){
                                    let ang = Math.getRandomNum(0, 360)
                                    let offset = Vector.create(0, 50 + 20)
                                    offset.x = Math.cos(ang * Math.PI / 180) * Vector.magnitude(offset);
                                    offset.y = Math.sin(ang * Math.PI / 180) * Vector.magnitude(offset);
                                    Vector.add(iron.body.position, offset, offset)
                                    let self = {
                                        item:rem,
                                        x:offset.x,
                                        y:offset.y, 
                                        timeout:new Timeout(() => {
                                            dropped.splice(dropped.findIndex(function (element) {
                                                return element === self
                                            }), 1);
                                        }, 5000)
                                    }
                                    dropped.push(self)
                                }
                                iron.health -= this.pickaxe[u].walldam
                            })
                            if(u == 'stone') return
                            goldtargs.forEach(gold => {
                                let rem = this.inventory.addItemMax(new Slot('gold', this.pickaxe[u].mines[2].count, 'gold', 255, false));
                                this.score += 16 * this.pickaxe[u].mines[2].count
                                if(rem){
                                    let ang = Math.getRandomNum(0, 360)
                                    let offset = Vector.create(0, 50 + 20)
                                    offset.x = Math.cos(ang * Math.PI / 180) * Vector.magnitude(offset);
                                    offset.y = Math.sin(ang * Math.PI / 180) * Vector.magnitude(offset);
                                    Vector.add(gold.body.position, offset, offset)
                                    let self = {
                                        item:rem,
                                        x:offset.x,
                                        y:offset.y, 
                                        timeout:new Timeout(() => {
                                            dropped.splice(dropped.findIndex(function (element) {
                                                return element === self
                                            }), 1);
                                        }, 5000)
                                    }
                                    dropped.push(self)
                                }
                                gold.health -= this.pickaxe[u].walldam
                            })
                            diamondtargs.forEach(diamond => {
                                let rem = this.inventory.addItemMax(new Slot('diamond', this.pickaxe[u].mines[3].count, 'diamond', 255, false));
                                this.score += 30 * this.pickaxe[u].mines[3].count
                                if(rem){
                                    let ang = Math.getRandomNum(0, 360)
                                    let offset = Vector.create(0, 50 + 20)
                                    offset.x = Math.cos(ang * Math.PI / 180) * Vector.magnitude(offset);
                                    offset.y = Math.sin(ang * Math.PI / 180) * Vector.magnitude(offset);
                                    Vector.add(diamond.body.position, offset, offset)
                                    let self = {
                                        item:rem,
                                        x:offset.x,
                                        y:offset.y, 
                                        timeout:new Timeout(() => {
                                            dropped.splice(dropped.findIndex(function (element) {
                                                return element === self
                                            }), 1);
                                        }, 5000)
                                    }
                                    dropped.push(self)
                                }
                                diamond.health -= this.pickaxe[u].walldam
                            })
                            walltargs.forEach(wall => {
                                self.needsSelfUpdate = true
                                wall.health -= this.pickaxe[u].walldam
                            })
                        }, 2500/3)
                    }
                    if(/Sword/.test(this.mainHands) && this.sword.ready && this.move.att){
                        let u
                        this.tool = 'sword'
                        if(/^Stone/.test(this.mainHands)) u = 'stone'
                        else if(/^Iron/.test(this.mainHands)) u = 'iron'
                        else if(/^Gold/.test(this.mainHands)) u = 'gold'
                        else if(/^Diamond/.test(this.mainHands)) u = 'diamond'
                        if(this.sword.timeout) clearTimeout(this.swor.timeout.timeout)
                        let saxerad = this.rad/25 * 30
                        let saxep = Vector.create(0, 70 * this.rad/25)
                        saxep.x = Math.cos(this.move.ang * Math.PI / 180) * 70 * this.rad/25;
                        saxep.y = Math.sin(this.move.ang * Math.PI / 180) * 70 * this.rad/25;
                        Vector.add(this.body.position, saxep, saxep)
                        let targs = []
                        let dtargs = []
                        let destargs = []
                        this.sword.ready = false
                        this.hitting = true
                        this.sword.timeout = new Timeout(() => {
                            this.hitting = false
                            this.sword.timeout = null
                            this.sword.ready = true
                            this.tool = null
                        }, 5000/3)
                        for (var i = 0; i < Players.list.length; i++) {
                            var p = Players.list[i]
                            if (Vector.getDistance(saxep, p.body.position) < p.rad + saxerad
                                  && this.id != p.id) {
                                targs.push(p)
                            }
                        }
                        for (var i = 0; i < Demons.list.length; i++) {
                            var d = Demons.list[i]
                            if (Vector.getDistance(saxep, d.body.position) < d.rad + saxerad) {
                                dtargs.push(d)
                            }
                        }
                        for (var i = 0; i < Destroyers.list.length; i++) {
                            var d = Destroyers.list[i]
                            if (Vector.getDistance(saxep, d.body.position) < d.rad + saxerad) {
                                destargs.push(d)
                            }
                        }
                        let self = this
                        new Timeout(() => {
                            targs.forEach( p => {
                                p.health -= this.sword[u].damage
                                if (p.health <= 0) {
                                    this.score += p.score/2 + 2
                                }
                            })
                            dtargs.forEach( d => {
                                d.health -= this.sword[u].damage
                                if (d.health <= 0) {
                                    this.score += 300
                                }
                            })
                            destargs.forEach( d => {
                                d.health -= this.sword[u].damage
                                if (d.health <= 0) {
                                    this.score += 600
                                }
                            })
                        }, 2500/3)
                    }
                    if(/Hammer/.test(this.mainHands) && this.hammer.ready && this.move.att){
                        let u
                        this.tool = 'hammer'
                        if(/^Stone/.test(this.mainHands)) u = 'stone'
                        else if(/^Iron/.test(this.mainHands)) u = 'iron'
                        else if(/^Gold/.test(this.mainHands)) u = 'gold'
                        else if(/^Diamond/.test(this.mainHands)) u = 'diamond'
                        if(this.hammer.timeout) clearTimeout(this.hammer.timeout.timeout)
                        let axerad = this.rad/25 * 15
                        let axep = Vector.create(0, 70 * this.rad/25)
                        axep.x = Math.cos(this.move.ang * Math.PI / 180) * Vector.magnitude(axep);
                        axep.y = Math.sin(this.move.ang * Math.PI / 180) * Vector.magnitude(axep);
                        Vector.add(this.body.position, axep, axep)
                        let treetargs = []
                        let stonetargs = []
                        let irontargs = []
                        let goldtargs = []
                        let diamondtargs = []
                        let targs = []
                        let dtargs = []
                        let walltargs = []
                        this.hammer.ready = false
                        this.hitting = true
                        this.hammer.timeout = new Timeout(() => {
                            this.hitting = false
                            this.hammer.timeout = null
                            this.hammer.ready = true
                            this.tool = null
                        }, 5000/3)
                        for (var i = 0; i < Players.list.length; i++) {
                            var p = Players.list[i]
                            if (Vector.getDistance(axep, p.body.position) < p.rad + axerad
                                  && this.id != p.id) {
                                targs.push(p)
                            }
                        }
                        for (var i = 0; i < Demons.list.length; i++) {
                            var d = Demons.list[i]
                            if (Vector.getDistance(axep, d.body.position) < d.rad + axerad) {
                                dtargs.push(d)
                            }
                        }
                        this.game.STrees.list.forEach(tree => {
                            if(Vector.getDistance(axep, tree) < axerad + 50) {
                                treetargs.push(tree)
                            }
                        })
                        this.game.Stones.list.forEach(stone => {
                            if(Vector.getDistance(axep, stone.body.position) < axerad + 50) {
                                stonetargs.push(stone)
                            }
                        })
                        this.game.Irons.list.forEach(iron => {
                            if(Vector.getDistance(axep, iron.body.position) < axerad + 50) {
                                irontargs.push(iron)
                            }
                        })
                        this.game.Golds.list.forEach(gold => {
                            if(Vector.getDistance(axep, gold.body.position) < axerad + 50) {
                                goldtargs.push(gold)
                            }
                        })
                        this.game.Diamonds.list.forEach(diamond => {
                            if(Vector.getDistance(axep, diamond.body.position) < axerad + 50) {
                                diamondtargs.push(diamond)
                            }
                        })
                        Walls.list.forEach(wall => {
                            if(Vector.getDistance(axep, wall.body.position) < axerad + 50) {
                                walltargs.push(wall)
                            }
                        })
                        Doors.list.forEach(wall => {
                            if(Vector.getDistance(axep, wall.body.position) < axerad + 50) {
                                walltargs.push(wall)
                            }
                        })
                        Floors.list.forEach(wall => {
                            if(Vector.getDistance(axep, wall.body.position) < axerad + 50) {
                                walltargs.push(wall)
                            }
                        })
                        let self = this
                        new Timeout(() => {
                            treetargs.forEach(tree => {
                                self.needsSelfUpdate = true
                                tree.health -= this.hammer[u].walldam
                            })
                            stonetargs.forEach(stone => {
                                self.needsSelfUpdate = true
                                stone.health -= this.hammer[u].walldam
                            })
                            irontargs.forEach(iron => {
                                self.needsSelfUpdate = true
                                iron.health -= this.hammer[u].walldam
                            })
                            goldtargs.forEach(gold => {
                                self.needsSelfUpdate = true
                                gold.health -= this.hammer[u].walldam
                            })
                            diamondtargs.forEach(diamond => {
                                self.needsSelfUpdate = true
                                diamond.health -= this.hammer[u].walldam
                            })
                            walltargs.forEach(wall => {
                                self.needsSelfUpdate = true
                                wall.health -= this.hammer[u].walldam
                            })
                            targs.forEach( p => {
                                p.health -= this.hammer[u].damage
                                if (p.health <= 0) {
                                    this.score += p.score/2 + 2
                                }
                            })
                            dtargs.forEach( d => {
                                d.health -= this.sword[u].damage
                                if (d.health <= 0) {
                                    this.score += 300
                                }
                            })
                        }, 2500/3)
                    }
                }
                if(/Wall|Floor|Door/.test(this.mainHands)){
                    let mvect
                    if(this.move.mdis > 141.42 + this.rad){
                        mvect = Vector.create()
                        mvect.x = Math.cos(this.move.ang * Math.PI / 180) * (141.42);
                        mvect.y = Math.sin(this.move.ang * Math.PI / 180) * (141.42);
                        Vector.add(mvect, this.body.position, mvect)
                    }else {
                        mvect = Vector.create()
                        mvect.x = Math.cos(this.move.ang * Math.PI / 180) * (this.move.mdis);
                        mvect.y = Math.sin(this.move.ang * Math.PI / 180) * (this.move.mdis);
                        Vector.add(mvect, this.body.position, mvect)
                    }
                    mvect.y = Math.floor(mvect.y/100) * 100 + 50
                    mvect.x = Math.floor(mvect.x/100) * 100 + 50
                    this.posPlace = mvect
                    this.needsSelfUpdate = true
                    if(/Wall/.test(this.mainHands) && this.move.att && !this.alusd){
                        mvect.y = Math.floor(mvect.y/100) * 100 + 50
                        mvect.x = Math.floor(mvect.x/100) * 100 + 50
                        if(Players.list.find(player => Vector.getDistance(player.body.position, mvect) < 70.7106781187 + player.rad)) return
                        if(Demons.list.find(demon => Vector.getDistance(demon.body.position, mvect) < 70.7106781187 + demon.rad)) return
                        if(Destroyers.list.find(des => Vector.getDistance(des.body.position, mvect) < 70.7106781187 + des.rad)) return
                        if(STrees.list.find(tree => tree.body.position.x == mvect.x && tree.body.position.y == mvect.y)) return
                        if(Stones.list.find(stone => stone.body.position.x == mvect.x && stone.body.position.y == mvect.y)) return
                        if(Irons.list.find(iron => iron.body.position.x == mvect.x && iron.body.position.y == mvect.y)) return
                        if(Golds.list.find(gold => gold.body.position.x == mvect.x && gold.body.position.y == mvect.y)) return
                        if(Diamonds.list.find(diamond => diamond.body.position.x == mvect.x && diamond.body.position.y == mvect.y)) return
                        if(Walls.list.find(wall => wall.body.position.x == mvect.x && wall.body.position.y == mvect.y)) return
                        if(Doors.list.find(door => door.body.position.x == mvect.x && door.body.position.y == mvect.y)) return
                        if(Floors.list.find(floor => floor.body.position.x == mvect.x && floor.body.position.y == mvect.y && !this.floors.find(f => f == floor))) return
                        if(mvect.x < 50 || mvect.y < 50 || mvect.x > game.map.width || mvect.y > game.map.height ) return
                        let slot = this.inventory.get(this.mainHand)
                        slot.count -= 1
                        if(slot.count == 0){ this.inventory.set(this.mainHand, 'empty'); this.mainHand = '-1'}
                        this.needsSelfUpdate = true
                        if(/Wood/.test(this.mainHands)) this.walls.push(new Wall(mvect.x, mvect.y, 'wood'))
                        if(/Stone/.test(this.mainHands)) this.walls.push(new Wall(mvect.x, mvect.y, 'stone'))
                        if(/Iron/.test(this.mainHands)) this.walls.push(new Wall(mvect.x, mvect.y, 'iron'))
                        this.alusd = true
                    }
                    if(/Door/.test(this.mainHands) && this.move.att && !this.alusd){
                        mvect.y = Math.floor(mvect.y/100) * 100 + 50
                        mvect.x = Math.floor(mvect.x/100) * 100 + 50
                        if(Players.list.find(player => Vector.getDistance(player.body.position, mvect) < 70.7106781187 + player.rad)) return
                        if(Demons.list.find(demon => Vector.getDistance(demon.body.position, mvect) < 70.7106781187 + demon.rad)) return
                        if(Destroyers.list.find(des => Vector.getDistance(des.body.position, mvect) < 70.7106781187 + des.rad)) return
                        if(STrees.list.find(tree => tree.body.position.x == mvect.x && tree.body.position.y == mvect.y)) return
                        if(Stones.list.find(stone => stone.body.position.x == mvect.x && stone.body.position.y == mvect.y)) return
                        if(Irons.list.find(iron => iron.body.position.x == mvect.x && iron.body.position.y == mvect.y)) return
                        if(Golds.list.find(gold => gold.body.position.x == mvect.x && gold.body.position.y == mvect.y)) return
                        if(Diamonds.list.find(diamond => diamond.body.position.x == mvect.x && diamond.body.position.y == mvect.y)) return
                        if(Walls.list.find(wall => wall.body.position.x == mvect.x && wall.body.position.y == mvect.y)) return
                        if(Doors.list.find(door => door.body.position.x == mvect.x && door.body.position.y == mvect.y)) return
                        if(Floors.list.find(floor => floor.body.position.x == mvect.x && floor.body.position.y == mvect.y && !this.floors.find(f => f == floor))) return
                        if(mvect.x < 50 || mvect.y < 50 || mvect.x > game.map.width || mvect.y > game.map.height ) return
                        let slot = this.inventory.get(this.mainHand)
                        slot.count -= 1
                        if(slot.count == 0){ this.inventory.set(this.mainHand, 'empty'); this.mainHand = '-1'}
                        this.needsSelfUpdate = true
                        if(/Wood/.test(this.mainHands)) this.doors.push(new Door(mvect.x, mvect.y, 'wood', this.pang))
                        if(/Stone/.test(this.mainHands)) this.doors.push(new Door(mvect.x, mvect.y, 'stone', this.pang))
                        if(/Iron/.test(this.mainHands)) this.doors.push(new Door(mvect.x, mvect.y, 'iron', this.pang))
                        this.alusd = true
                    }
                    if(/Floor/.test(this.mainHands) && this.move.att && !this.alusd){
                        mvect.y = Math.floor(mvect.y/100) * 100 + 50
                        mvect.x = Math.floor(mvect.x/100) * 100 + 50
                        if(Players.list.find(player => Vector.getDistance(player.body.position, mvect) < 70.7106781187 + player.rad && player != this)) return
                        if(Demons.list.find(demon => Vector.getDistance(demon.body.position, mvect) < 70.7106781187 + demon.rad)) return
                        if(Destroyers.list.find(des => Vector.getDistance(des.body.position, mvect) < 70.7106781187 + des.rad)) return
                        if(STrees.list.find(tree => tree.body.position.x == mvect.x && tree.body.position.y == mvect.y)) return
                        if(Stones.list.find(stone => stone.body.position.x == mvect.x && stone.body.position.y == mvect.y)) return
                        if(Irons.list.find(iron => iron.body.position.x == mvect.x && iron.body.position.y == mvect.y)) return
                        if(Golds.list.find(gold => gold.body.position.x == mvect.x && gold.body.position.y == mvect.y)) return
                        if(Diamonds.list.find(diamond => diamond.body.position.x == mvect.x && diamond.body.position.y == mvect.y)) return
                        if(Walls.list.find(wall => wall.body.position.x == mvect.x && wall.body.position.y == mvect.y && !this.walls.find(w => w == wall))) return
                        if(Doors.list.find(door => door.body.position.x == mvect.x && door.body.position.y == mvect.y && !this.doors.find(d => d == door))) return
                        if(Floors.list.find(floor => floor.body.position.x == mvect.x && floor.body.position.y == mvect.y)) return
                        if(mvect.x < 50 || mvect.y < 50 || mvect.x > game.map.width || mvect.y > game.map.height ) return
                        let slot = this.inventory.get(this.mainHand)
                        slot.count -= 1
                        if(slot.count == 0){ this.inventory.set(this.mainHand, 'empty'); this.mainHand = '-1'}
                        this.needsSelfUpdate = true
                        if(/Wood/.test(this.mainHands)) this.floors.push(new Floor(mvect.x, mvect.y, 'wood'))
                        if(/Stone/.test(this.mainHands)) this.floors.push(new Floor(mvect.x, mvect.y, 'stone'))
                        if(/Iron/.test(this.mainHands)) this.floors.push(new Floor(mvect.x, mvect.y, 'iron'))
                        this.alusd = true
                    }
                }
            }
            if (this.move.att) {
                if (this.inventory.get(this.mainHand) == undefined) {
                    this.hit()
                }
            }
        }
        hit(){        
            if (this.punch.ready) {
                //if(this.punch.timeout) clearTimeout(this.punch.timeout.timeout)
                this.punch.ready = false
                let dtargs = []
                let destargs = []
                let targs = []
                let walltargs = []
                let treetargs = []
                let stonetargs = []
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
                        targs.push(p)
                    }
                }
                for (var i = 0; i < Demons.list.length; i++) {
                    var d = Demons.list[i]
                    if ((
                        Vector.getDistance(this.hposfr, d.body.position) < d.rad + this.hrad || 
                        Vector.getDistance(this.hposfl, d.body.position) < d.rad + this.hrad) && this.id != d.id) {
                        dtargs.push(d)
                    }
                }
                for (var i = 0; i < Destroyers.list.length; i++) {
                    var d = Destroyers.list[i]
                    if ((
                        Vector.getDistance(this.hposfr, d.body.position) < d.rad + this.hrad || 
                        Vector.getDistance(this.hposfl, d.body.position) < d.rad + this.hrad) && this.id != d.id) {
                        destargs.push(d)
                    }
                }
                this.game.STrees.list.forEach(tree => {
                    if ((Vector.getDistance(
                        this.hposfr, {x: tree.x, y:tree.y}) < this.hrad - 50 || 
                        Vector.getDistance(this.hposfl, {x: tree.x, y:tree.y}) < this.hrad + 50)) {
                        treetargs.push(tree)
                    }
                })
                
                this.game.Stones.list.forEach(stone => {
                    if ((Vector.getDistance(
                        this.hposfr, {x: stone.x, y:stone.y}) < this.hrad + 50 || 
                        Vector.getDistance(this.hposfl, {x: stone.x, y:stone.y}) < this.hrad + 50)) {
                        stonetargs.push(stone)
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
                
                setTimeout(() => {
                    targs.forEach( p => {
                        p.health -= this.punch.damage
                        if (p.health <= 0) {
                            this.score += p.score/2 + 2
                        }
                    })
                    dtargs.forEach( d => {
                        d.health -= this.punch.damage
                        if (d.health <= 0) {
                            this.score += 300
                        }
                    })
                    destargs.forEach( d => {
                        d.health -= this.punch.damage
                        if (d.health <= 0) {
                            this.score += 600
                        }
                    })
                    treetargs.forEach(tree => {
                        let rem = this.inventory.addItemMax(new Slot('wood', 1, 'draw', 255, false))
                        this.score += 1
                        if(rem){
                            let ang = Math.getRandomNum(0, 360)
                            let offset = Vector.create(0, 50 + 20)
                            offset.x = Math.cos(ang * Math.PI / 180) * Vector.magnitude(offset);
                            offset.y = Math.sin(ang * Math.PI / 180) * Vector.magnitude(offset);
                            Vector.add(tree.body.position, offset, offset)
                            let self = {
                                item:rem,
                                x:offset.x,
                                y:offset.y, 
                                timeout:new Timeout(() => {
                                    dropped.splice(dropped.findIndex(function (element) {
                                        return element === self
                                    }), 1);
                                }, 5000)
                            }
                            dropped.push(self)
                        }
                        this.needsSelfUpdate = true;
                    })
                    stonetargs.forEach(stone => {
                        let rem = this.inventory.addItemMax(new Slot('stone', 1, 'stone', 255, false));
                        this.score += 3 
                        if(rem){
                            let ang = Math.getRandomNum(0, 360)
                            let offset = Vector.create(0, 50 + 20)
                            offset.x = Math.cos(ang * Math.PI / 180) * Vector.magnitude(offset);
                            offset.y = Math.sin(ang * Math.PI / 180) * Vector.magnitude(offset);
                            Vector.add(stone.body.position, offset, offset)
                            let self = {
                                item:rem,
                                x:offset.x,
                                y:offset.y, 
                                timeout:new Timeout(() => {
                                    dropped.splice(dropped.findIndex(function (element) {
                                        return element === self
                                    }), 1);
                                }, 5000)
                            }
                            dropped.push(self)
                        }
                        this.needsSelfUpdate = true
                    })
                }, 750/3)
                
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
            if(this.hitting && this.mainHands != 'hand') pack.per = Math.roundToDeci(this[this.tool].timeout.percntDone, 1000) > 0.97 ? 1 : Math.roundToDeci(this[this.tool].timeout.percntDone, 1000)
            return pack
        }
        getSelfUpdatePack() {
          return {
               inventory:this.inventory.listItems(),
               stamina:this.stamina,
               maxStamina:this.maxStamina,
               craftables:this.crafter.checkCraft(this.inventory),
               posPlace:this.posPlace
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
    class Demon extends EventEmitter{
        /**
         * @param {String} id 
         * @param {String} usr 
         */
        constructor(x, y) {
            super()
            this.rad = 30
            this.id = Math.random()
            this.body = Bodies.circle(x, y, this.rad, {frictionAir:0.02, restitution:0.15})
            World.addBody(engine.world, this.body)
            this.bullets = [];
            this.punch = {
                speed: 3,
                ready:true,
                reload: {
                    speed: 20,
                    timer: 0
                },
                damage: 2,
                health: 1,
            }
            this.hands = {
                l: {
                    hit: false,
                },
                r: {
                    hit: false,
                }
            }
            this.move = {
                r: false,
                l: false,
                u: false,
                d: false,
                att: false,
                run:false,
                ang: 0,
                mdis:0
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
            this.maxSpd = 4;
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
            /*this.afkTimer = setTimeout(function () {
                self.dead = true
                setInterval(function () {
                    self.health -= self.maxHealth / 100
                }, 100)
            }, 10000);*/
            this.dead = false;
            initPack.demon.push({
                x: this.body.position.x,
                y: this.body.position.y,
                id: this.id,
                angle: this.move.ang,
                lhit: this.lhit,
                rhit: this.rhit
            })
            Demons.list.push(this);
        }
        updatePath() {
            let possible = new Mapper()
            Players.list.forEach((player, i)=> {
                if(Vector.getDistance(player.body.position, this.body.position) < 700 + this.rad && player.score > 750) possible.set(i, player)
            })
            let dis
            let nearest
            if(possible.size){
                possible.forEach((player, index) => {
                    if(!nearest){nearest = index; dis = Vector.getDistance(player.body.position, this.body.position); return}
                    if(Vector.getDistance(player.body.position, this.body.position) < dis){dis = Vector.getDistance(player.body.position, this.body.position); nearest = index}
                })
            }
            if(!possible.get(nearest)) return this.path = null
            let grid = new PF.Grid(game.map.width/100, game.map.width/100)
            let finder = new PF.AStarFinder()
            STrees.list.forEach(tree => grid.setWalkableAt((tree.x - 50)/100, (tree.y - 50)/100, false))
            Stones.list.forEach(tree => grid.setWalkableAt((tree.x - 50)/100, (tree.y - 50)/100, false))
            Irons.list.forEach(tree => grid.setWalkableAt((tree.x - 50)/100, (tree.y - 50)/100, false))
            Golds.list.forEach(tree => grid.setWalkableAt((tree.x - 50)/100, (tree.y - 50)/100, false))
            Diamonds.list.forEach(tree => grid.setWalkableAt((tree.x - 50)/100, (tree.y - 50)/100, false))
            
            let x = Math.roundToDeca(this.body.position.x - 50, 100)/100
            let y = Math.roundToDeca(this.body.position.y - 50, 100)/100
            let fx = Math.roundToDeca(possible.get(nearest).body.position.x - 50, 100)/100
            let fy = Math.roundToDeca(possible.get(nearest).body.position.y - 50, 100)/100
            this.pos = possible.get(nearest)
            if(x > game.map.width/100 - 1|| y > game.map.width/100 - 1 || fx > game.map.width/100 - 1|| fy > game.map.width/100 - 1 || 
            x < 0 || y < 0 || fx < 0 || fy < 0) return this.path = null
            this.path = finder.findPath(x, y, fx, fy, grid)
            this.curr = 0
        }
        updateSpd() {
          if(!this.path) this.updatePath()
          if(!this.path) return
          this.move.ang = Math.atan2(this.pos.body.position.y - this.body.position.y, this.pos.body.position.x - this.body.position.x) * 180 / Math.PI
          var m = this.move
          let path = this.path.map(pos => ({x:100 * pos[0] + 50, y: 100 * pos[1] + 50}))
          let n = path[this.curr]
          if(!n || this.pos.health <= 0 || Vector.getDistance(this.pos.body.position, path[path.length - 1]) > 500) this.updatePath()
          if(!this.path) return
          path = this.path.map(pos => ({x:100 * pos[0] + 50, y: 100 * pos[1] + 50}))
          n = path[this.curr]
          if(Vector.getDistance(this.body.position, this.pos.body.position) < 35.34119409414458 + this.rad + this.rad) this.move.att = true
          else this.move.att = false
          if(!this.path) return
          this.acc = Vector.create(0, 0)
         
          if(this.body.position.x < n.x) this.acc.x += this.maxSpd/3500
          if(this.body.position.x > n.x) this.acc.x -= this.maxSpd/3500
          if(this.body.position.y < n.y) this.acc.y += this.maxSpd/3500
          if(this.body.position.y > n.y) this.acc.y -= this.maxSpd/3500
          if(Vector.getDistance(this.body.position, n) < 70.7 + this.rad) this.curr++
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
            }
            this.health += this.maxStamina/50/60
            if(this.stamina > this.maxStamina) this.stamina = this.maxStamina
            if(this.health > this.maxHealth) this.health = this.maxHealth
            this.updateSpd();
            if(Vector.magnitude(this.body.velocity) > this.maxSpd) Vector.mult(Vector.normalise(this.body.velocity), {x:this.maxSpd, y:this.maxSpd}, this.body.velocity)            
            this.targets = []
            if (this.punch.reload.timer > 0) {
                this.punch.reload.timer--
            } 
            if (this.move.att) {
                    this.hit()
            }
        }
        hit(){        
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
                        Vector.getDistance(this.body.position, p.body.position) < 35.34119409414458 + p.rad + this.hrad || 
                        Vector.getDistance(this.body.position, p.body.position) < 35.34119409414458 + p.rad + this.hrad) && this.id != p.id) {
                        this.targets.push(p)
                    }
                }
               
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
            }
        }
        getUpdatePack() {
            var pack = {
                x: this.body.position.x,
                y: this.body.position.y,
                id: this.id,
                angle: this.move.ang,
                lhit: this.lhit,
                rhit: this.rhit,
            }
            if(this.punch.timeout) pack.punchper = Math.roundToDeci(this.punch.timeout.percntDone, 1000) > 0.95 ? 1 : Math.roundToDeci(this.punch.timeout.percntDone, 1000)
            return pack
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
    class Destroyer extends EventEmitter{
        /**
         * @param {String} id 
         * @param {String} usr 
         */
        constructor(x, y) {
            super()
            this.rad = 50
            this.id = Math.random()
            this.body = Bodies.circle(x, y, this.rad, {frictionAir:0.00, restitution:1})
            World.addBody(engine.world, this.body)
            this.bullets = [];
            this.punch = {
                speed: 3,
                ready:true,
                reload: {
                    speed: 20,
                    timer: 0
                },
                damage: 6,
                health: 1,
            }
            this.hands = {
                l: {
                    hit: false,
                },
                r: {
                    hit: false,
                }
            }
            this.move = {
                r: false,
                l: false,
                u: false,
                d: false,
                att: false,
                run:false,
                ang: 0,
                mdis:0
            }
            this.hlen = 35.34119409414458 * this.rad/30
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
            this.maxSpd = 1.5;
            this.health = 5;
            this.maxHealth = 30;
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
            /*this.afkTimer = setTimeout(function () {
                self.dead = true
                setInterval(function () {
                    self.health -= self.maxHealth / 100
                }, 100)
            }, 10000);*/
            this.dead = false;
            initPack.destroyer.push({
                x: this.body.position.x,
                y: this.body.position.y,
                id: this.id,
                angle: this.move.ang,
                lhit: this.lhit,
                rhit: this.rhit
            })
            Destroyers.list.push(this);
        }
        updatePath() {
            let possible = new Mapper()
            Players.list.forEach((player, i)=> {
                if(Vector.getDistance(player.body.position, this.body.position) < 700 + this.rad && player.score > 1500) possible.set(i, player)
            })
            let dis
            let nearest
            if(possible.size){
                possible.forEach((player, index) => {
                    if(!nearest){nearest = index; dis = Vector.getDistance(player.body.position, this.body.position); return}
                    if(Vector.getDistance(player.body.position, this.body.position) < dis){dis = Vector.getDistance(player.body.position, this.body.position); nearest = index}
                })
            }
            if(!possible.get(nearest)) return this.path = null
            let grid = new PF.Grid(game.map.width/100, game.map.width/100)
            let finder = new PF.AStarFinder()
            STrees.list.forEach(tree => grid.setWalkableAt((tree.x - 50)/100, (tree.y - 50)/100, false))
            Stones.list.forEach(tree => grid.setWalkableAt((tree.x - 50)/100, (tree.y - 50)/100, false))
            Irons.list.forEach(tree => grid.setWalkableAt((tree.x - 50)/100, (tree.y - 50)/100, false))
            Golds.list.forEach(tree => grid.setWalkableAt((tree.x - 50)/100, (tree.y - 50)/100, false))
            Diamonds.list.forEach(tree => grid.setWalkableAt((tree.x - 50)/100, (tree.y - 50)/100, false))
            
            let x = Math.roundToDeca(this.body.position.x - 50, 100)/100
            let y = Math.roundToDeca(this.body.position.y - 50, 100)/100
            let fx = Math.roundToDeca(possible.get(nearest).body.position.x - 50, 100)/100
            let fy = Math.roundToDeca(possible.get(nearest).body.position.y - 50, 100)/100
            this.pos = possible.get(nearest)
            if(x > game.map.width/100 - 1|| y > game.map.width/100 - 1 || fx > game.map.width/100 - 1|| fy > game.map.width/100 - 1 || 
            x < 0 || y < 0 || fx < 0 || fy < 0) return this.path = null
            this.path = finder.findPath(x, y, fx, fy, grid)
            this.curr = 0
        }
        updateSpd() {
          if(!this.path) this.updatePath()
          if(!this.path) return
          this.move.ang = Math.atan2(this.pos.body.position.y - this.body.position.y, this.pos.body.position.x - this.body.position.x) * 180 / Math.PI
          var m = this.move
          let path = this.path.map(pos => ({x:100 * pos[0] + 50, y: 100 * pos[1] + 50}))
          let n = path[this.curr]
          if(!n || this.pos.health <= 0 || Vector.getDistance(this.pos.body.position, path[path.length - 1]) > 500) this.updatePath()
          if(!this.path) return
          path = this.path.map(pos => ({x:100 * pos[0] + 50, y: 100 * pos[1] + 50}))
          n = path[this.curr]
          if(Vector.getDistance(this.hposfr, this.pos.body.position) < this.pos.rad + this.rad ||
            Walls.list.find( wall => Vector.getDistance(this.hposfr, wall.body.position) < 70.7 + this.hrad)) this.move.att = true
          else this.move.att = false
          if(!this.path) return
          this.acc = Vector.create(0, 0)
         
          if(this.body.position.x < n.x) this.acc.x += this.maxSpd/3500
          if(this.body.position.x > n.x) this.acc.x -= this.maxSpd/3500
          if(this.body.position.y < n.y) this.acc.y += this.maxSpd/3500
          if(this.body.position.y > n.y) this.acc.y -= this.maxSpd/3500
          if(Vector.getDistance(this.body.position, n) < 70.7 + this.rad) this.curr++
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
            }
            this.setHands()
            this.health += this.maxStamina/50/60
            if(this.stamina > this.maxStamina) this.stamina = this.maxStamina
            if(this.health > this.maxHealth) this.health = this.maxHealth
            this.updateSpd();
            if(Vector.magnitude(this.body.velocity) > this.maxSpd) Vector.mult(Vector.normalise(this.body.velocity), {x:this.maxSpd, y:this.maxSpd}, this.body.velocity)            
            this.targets = []
            if (this.punch.reload.timer > 0) {
                this.punch.reload.timer--
            } 
            if (this.move.att) {
                    this.hit()
            }
        }
        hit(){        
            if (this.punch.ready) {
                //if(this.punch.timeout) clearTimeout(this.punch.timeout.timeout)
                this.punch.ready = false
                this.punch.timeout = new Timeout(() => {
                    this.punch.timeout = null
                    this.punch.ready = true
                    this.lhit =  false
                    this.rhit = false
                }, 3000/3)
                let walltargs = []
                for (var i = 0; i < Players.list.length; i++) {
                    var p = Players.list[i]
                    if ((
                        Vector.getDistance(this.hposfr, p.body.position) < p.rad + this.hrad)) {
                        this.targets.push(p)
                        
                    }
                }
                Walls.list.forEach(wall => {
                    if(Vector.getDistance(this.hposfr, wall.body.position) < this.hrad + 50) {
                        walltargs.push(wall)
                    }
                })
                Doors.list.forEach(wall => {
                    if(Vector.getDistance(this.hposfr, wall.body.position) < this.hrad + 50) {
                        walltargs.push(wall)
                    }
                })
                Floors.list.forEach(wall => {
                    if(Vector.getDistance(this.hposfr, wall.body.position) < this.hrad + 50) {
                        walltargs.push(wall)
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
                walltargs.forEach(wall => {
                    wall.health -= 20
                })
            }
        }
        getUpdatePack() {
            var pack = {
                x: this.body.position.x,
                y: this.body.position.y,
                id: this.id,
                angle: this.move.ang,
                lhit: this.lhit,
                rhit: this.rhit,
            }
            if(this.punch.timeout) pack.punchper = Math.roundToDeci(this.punch.timeout.percntDone, 1000) > 0.95 ? 1 : Math.roundToDeci(this.punch.timeout.percntDone, 1000)
            return pack
        }
        setHands(){
            this.hrad = this.rad/25 * 7.5
            this.hposfl = Vector.create(0, -35.34119409414458 * this.rad/25)
            this.hposfl.x = Math.cos(this.move.ang * Math.PI / 180) * this.hlen;
            this.hposfl.y = Math.sin(this.move.ang * Math.PI / 180) * this.hlen;
            
            Vector.add(this.body.position, this.hposfl, this.hposfl)

            this.hposfr = Vector.create(0, -35.34119409414458 * this.rad/25)
            this.hposfr.x = Math.cos(this.move.ang * Math.PI / 180) * this.hlen;
            this.hposfr.y = Math.sin(this.move.ang * Math.PI / 180) * this.hlen;
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
                if(tree.health <= 0) {
                    removePack.tree.push(tree.id)
                    clearTimeout(tree.deathTimeout)
                    STrees.list.splice(STrees.list.findIndex(function (element) {
                        return element.id === tree.id
                    }), 1);
                    World.remove(engine.world, tree.body)
                }
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
            this.health = 50
            this.deathTimeout = setTimeout(() => {
                clearTimeout(this.growInterval)
                removePack.tree.push(this.id)
                STrees.list.splice(STrees.list.findIndex(element => element.id === this.id), 1);
                World.remove(engine.world, this.body)
            }, 300000)
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
            Stones.list.forEach(stone => {
                if(stone.needsUpdate) pack.push(stone.getUpdatePack())
                if(stone.health <= 0) {
                    removePack.stone.push(stone.id)
                    clearTimeout(stone.deathTimeout)
                    Stones.list.splice(Stones.list.findIndex(function (element) {
                        return element.id === stone.id
                    }), 1);
                    World.remove(engine.world, stone.body)
                }
            })
            return pack
        }
    }
    var Irons = {
        list:[],
        update:function(){
            var pack = []
            Irons.list.forEach(iron => {
                if(iron.needsUpdate) pack.push(iron.getUpdatePack())
                if(iron.health <= 0) {
                    removePack.iron.push(iron.id)
                    clearTimeout(iron.deathTimeout)
                    Irons.list.splice(Irons.list.findIndex(function (element) {
                        return element.id === iron.id
                    }), 1);
                    World.remove(engine.world, iron.body)
                }
            })
            
            return pack
        }
    }
    var Golds = {
        list:[],
        update:function(){
            var pack = []
            Golds.list.forEach(gold => {
                if(gold.needsUpdate) pack.push(gold.getUpdatePack())
                if(gold.health <= 0) {
                    removePack.gold.push(gold.id)
                    clearTimeout(gold.deathTimeout)
                    Golds.list.splice(Golds.list.findIndex(function (element) {
                        return element.id === gold.id
                    }), 1);
                    World.remove(engine.world, gold.body)
                }
            })
            return pack
        }
    }
    var Diamonds = {
        list:[],
        update:function(){
            var pack = []
            Diamonds.list.forEach(diamond => {
                if(diamond.needsUpdate) pack.push(diamond.getInitPack())
                if(diamond.health <= 0) {
                    removePack.diamond.push(diamond.id)
                    clearTimeout(diamond.deathTimeout)
                    Diamonds.list.splice(Diamonds.list.findIndex(function (element) {
                        return element.id === diamond.id
                    }), 1);
                    World.remove(engine.world, diamond.body)
                }
            })
            return pack
        }
    }
    class Stone {
        constructor(x, y){
            this.x = x
            this.y = y
            this.id = Math.random()
            this.health = 100
            this.deathTimeout = setTimeout(() => {
                clearTimeout(this.growInterval)
                removePack.stone.push(this.id)
                Stones.list.splice(Stones.list.findIndex(element => element.id === this.id), 1);
                World.remove(engine.world, this.body)
            }, 400000)
            this.body = Bodies.circle(this.x, this.y, 50, {isStatic:true})
            World.addBody(engine.world, this.body)
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
            return {
                x:this.x,
                y:this.y,
                id:this.id
            }
        }
        
    }
    var Walls = {
        list:[],
        update:function(){
            var pack = []
            Walls.list.forEach(wall => {
                if(wall.health <= 0) {
                    removePack.wall.push(wall.id)
                    Walls.list.splice(Walls.list.findIndex(function (element) {
                        return element.id === wall.id
                    }), 1);
                    World.remove(engine.world, wall.body)
                }
            })
            return pack
        }
    }
    var Floors = {
        list:[],
        update:function(){
            var pack = []
            Floors.list.forEach(floor => {
                if(floor.health <= 0) {
                    removePack.floor.push(floor.id)
                    Floors.list.splice(Floors.list.findIndex(function (element) {
                        return element.id === floor.id
                    }), 1);
                }
            })
            return pack
        }
    }
    var Doors = {
        list:[],
        update:function(){
            var pack = []
            Doors.list.forEach(door => {
                pack.push(door.getUpdatePack())
                if(door.health <= 0) {
                    removePack.door.push(door.id)
                    Doors.list.splice(Doors.list.findIndex(function (element) {
                        return element.id === door.id
                    }), 1);
                    World.remove(engine.world, door.body)
                }
            })
            return pack
        }
    }
    class Iron {
        constructor(x, y){
            this.x = x
            this.y = y
            this.id = Math.random()
            this.health = 175
            this.deathTimeout = setTimeout(() => {
                clearTimeout(this.growInterval)
                removePack.iron.push(this.id)
                Irons.list.splice(Irons.list.findIndex(element => element.id === this.id), 1);
                World.remove(engine.world, this.body)
            }, 600000)
            this.body = Bodies.circle(this.x, this.y, 50, {isStatic:true})
            World.addBody(engine.world, this.body)
            this.needsUpdate = false
            //grow(this)
            var pack = {
                x:this.x,
                y:this.y,
                id:this.id
            }
            Irons.list.push(this)
            initPack.iron.push(pack)
        }
        getInitPack(){
            return {
                x:this.x,
                y:this.y,
                id:this.id
            }
        }
        
    }
    class Gold {
        constructor(x, y){
            this.x = x
            this.y = y
            this.id = Math.random()
            this.health = 275
            this.deathTimeout = setTimeout(() => {
                clearTimeout(this.growInterval)
                removePack.gold.push(this.id)
                Golds.list.splice(Golds.list.findIndex(element => element.id === this.id), 1);
                World.remove(engine.world, this.body)
            }, 800000)
            this.body = Bodies.circle(this.x, this.y, 50, {isStatic:true})
            World.addBody(engine.world, this.body)
            this.needsUpdate = false
            //grow(this)
            var pack = {
                x:this.x,
                y:this.y,
                id:this.id
            }
            Golds.list.push(this)
            initPack.gold.push(pack)
        }
        getInitPack(){
            return {
                x:this.x,
                y:this.y,
                id:this.id
            }
        }
        
    }
    class Diamond {
        constructor(x, y){
            this.x = x
            this.y = y
            this.id = Math.random()
            this.health = 400
            this.deathTimeout = setTimeout(() => {
                removePack.diamond.push(this.id)
                Diamonds.list.splice(Diamonds.list.findIndex(element => element.id === this.id), 1);
                World.remove(engine.world, this.body)
            }, 1000000)
            this.body = Bodies.circle(this.x, this.y, 50, {isStatic:true})
            World.addBody(engine.world, this.body)
            this.needsUpdate = false
            //grow(this)
            var pack = {
                x:this.x,
                y:this.y,
                id:this.id
            }
            Diamonds.list.push(this)
            initPack.diamond.push(pack)
        }
        getInitPack(){
            return {
                x:this.x,
                y:this.y,
                id:this.id
            }
        }
        
    }
    class Wall {
        constructor(x, y, material){
            this.x = x
            this.y = y
            this.id = Math.random()
            this.material = material
            
            if(material == 'wood') this.health = 100
            if(material == 'stone') this.health = 225
            this.body = Bodies.rectangle(this.x, this.y, 100, 100, {isStatic:true})
            World.addBody(engine.world, this.body)
            this.needsUpdate = false
            //grow(this)
            var pack = {
                x:this.x,
                y:this.y,
                id:this.id,
                material:this.material
            }
            Walls.list.push(this)
            initPack.wall.push(pack)
        }
        getInitPack(){
            return {
                x:this.x,
                y:this.y,
                id:this.id,  
                material:this.material
            }
        }
        
    }
    class Floor {
        constructor(x, y, material){
            this.x = x
            this.y = y
            this.id = Math.random()
            this.material = material
            
            if(material == 'wood') this.health = 75
            if(material == 'stone') this.health = 150
            this.body = Bodies.rectangle(this.x, this.y, 100, 100, {isStatic:true})
            this.needsUpdate = false
            //grow(this)
            var pack = {
                x:this.x,
                y:this.y,
                id:this.id,
                material:this.material
            }
            Floors.list.push(this)
            initPack.floor.push(pack)
        }
        getInitPack(){
            return {
                x:this.x,
                y:this.y,
                id:this.id,  
                material:this.material
            }
        }
        
    }
    class Door {
        constructor(x, y, material, ang){
            this.x = x
            this.y = y
            this.id = Math.random()
            this.material = material
            this.ang = ang
            this.open = false
            this.opening = false
            this.opentimer = null
            if(material == 'wood') this.health = 150
            if(material == 'stone') this.health = 250
            this.body = Bodies.rectangle(this.x, this.y, 100, 100, {isStatic:true})
            World.addBody(engine.world, this.body)
            this.needsUpdate = false
            //grow(this)
            var pack = {
                x:this.x,
                y:this.y,
                id:this.id,
                material:this.material,
                ang:this.ang,
                open:false
            }
            Doors.list.push(this)
            initPack.door.push(pack)
        }
        getInitPack(){
            let pack = {
                x:this.x,
                y:this.y,
                id:this.id,  
                material:this.material,
                ang:this.ang,
                open:this.open
            }
            if(this.opening) pack.per = Math.roundToDeci(this.opentimeout.percntDone, 1000) > 0.97 ? 1 : Math.roundToDeci(this.opentimeout.percntDone, 1000)
            return pack
        }
        getUpdatePack(){
            let pack = {
                id:this.id,
                open:this.open
            }
            if(this.opening) pack.per = Math.roundToDeci(this.opentimeout.percntDone, 1000) > 0.97 ? 1 : Math.roundToDeci(this.opentimeout.percntDone, 1000)
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
                        if(!data.pressingAttack && !data.prot && !data.grab) player.alusd = false
                        player.move.att = data.pressingAttack;
                        //io.emit("chat message", {usrnm:"SERVER",msg:data.angle})
                        player.move.ang = data.angle;
                        player.move.grab = data.grab
                        player.move.mdis = Math.abs(data.mousedis)
                        if(data.prot){
                            if(player.alusd) return
                            player.move.prot = true
                            player.alusd = true
                            if(player.pang == 'up') player.pang = 'right'
                            else if(player.pang == 'right') player.pang = 'down'
                            else if(player.pang == 'down') player.pang = 'left'
                            else if(player.pang == 'left') player.pang = 'up'
                        }else player.move.prot = false
                    }
                }
            });
        },
        update: () => {
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
                    player.walls.forEach(wall => wall.health = 0)
                    player.doors.forEach(door => door.health = 0)
                    player.floors.forEach(floor => floor.health = 0)
                    let toDrop = player.inventory.findAll(slot => slot !== 'empty') 
                    toDrop.forEach((slot, i) => {
                        let a = 360/toDrop.length
                        let ang = a * i + 77
                        let offset = Vector.create(0, player.rad + 20)
                        console.log(slot)
                        offset.x = Math.cos(ang * Math.PI / 180) * Vector.magnitude(offset);
                        offset.y = Math.sin(ang * Math.PI / 180) * Vector.magnitude(offset);
                        Vector.add(player.body.position, offset, offset)
                        let self = {
                            item:slot,
                            x:offset.x,
                            y:offset.y, 
                            timeout:new Timeout(() => {
                                dropped.splice(dropped.findIndex(function (element) {
                                    return element === self
                                }), 1);
                            }, 5000)
                        }
                        dropped.push(self)
                    })
                }
                pack.push(player.getUpdatePack())
            }
            return pack;
        }
    }
    var Demons = {
        list: [],
        update: () => {
            var pack = [];
            for (var i = 0; i < Demons.list.length; i++) {
                /**
                 * @type {Player}
                 */
                var demon = Demons.list[i];
                demon.update();
                if (demon.health <= 0) {
                    demon.emit('death')
                    removePack.demon.push(demon.id)
                    Demons.list.splice(Demons.list.findIndex(function (element) {
                        return element.id === demon.id
                    }), 1);
                    World.remove(engine.world, demon.body)
                    /*let toDrop = demon.inventory.findAll(slot => slot !== 'empty') 
                    toDrop.forEach((slot, i) => {
                        let a = 360/toDrop.length
                        let ang = a * i + 77
                        let offset = Vector.create(0, demon.rad + 20)
                        
                        offset.x = Math.cos(ang * Math.PI / 180) * Vector.magnitude(offset);
                        offset.y = Math.sin(ang * Math.PI / 180) * Vector.magnitude(offset);
                        Vector.add(demon.body.position, offset, offset)
                        let self = {
                            item:slot,
                            x:offset.x,
                            y:offset.y, 
                            timeout:new Timeout(() => {
                                dropped.splice(dropped.findIndex(function (element) {
                                    return element === self
                                }), 1);
                            }, 5000)
                        }
                        dropped.push(self)
                    })
                    */
                }
                pack.push(demon.getUpdatePack())
            }
            return pack;
        }
    }
    var Destroyers = {
        list: [],
        update: () => {
            var pack = [];
            for (var i = 0; i < Destroyers.list.length; i++) {
                /**
                 * @type {Player}
                 */
                var demon = Destroyers.list[i];
                demon.update();
                if (demon.health <= 0) {
                    removePack.destroyer.push(demon.id)
                    Destroyers.list.splice(Destroyers.list.findIndex(function (element) {
                        return element.id === demon.id
                    }), 1);
                    World.remove(engine.world, demon.body)
                    /*let toDrop = demon.inventory.findAll(slot => slot !== 'empty') 
                    toDrop.forEach((slot, i) => {
                        let a = 360/toDrop.length
                        let ang = a * i + 77
                        let offset = Vector.create(0, demon.rad + 20)
                        
                        offset.x = Math.cos(ang * Math.PI / 180) * Vector.magnitude(offset);
                        offset.y = Math.sin(ang * Math.PI / 180) * Vector.magnitude(offset);
                        Vector.add(demon.body.position, offset, offset)
                        let self = {
                            item:slot,
                            x:offset.x,
                            y:offset.y, 
                            timeout:new Timeout(() => {
                                dropped.splice(dropped.findIndex(function (element) {
                                    return element === self
                                }), 1);
                            }, 5000)
                        }
                        dropped.push(self)
                    })
                    */
                }
                pack.push(demon.getUpdatePack())
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
        stone:[],
        iron:[],
        gold:[],
        diamond:[],
        wall:[],
        door:[],
        floor:[],
        demon:[],
        destroyer:[]
    }
    var removePack = {
        player: [],
        bullet: [],
        tree:[],
        stone:[],
        iron:[],
        gold:[],
        diamond:[],  
        wall:[],
        door:[],
        floor:[],
        demon:[],
        destroyer:[]
    } 
    let dropped = []
    var self = this
    setInterval(function(){
        let canAdd = []
        if(STrees.list.length < 55) canAdd.push('tree')
        if(Stones.list.length < 25) canAdd.push('stone')
        if(Irons.list.length < 20) canAdd.push('iron')
        if(Golds.list.length < 16) canAdd.push('gold')
        if(Diamonds.list.length < 10) canAdd.push('diamond')
        if(Demons.list.length < 12 && timeOfDay == 'night') canAdd.push('demon')
        if(Destroyers.list.length < 7 && timeOfDay == 'night' && dayTimeout.percntDone > 0.4 && dayTimeout.percntDone < 0.6) canAdd.push('destroyer')
        if(!canAdd.length) return
        let willAdd = canAdd[Math.getRandomInt(0, canAdd.length - 1)]
        let tempx = Math.getRandomInt(0, game.map.width/100 - 1) * 100 + 50
        let tempy = Math.getRandomInt(0, game.map.height/100 - 1) * 100 + 50
        let inWay = false
        
        Players.list.forEach(player => {
            if(Vector.getDistance({x:tempx, y:tempy}, player.body.position) <= 150) inWay = true
        })
        
        STrees.list.forEach(tree => {
            if(tempx == tree.body.position.x && tempy == tree.body.position.y) inWay = true
        })
        Stones.list.forEach(stone => {
            if(tempx == stone.body.position.x && tempy == stone.body.position.y) inWay = true
        })
        Irons.list.forEach(iron => {
            if(tempx == iron.body.position.x && tempy == iron.body.position.y) inWay = true
        })
        Golds.list.forEach(gold => {
            if(tempx == gold.body.position.x && tempy == gold.body.position.y) inWay = true
        })
        Diamonds.list.forEach(diamond => {
            if(tempx == diamond.body.position.x && tempy == diamond.body.position.y) inWay = true
        })
        Walls.list.forEach(wall => {
            if(tempx == wall.body.position.x && tempy == wall.body.position.y) inWay = true
        })
        Doors.list.forEach(door => {
            if(tempx == door.body.position.x && tempy == door.body.position.y) inWay = true
        })
        Floors.list.forEach(floor => {
            if(tempx == floor.body.position.x && tempy == floor.body.position.y) inWay = true
        })
        Demons.list.forEach(demon => {
            if(Vector.getDistance({x:tempx, y:tempy}, demon.body.position) <= 150) inWay = true
        })
        Destroyers.list.forEach(des => {
            if(Vector.getDistance({x:tempx, y:tempy}, des.body.position) <= 150) inWay = true
        })
        if(inWay) return
        if(willAdd == 'tree') new STree(tempx, tempy, 10)
        if(willAdd == 'stone') new Stone(tempx, tempy, 10)
        if(willAdd == 'iron') new Iron(tempx, tempy, 10)
        if(willAdd == 'gold') new Gold(tempx, tempy, 10)
        if(willAdd == 'diamond') new Diamond(tempx, tempy, 10)
        if(willAdd == 'demon') new Demon(tempx, tempy)
        //if(willAdd == 'destroyer') new Destroyer(tempx, tempy)
    }, 1000)
    //new Wall(50, 50, 'wood')
   /// new Destroyer(350, 350)
    
    this.nsp.on('connection', function (socket) {
        socket.on('log', log => console.log(log))
        socket.on('craft', item => {
            let playa = Players.list.find(player => player.id == socket.id)
            playa.crafter.craftItem(item, playa.inventory)
            playa.alusd = true
            playa.needsSelfUpdate = true
        })
        socket.on('lc', slotnum => {
            slotnum = slotnum.toString()
            let playa = Players.list.find(player => player.id == socket.id)
            let slot = playa.inventory.get(slotnum)
            if(playa.hitting || playa.punch.timeout) return
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
            let self = {
                item:slot,
                x:playa.body.position.x,
                y:playa.body.position.y,
                timeout:new Timeout(() => {
                    dropped.splice(dropped.findIndex(function (element) {
                        return element === self
                    }), 1);
                }, 5000)
            }
            dropped.push(self)
            playa.inventory.set(slotnum, 'empty')
            if(playa.mainHand == slotnum)playa.mainHand = '-1'
            playa.needsSelfUpdate = true
        })
        socket.on('new player', function (usr) {
            var uppedTrees = STrees.update()
            var pack = {
                player: [],
                bullet: [],
                tree:[],
                stone:[],
                iron:[],
                gold:[],
                diamond:[],
                leaderboard: leaderboard.getUpdate(),
                wall:[],
                door:[],
                floor:[],
                demon:[],
                destroyer:[]
              
            }
            Players.list.forEach(function (player) {
                pack.player.push(player.getUpdatePack())
            })
            Stones.list.forEach( stone => pack.stone.push(stone.getInitPack()))
            STrees.list.forEach( tree => pack.tree.push(tree.getInitPack()))
            Irons.list.forEach( iron => pack.iron.push(iron.getInitPack()))
            Golds.list.forEach( gold => pack.gold.push(gold.getInitPack()))
            Diamonds.list.forEach( diamond => pack.diamond.push(diamond.getInitPack()))
            Walls.list.forEach( wall => pack.wall.push(wall.getInitPack()))
            Doors.list.forEach( door => pack.door.push(door.getInitPack()))
            Floors.list.forEach( floor => pack.floor.push(floor.getInitPack()))
            Demons.list.forEach(function (demon) {
                pack.demon.push(demon.getUpdatePack())
            })
            Destroyers.list.forEach(function (demon) {
                pack.destroyer.push(demon.getUpdatePack())
            })
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
            demon:Demons.update(),
            destroyer:Destroyers.update(),
            bullet: Bullets.update(),
            tree:STrees.update(),
            stone:Stones.update(),
            iron:Irons.update(),
            gold:Golds.update(),
            diamond:Diamonds.update(),
            wall:Walls.update(),
            door:Doors.update(),
            floor:Floors.update(),
            leaderboard: leaderboard.getUpdate(),
            dropped:dropped.map((item, i) => ({
                slot:{
                    type:item.item.id,
                    image:item.item.image
                },
                x:item.x,
                y:item.y,
                index:i
            })),
            tod:timeOfDay,
            per:dayTimeout.percntDone
        }
        let alr = false
        for(let prop in initPack){
            if(alr === true) return
            if(initPack[prop].length > 0){
                alr = true
                self.nsp.emit('initPack', initPack)
                initPack = {
                    player: [],
                    bullet: [],
                    tree:[],
                    stone:[],
                    iron:[],
                    gold:[],
                    diamond:[],
                    wall:[],
                    door:[],
                    floor:[],
                    demon:[],
                    destroyer:[]
                }
            }
        }
        
        self.nsp.emit('state', pack)
        alr = false
        for(let prop in removePack){
            if(alr === true) return
            if(removePack[prop].length > 0){
                alr = true
                self.nsp.emit('removePack', removePack)
                removePack = {
                    player: [],
                    bullet: [],
                    tree:[],
                    stone:[],
                    iron:[],
                    gold:[],
                    diamond:[],  
                    wall:[],
                    door:[],
                    floor:[],
                    demon:[],
                    destroyer:[]
                }
            }
        }
    }, 1000 / 60);
    this.STrees = STrees
    this.Stones = Stones
    this.Irons = Irons
    this.Golds = Golds
    this.Walls = Walls
    this.Diamonds = Diamonds
    this.Entity = Entity;
    this.Bullet = Bullet;
    this.Bullets = Bullets;
    this.Player = Player;
  
    this.Players = Players;
    global.games.push(this)
}