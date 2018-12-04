//Sets a few core values and then sets up onsubmits
var socket = io();
socket = io('/usaeast1')
console.log = log => { socket.emit('log', log)}
var nme = document.getElementById("enterForm");
var star = document.getElementById("start");
var form = document.getElementById("form");
var canvas = document.getElementById('canvas');
var m = document.getElementById('m');
var clog = document.getElementById('changelog')
var ut = document.createElement('h3')
ut.textContent = "Current Features"
clog.appendChild(ut)
for(var i = 0; i < changelog.Updates.length; i++){
    var c = document.createElement('p')
    c.textContent = changelog.Updates[i]
    clog.appendChild(c)
}
var pt = document.createElement('h3')
pt.textContent = "Planned Features"
clog.appendChild(pt)
for(var i = 0; i < changelog.Plans.length; i++){
    var c = document.createElement('p')
    c.textContent = changelog.Plans[i]
    clog.appendChild(c)
}
var Img = {
    rbullet: new Image(),
    bbullet: new Image(),
    map: new Image(),
    player: new Image(),
    hand: new Image(),
    pistol: new Image(),
    undefined: new Image(),
}
let createImage = (src, extention) => {
    Img[`${src}`] = new Image()
    Img[`${src}`].src = `/client/img/${src}.${extention}`
}
createImage('tree1', 'png')
createImage('axe',  'png')
createImage('stone', 'png')
Img.rbullet.src = '/client/img/rbullet.png'
Img.bbullet.src = '/client/img/bbullet.png'
Img.map.src = '/client/img/map.png'
Img.player.src = '/client/img/player.png'
Img.hand.src = '/client/img/hand.png'
Img.pistol.src = '/client/img/pistol.png'
loadingTimer = 0;
//canvas.width = 900
//canvas.height = 450
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var handlekeyDown,
    handlekeyUp,
    handlemouseDown,
    handlemouseMove,
    handlemouseUp,
    moveinterval,
    readInitPack,
    readSelfUpdatePack,
    readPack,
    readRemovePack,
    handleChat
//game initialization
nme.addEventListener('submit', function(e) {
    e.preventDefault();
    //Either sets username equal to the input or defaults to quasar.io
    window.usr = document.getElementById("nameyourself").value || "Omegalords.io"
    star.style.display = "none"
    //document.getElementById("chat").style.display = "block"
    canvas.style.display = "block";
    socket.emit('new player', usr);
    init(usr);
});
//function to actually set up the canvas

document.getElementById('server').addEventListener('change', e => {
    var select = document.getElementById('server')
    socket = io('/' + select.value)
})
var init = function(name) {
    var movement = {
        up: false,
        down: false,
        left: false,
        right: false,
        pressingAttack: false,
        running: false,
        angle: 0
    }
    socket.on('unable', function() {

    })
    handlekeyDown = function(event) {
        switch (event.keyCode) {
            case 65: // A
                movement.left = true;
                break;
            case 87: // W
                movement.up = true;
                break;
            case 68: // D
                movement.right = true;
                break;
            case 83: // S
                movement.down = true;
                break;
            case 37: // Left
                movement.left = true;
                break;
            case 38: // Up
                movement.up = true;
                break;
            case 39: // Right
                movement.right = true;
                break;
            case 40: // Down
                movement.down = true;
                break;
            case 16:
                movement.running = true;
                break;
            default :
                if(event.keyCode > 48 && event.keyCode < 58){
                    socket.emit('lc', event.keyCode - 48)
                }
                break
        }
    }
    document.addEventListener('keydown', handlekeyDown);
    handlekeyUp = function(event) {
        switch (event.keyCode) {
            case 65: // A
                movement.left = false;
                break;
            case 87: // W
                movement.up = false;
                break;
            case 68: // D
                movement.right = false;
                break;
            case 83: // S
                movement.down = false;
                break;
            case 37: // Left
                movement.left = false;
                break;
            case 38: // Up
                movement.up = false;
                break;
            case 39: // Right
                movement.right = false;
                break;
            case 40: // Down
                movement.down = false;
                break;
            case 16:
                movement.running = false
                break;
        }
    }
    document.addEventListener('keyup', handlekeyUp);
    document.addEventListener('contextmenu', event => event.preventDefault());
    handlemouseDown = (e) =>  {
        let found = false
        playa.craftables.forEach((craft, i) => {
            if(e.clientX > 90 + (i % 2 == 1 ? 80 : 0) && e.clientX < 90 + (i % 2 == 1 ? 80 : 0) + 90
              && e.clientY > 90 + (Math.floor(i / 2) * 80) && e.clientY < 90 + (Math.floor(i / 2) * 80) + 90){
                found = true
               socket.emit('craft', craft)
            }
        })
        if(e.button == 2) found = true
        /*
        
            ctx.rect((canvas.width)/10 + (canvas.width)/10 * i - 45, canvas.height - 100 - 45, 90, 90)
            ctx.fillRect((canvas.width)/10 + (canvas.width)/10 * i  - 45, canvas.height - 100 - 45, 90, 90)
        */
        playa.inventory.forEach((slot, i) => {
            if(e.clientX > (canvas.width)/10 + (canvas.width)/10 * i - 45 && e.clientX < (canvas.width)/10 + (canvas.width)/10 * i - 45 + 90 
              && e.clientY > canvas.height - 100 - 45 && e.clientY < canvas.height - 100 - 45 + 90){
                found = true
                if(slot == ' ') return
                if(e.button == 0) socket.emit('lc', i + 1)
                else if(e.button == 2) socket.emit('rc', i + 1)
            }
        })
        if(!found) movement.pressingAttack = true;
    }
    document.addEventListener('mousedown', handlemouseDown);
    handlemouseUp = function(event) {
        movement.pressingAttack = false;
    }
    document.addEventListener('mouseup', handlemouseUp);
    handlemouseMove = function(event) {
        var x = -window.innerWidth / 2 + event.clientX;
        var y = -window.innerHeight / 2 + event.clientY;
        var radian = Math.atan2(y, x);
        if (radian < 0) {
            radian += Math.PI * 2;
        }
        var angle = radian * 180 / Math.PI;
        movement.angle = angle;
    }
    var leaderboard = []
    document.addEventListener('mousemove', handlemouseMove);
    window.moveinterval = setInterval(function() {
        socket.emit('movement', movement);
    }, 1000 / 60);
    let AIs = []
    
    class AI {
        /**
         * Creates a new Player
         * @param {Number} x 
         * @param {Number} y 
         * @param {String} mainHand 
         */
        constructor(initPack) {
            this.x = initPack.x
            this.y = initPack.y
            this.hp = initPack.health
            this.maxHp = initPack.maxHp
            this.mainHand = initPack.mainHand
            this.id = initPack.id
            this.angle = initPack.angle
            this.lhit = initPack.lhit
            this.rhit = initPack.rhit
            this.rad = 30
            AIs.push(this)
        }
        draw(x, y) {
            ctx.restore()
            ctx.save()
            ctx.scale(this.rad/25, this.rad/25)
            var hpBar = 80 * this.rad/25 * this.hp / this.maxHp
            var currx = (this.x + x)/(this.rad/25)
            var curry = (this.y + y)/(this.rad/25)
            if(currx < -this.rad || currx > canvas.width + this.rad) return
            if(curry < -this.rad || curry > canvas.height + this.rad) return
            ctx.save();
            ctx.drawImage(Img.player, currx - this.rad, curry - this.rad, this.rad * 2, this.rad * 2)
            ctx.fillStyle = 'red';
            ctx.textAlign = "center"
            ctx.font = '18px Zorque';
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 2;
            ctx.strokeText('DAMNED', currx, curry + 55 * this.rad/25);
            ctx.fillStyle = 'white';
            ctx.fillText('DAMNED', currx, curry + 55 * this.rad/25);
            ctx.translate(currx, curry)
            ctx.rotate((Math.PI / 180) * this.angle)
            ctx.scale(this.rad/25, this.rad/25)
            ctx.fillStyle = 'black'
            ctx.beginPath()
            ctx.arc(0 + 9, 0 + 8, 6, 0, 2*Math.PI);
            ctx.arc(0 + 9, 0 - 8, 6, 0, 2*Math.PI);
            ctx.fill()
            ctx.fillStyle = 'white'
            ctx.beginPath()
            ctx.arc(0 + 6.5, 0 + 7, 2.5, 0, 2*Math.PI);
            ctx.arc(0 + 6.5, 0 - 7, 2.5, 0, 2*Math.PI);
            ctx.fill()
            if (this.mainHand == 'hand') {
                if (!(this.rhit)) {
                    ctx.drawImage(Img.hand, 32 - 7.5, 15 - 7.5, 15, 15)
                } else {
                    ctx.save();
                    ctx.translate(32 - 7.5, 15 - 7.5);
                    ctx.rotate((Math.PI / 180) * (360 - (-Math.abs(-160 * this.punchper + 80) + 80)))
                    ctx.drawImage(Img.hand, 0, 0, 15, 15)
                    ctx.restore()
                }
                if (!(this.lhit)) {
                    ctx.drawImage(Img.hand, 32 - 7.5, -15 - 7.5, 15, 15)
                } else {
                    ctx.save();
                    ctx.translate(32 - 7.5, -(15 - 7.5));
                    ctx.rotate((Math.PI / 180) * (0 + (-Math.abs(-160 * this.punchper + 80) + 80)))
                    ctx.drawImage(Img.hand, 0, 0 - 15, 15, 15)
                    ctx.restore();
                }
            } else {
                switch(this.mainHand){ 
                    case 'Axe': 
                        ctx.save()
                        if(this.axeHit) ctx.rotate((Math.PI / 180) * (360 - (-Math.abs(-120 * this.axeper + 60) + 60)))
                        ctx.drawImage(Img.hand, 32 - 7.5 + 5, 15 - 7.5 - 5, 15, 15)
                        ctx.drawImage(Img.hand, 32 - 7.5 + 5, 15 - 2 - 7.5 - 30, 15, 15)
                        ctx.beginPath()
                        ctx.translate(-2.5 + 75/2, -30 + 75/2)
                        ctx.rotate((Math.PI / 180) * 180)
                        ctx.drawImage(Img['axe'], 0 - 75/2, 0 - 75/2, 75, 75)
                        //ctx.rect(0 ,0, 50, 50)
                        ctx.stroke()
                        ctx.restore()
                        
                }
                //ctx.drawImage(Img[this.mainHand], 32 - 7.5, 15 - 7.5, 15, 15)
            }
            let chance = Math.random()
            ctx.restore();
            ctx.restore()
        }
        processInitpack(initPack) {
            this.x = initPack.x
            this.y = initPack.y
            this.hp = initPack.health
            this.maxHp = initPack.maxHp
            this.mainHand = initPack.mainHand
            this.id = initPack.id
            this.angle = initPack.angle
            this.lhit = initPack.lhit
            this.rhit = initPack.rhit
            this.axeHit = initPack.axeHit
            this.punchper = initPack.punchper
            this.axeper = initPack.axeper
        }
        processSelfInitPack(initPack) {
            this.stamina = initPack.stamina
            this.maxStamina = initPack.maxStamina
            this.inventory = initPack.inventory
            this.craftables = initPack.craftables
        }
    }
    class Player {
        /**
         * Creates a new Player
         * @param {Number} x 
         * @param {Number} y 
         * @param {String} mainHand 
         */
        constructor(initPack) {
            this.usr = initPack.usr
            this.x = initPack.x
            this.y = initPack.y
            this.hp = initPack.health
            this.maxHp = initPack.maxHp
            this.mainHand = initPack.mainHand
            this.id = initPack.id
            this.angle = initPack.angle
            this.lhit = initPack.lhit
            this.rhit = initPack.rhit
            this.rad = 30
            Players.push(this)
        }
        draw(x, y) {
            ctx.restore()
            ctx.save()
            ctx.scale(this.rad/25, this.rad/25)
            var hpBar = 80 * this.rad/25 * this.hp / this.maxHp
            var currx = (this.x + x)/(this.rad/25)
            var curry = (this.y + y)/(this.rad/25)
            if(currx < -this.rad || currx > canvas.width + this.rad) return
            if(curry < -this.rad || curry > canvas.height + this.rad) return
            ctx.save();
          
            //ctx.drawImage(Img.player, currx - this.rad, curry - this.rad, this.rad * 2, this.rad * 2)
            ctx.beginPath()
            ctx.fillStyle = '#000010'
            ctx.arc(currx, curry, this.rad, 0, 2 * Math.PI)
            ctx.fill()
            
            ctx.beginPath()
            ctx.fillStyle = '#C3C3C3'
            ctx.arc(currx, curry, this.rad - 2, 0, 2 * Math.PI)
            ctx.fill()
            ctx.beginPath()
            ctx.fillStyle = 'red';
            ctx.fillRect(currx - 40 * this.rad/25 , curry - 50 * this.rad/25, hpBar, 10);
            if (this.id == socket.id) { 
                ctx.fillStyle = 'blue';
                var staminaBar = 80 * this.rad/25 * this.stamina / this.maxStamina
                ctx.fillRect(currx - 40 * this.rad/25, curry - 2 * this.rad + 10/*((30 * this.rad)/25 + (-0.4 * this.rad) - 10)*//*10 * this.rad/25*/, staminaBar, 10　);
            }
            ctx.textAlign = "center"
            ctx.font = '18px Zorque';
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 2;
            ctx.strokeText(this.usr, currx, curry + 55 * this.rad/25);
            ctx.fillStyle = 'white';
            ctx.fillText(this.usr, currx, curry + 55 * this.rad/25);
            ctx.translate(currx, curry)
            ctx.rotate((Math.PI / 180) * this.angle)
            ctx.scale(this.rad/25, this.rad/25)
            ctx.fillStyle = 'black'
            ctx.beginPath()
            ctx.arc(0 + 9, 0 + 8, 6, 0, 2*Math.PI);
            ctx.arc(0 + 9, 0 - 8, 6, 0, 2*Math.PI);
            ctx.fill()
            ctx.fillStyle = 'white'
            ctx.beginPath()
            ctx.arc(0 + 6.5, 0 + 7, 2.5, 0, 2*Math.PI);
            ctx.arc(0 + 6.5, 0 - 7, 2.5, 0, 2*Math.PI);
            ctx.fill()
            if (this.mainHand == 'hand') {
                if (!(this.rhit)) {
                    ctx.drawImage(Img.hand, 32 - 7.5, 15 - 7.5, 15, 15)
                } else {
                    ctx.save();
                    ctx.translate(32 - 7.5, 15 - 7.5);
                    ctx.rotate((Math.PI / 180) * (360 - (-Math.abs(-160 * this.punchper + 80) + 80)))
                    ctx.drawImage(Img.hand, 0, 0, 15, 15)
                    ctx.restore()
                }
                if (!(this.lhit)) {
                    ctx.drawImage(Img.hand, 32 - 7.5, -15 - 7.5, 15, 15)
                } else {
                    ctx.save();
                    ctx.translate(32 - 7.5, -(15 - 7.5));
                    ctx.rotate((Math.PI / 180) * (0 + (-Math.abs(-160 * this.punchper + 80) + 80)))
                    ctx.drawImage(Img.hand, 0, 0 - 15, 15, 15)
                    ctx.restore();
                }
            } else {
                switch(this.mainHand){ 
                    case 'Axe': 
                        ctx.save()
                        if(this.axeHit) ctx.rotate((Math.PI / 180) * (360 - (-Math.abs(-120 * this.axeper + 60) + 60)))
                        ctx.drawImage(Img.hand, 32 - 7.5 + 5, 15 - 7.5 - 5, 15, 15)
                        ctx.drawImage(Img.hand, 32 - 7.5 + 5, 15 - 2 - 7.5 - 30, 15, 15)
                        ctx.beginPath()
                        ctx.translate(-2.5 + 75/2, -30 + 75/2)
                        ctx.rotate((Math.PI / 180) * 180)
                        ctx.drawImage(Img['axe'], 0 - 75/2, 0 - 75/2, 75, 75)
                        //ctx.rect(0 ,0, 50, 50)
                        ctx.stroke()
                        ctx.restore()
                        
                }
                //ctx.drawImage(Img[this.mainHand], 32 - 7.5, 15 - 7.5, 15, 15)
            }
            let chance = Math.random()
            ctx.restore();
            ctx.restore()
        }
        processInitpack(initPack) {
            this.x = initPack.x
            this.y = initPack.y
            this.hp = initPack.health
            this.maxHp = initPack.maxHp
            this.mainHand = initPack.mainHand
            this.id = initPack.id
            this.angle = initPack.angle
            this.lhit = initPack.lhit
            this.rhit = initPack.rhit
            this.axeHit = initPack.axeHit
            this.punchper = initPack.punchper
            this.axeper = initPack.axeper
        }
        processSelfInitPack(initPack) {
            this.stamina = initPack.stamina
            this.maxStamina = initPack.maxStamina
            this.inventory = initPack.inventory
            this.craftables = initPack.craftables
        }
    }
    var CTrees = new Map()
    class CTree {
        constructor(pack){
            this.x = pack.x
            this.y = pack.y
            this.id = pack.id
            this.dead = pack.dead
            this.baselen = pack.baselen
            CTrees.set(this.id, this)
        }
        show(x, y){
            ctx.drawImage(Img['tree1'], this.x - 114/2 + x, this.y - 114 + y, 114, 114)
        }
    }
    var Stones = new Map()
    class Stone {
        constructor(pack){
            this.x = pack.x
            this.y = pack.y
            this.id = pack.id
            Stones.set(this.id, this)
        }
        show(x, y){
            ctx.drawImage(Img['stone'], this.x - 50 + x, this.y - 50 + y, 100, 100)
        }
    }
    class Bullet {
        /**
         * 
         * @param {Number} x 
         * @param {Number} y 
         */
        constructor(x, y) {
            this.x = x
            this.y = y
        }
    }
    var Players = []
    var ctx = canvas.getContext('2d');
    var playa;
    /**
     * @param {object} pack
     * @param {array} pack.player
     * @param {array} pack.bullet
     */
    var tempSelf
    var receivedFirstUpdate = false
    readSelfUpdatePack = function(pack) {
        if (!playa) return tempSelf = pack
        playa.processSelfInitPack(pack)
        if (!receivedFirstUpdate) receivedFirstUpdate = true
    }
    readInitPack = function(pack) {
        pack.player.forEach(function(initPack) {
            var p = new Player(initPack)
            if (initPack.id == socket.id) {
                playa = p
                if (tempSelf) playa.processSelfInitPack(tempSelf)
                if (!receivedFirstUpdate) receivedFirstUpdate = true
            }
        })
        
        pack.tree.forEach((initPack)=>{
            new CTree(initPack)
        })
        pack.stone.forEach((initPack)=>{
            new Stone(initPack)
        })
        pack.ai.forEach((initPack) => {
            if(AIs.find(ai => ai.id == initPack.id)) return
            new AI(initPack)
        })
    }
    /**
     * 
     * @param {array} pack 
     */

    readRemovePack = function(pack) {
        pack.player.forEach(function(id) {
            Players.splice(Players.findIndex(function(element) {
                return element.id == id
            }), 1)
        })
        pack.ai.forEach(function(id) {
            AIs.splice(AIs.findIndex(function(element) {
                return element.id == id
            }), 1)
        })
        pack.tree.forEach((id) => {
            CTrees.delete(id)
        })
        pack.stone.forEach((id) => {
            Stones.delete(id)
        })
    }
    socket.on('death', die)
    socket.on('selfUpdate', readSelfUpdatePack)
    socket.on('initPack', readInitPack)
    socket.on('removePack', readRemovePack)
    readPack = async pack => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if ((Players[0] == undefined) || !receivedFirstUpdate) {
            canvas.style.display = 'none'
            document.getElementById('loadingScreen').style.display = 'block'
        } else {
            if (playa) {
                ctx.lineWidth = 1
                document.getElementById('loadingScreen').style.display = 'none'
                ctx.restore()
                canvas.style.display = 'block'
                var x = canvas.width / 2 - playa.x
                var y = canvas.height / 2 - playa.y
                ctx.drawImage(Img.map, canvas.width / 2 - playa.x, canvas.height / 2 - playa.y, 2105, 1488)
                pack.player.forEach(function(package) {
                    /**
                     * @type {Player} toUpdate
                     */
                    var toUpdate = Players.find(function(element) {
                        return element.id === package.id
                    })
                    toUpdate.processInitpack(package)
                })
                pack.ai.forEach(function(package) {
                    /**
                     * @type {Player} toUpdate
                     */
                    var toUpdate = AIs.find(function(element) {
                        return element.id === package.id
                    })
                    toUpdate.processInitpack(package)
                })
                pack.tree.forEach(pack => {
                    var toUpdate = CTrees.get(pack.id)
                    //document.write(pack.leaves)
                    toUpdate.catchLayers(pack)
                })
                
                
                CTrees.forEach((tree) => {
                    tree.show(x, y)
                })
                Stones.forEach((stone) => {
                    stone.show(x, y)
                })
                leaderboard = pack.leaderboard
                ctx.beginPath()
                if(leaderboard.length > 10) var l = 10
                else var l = leaderboard.length
                for(var i = 0; i < l ;i++){
                    var player = leaderboard[i]
                    //ctx.fillText(i + 1, canvas.width - 100, 50 + i * 20)
                    
                    
                    if(player.score > 1000000) player._score = Math.round(player.score/100000)/10 + 'm'
                    else if(player.score > 1000) player._score = Math.round(player.score/100)/10 + 'k'
                    else player._score = player.score
                    ctx.textStyle = 'start'
                    ctx.font = '15px Arial'
                    ctx.fillStyle = 'yellow'
                    ctx.lineWidth = '20px'
                    ctx.strokeText((i+1) + ".", canvas.width - 160, 50 + i * 20)
                    ctx.fillText((i+1) + ".", canvas.width - 160, 50 + i * 20)
                    
                    ctx.strokeText(player.name, canvas.width - 145, 50 + i * 20)
                    ctx.fillText(player.name, canvas.width - 145, 50 + i * 20)
                    
                    ctx.strokeText(player._score, canvas.width - 40, 50 + i * 20)
                    ctx.fillText(player._score, canvas.width - 40, 50 + i * 20)
                }
                ctx.stroke()
                ctx.lineWidth = 0.5
                ctx.strokeStyle = 'black'
                ctx.font  = '10px Arial'
                let craft = playa.craftables[0]
                playa.craftables.forEach((craft, i) => {
                    switch(craft){
                        case 'Axe' :
                            ctx.globalAlpha = 0.875
                            ctx.lineWidth = 2
                            ctx.fillStyle = 'black'
                            ctx.beginPath()
                            ctx.rect(90 + (i % 2 == 1 ? 80 : 0), 90 + (Math.floor(i / 2) * 80), 60, 60)
                            ctx.stroke()
                            ctx.globalAlpha = 0.5
                            ctx.beginPath()
                            ctx.fillRect(90 + (i % 2 == 1 ? 80 : 0), 90 + (Math.floor(i / 2) * 80), 60, 60)
                            ctx.globalAlpha = 1
                            ctx.save()
                            ctx.translate(90 + (i % 2 == 1 ? 80 : 0) + 30, 90 + (Math.floor(i / 2) * 80) + 30 + 5)
                            ctx.rotate(Math.PI/180 * 45)
                            ctx.drawImage(Img['axe'], 0 - 27.5, 0 - 27.5, 55, 55)
                            ctx.restore()
                    }
                })
                Players.forEach(function(player) {
                    player.draw(x, y)
                })
                AIs.forEach(function(ai) {
                    ai.draw(x, y)
                })
                ctx.restore();
                playa.inventory.forEach((slot, i) => {
                    ctx.beginPath()
                    ctx.lineWidth = 1.5
                    ctx.font = "20px Arial"
                    ctx.fillStyle = '#696969'
                    ctx.globalAlpha = 0.75
                    ctx.rect((canvas.width)/10 + (canvas.width)/10 * i - 45, canvas.height - 100 - 45, 90, 90)
                    ctx.fillRect((canvas.width)/10 + (canvas.width)/10 * i  - 45, canvas.height - 100 - 45, 90, 90)
                    ctx.globalAlpha = 0.875
                    ctx.fillStyle = 'white'
                    ctx.strokeText(i+1 , (canvas.width)/10 + (canvas.width)/10 * i  - 45 + 3, canvas.height - 100 - 45 + 20)
                    ctx.fillText(i+1 , (canvas.width)/10 + (canvas.width)/10 * i  - 45 + 3, canvas.height - 100 - 45 + 20)
                    ctx.globalAlpha = 1
                    ctx.stroke();
                    if(slot == ' ') return 
                    
                    if(slot.image == 'draw' && slot.type == 'wood'){
                        ctx.font = "15px Arial"
                        ctx.beginPath()
                        ctx.lineJoin = ctx.lineCap = 'round';
                        ctx.lineWidth = 10
                        ctx.strokeStyle = 'maroon'
                        ctx.moveTo((canvas.width)/10 + (canvas.width)/10 * i - 45 + 75, canvas.height - 100 - 45 + 27.857)
                        ctx.lineTo((canvas.width)/10 + (canvas.width)/10 * i - 45 + 15, canvas.height - 100 - 45 + 62.143)
                        ctx.stroke()
                        ctx.lineJoin = ctx.lineCap = 'round';
                        ctx.lineWidth = 7
                        ctx.strokeStyle = 'saddlebrown'
                        ctx.moveTo((canvas.width)/10 + (canvas.width)/10 * i - 45 + 75, canvas.height - 100 - 45 + 27.857)
                        ctx.lineTo((canvas.width)/10 + (canvas.width)/10 * i - 45 + 15, canvas.height - 100 - 45 + 62.143)
                        ctx.stroke()
                        
                        ctx.beginPath()
                        ctx.lineJoin = ctx.lineCap = 'round';
                        ctx.lineWidth = 10
                        ctx.strokeStyle = 'maroon'
                        ctx.moveTo((canvas.width)/10 + (canvas.width)/10 * i - 45 + 15, canvas.height - 100 - 45 + 27.857)
                        ctx.lineTo((canvas.width)/10 + (canvas.width)/10 * i - 45 + 75, canvas.height - 100 - 45 + 62.143)
                        ctx.stroke()
                        
                        ctx.lineJoin = ctx.lineCap = 'round';
                        ctx.lineWidth = 7
                        ctx.strokeStyle = 'saddlebrown'
                        ctx.moveTo((canvas.width)/10 + (canvas.width)/10 * i - 45 + 15, canvas.height - 100 - 45 + 27.857)
                        ctx.lineTo((canvas.width)/10 + (canvas.width)/10 * i - 45 + 75, canvas.height - 100 - 45 + 62.143)
                        ctx.stroke()
                        
                        ctx.beginPath()
                        ctx.lineWidth = 1.5
                        ctx.strokeStyle = 'black'
                        ctx.fillStyle = 'white'
                        ctx.strokeText(slot.count, (canvas.width)/10 + (canvas.width)/10 * i  + 18, canvas.height - 58)
                        ctx.fillText(slot.count, (canvas.width)/10 + (canvas.width)/10 * i  + 18, canvas.height - 58)
                        ctx.stroke()
                    }else if(slot.type == 'Axe') {
                        ctx.save()
                        ctx.translate((canvas.width)/10 + (canvas.width)/10 * i , canvas.height - 100 + 7)
                        ctx.rotate(Math.PI/ 180 * 45)
                        ctx.drawImage(Img['axe'], 0 - 40, 0 - 40, 80 , 80 )
                        ctx.restore()
                    }else if(slot.type == 'stone'){
                        ctx.save()
                        ctx.translate((canvas.width)/10 + (canvas.width)/10 * i , canvas.height - 100)
                        ctx.rotate(Math.PI/ 180 * 0)
                        ctx.drawImage(Img['stone'], 0 - 20, 0 - 20, 40, 40)
                        ctx.restore()
                        ctx.beginPath()
                        ctx.lineWidth = 1.5
                        ctx.font = "15px Arial"
                        ctx.strokeStyle = 'black'
                        ctx.fillStyle = 'white'
                        ctx.strokeText(slot.count, (canvas.width)/10 + (canvas.width)/10 * i  + 18, canvas.height - 58)
                        ctx.fillText(slot.count, (canvas.width)/10 + (canvas.width)/10 * i  + 18, canvas.height - 58)
                        ctx.stroke()
                    }
                    
                    //if(playa.inventory[i] != ' ') ctx.drawImage(Img[playa.inventory[i]], 200  + 120.75 * i - 50, canvas.height - 100 - 50, 100, 100)
                    
                })
                ctx.restore()
            }
        }
    }
    socket.on('state', readPack);
}
var die = function() {
    loaded = false
    document.removeEventListener("keydown", handlekeyDown)
    document.removeEventListener("keyup", handlekeyUp)
    document.removeEventListener("mousemove", handlemouseDown)
    document.removeEventListener("mouseup", handlemouseUp)
    document.removeEventListener("mousemove", handlemouseMove)
    clearInterval(moveinterval)
    socket.removeListener('state', readPack)
    socket.removeListener('death', die)
    socket.removeListener('selfUpdate', readSelfUpdatePack)
    socket.removeListener('initPack', readInitPack)
    socket.removeListener('removePack', readRemovePack)
    star.style.display = "block"
    canvas.style.display = "none";
}