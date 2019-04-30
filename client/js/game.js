//Sets a few core values and then sets up onsubmits
/* global changelog io usr loadingTimer*/
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
ut.textContent = "New Features"
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
createImage('stoneaxe',  'png')
createImage('stonepickaxe',  'png')
createImage('stonesword',  'png')
createImage('stonehammer',  'png')
createImage('ironaxe',  'png')
createImage('ironpickaxe',  'png')
createImage('ironsword',  'png')
createImage('ironhammer',  'png')
createImage('goldaxe',  'png')
createImage('goldpickaxe',  'png')
createImage('goldsword',  'png')
createImage('goldhammer',  'png')
createImage('goldhammer',  'png')
createImage('diamondaxe',  'png')
createImage('diamondpickaxe',  'png')
createImage('diamondsword',  'png')
createImage('diamondhammer',  'png')
createImage('emeraldaxe',  'png')
createImage('emeraldpickaxe',  'png')
createImage('emeraldsword',  'png')
createImage('emeraldhammer',  'png')
createImage('amethystaxe',  'png')
createImage('amethystpickaxe',  'png')
createImage('amethystsword',  'png')
createImage('amethysthammer',  'png')
createImage('stone', 'png')
createImage('iron', 'png')
createImage('gold', 'png')
createImage('diamond', 'png')
createImage('emerald', 'png')
createImage('amethyst', 'png')
createImage('woodwall', 'png')
createImage('stonewall', 'png')
createImage('stonewalloneway', 'png')
createImage('stonewalltwoway', 'png')
createImage('stonewallthreeway', 'png')
createImage('stonewallfourway', 'png')
createImage('stonewallcorner', 'png')
createImage('ironwall', 'png')
createImage('wooddoor', 'png')
createImage('stonedoor', 'png')
createImage('woodfloor', 'png')
createImage('stonefloor', 'png')
createImage('craftingtable', 'png')
createImage('carrotfarm', 'png')
createImage('carrot', 'png')
createImage('chest', 'png')
createImage('leather', 'png')
createImage('ironarmor', 'png')

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
    let canJoin = true;
    var movement = {
        up: false,
        down: false,
        left: false,
        right: false,
        pressingAttack: false,
        running: false,
        angle: 0,
        grab:false,
        mousedis:0,
        prot:false,
        chatting:false,
        clanning:false
    }
    let pang = 'left'
    let chatString = ''
    socket.on('unable', function() {

    })
    socket.on('disconnect', () => {die()})
    
    handlekeyDown = function(event) {
        if(event.keyCode == 13){ 
            movement.chatting = !movement.chatting
            if(!chatboxDestroyed){
                if(chatbox.value().length) socket.emit('chat', chatbox.value())
            }
        }
        if(movement.chatting){
            
            return
        }
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
            case 69:
                movement.grab = true
                break;
            case 82:
                movement.prot = true
                if(pang == 'up') pang = 'right'
                else if(pang == 'right') pang = 'down'
                else if(pang == 'down') pang = 'left'
                else if(pang == 'left') pang = 'up'
                break;
            default :
                if(event.keyCode > 48 && event.keyCode < 58){
                    socket.emit('lc', event.keyCode - 48)
                }
                break
        }
        
        if(playa && (playa.crafting || playa.clanning || playa.chesting)){
            movement.up = false
            movement.down = false
            movement.left = false
            movement.right = false
            return
        }
    }
    document.addEventListener('keydown', handlekeyDown);
    handlekeyUp = function(event) {
        if(movement.chatting) return
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
            case 69:
                movement.grab = false
                break;
            case 82:
                movement.prot = false
                break;
        }
        if(playa && (playa.crafting || playa.clanning || playa.chesting)){
            movement.up = false
            movement.down = false
            movement.left = false
            movement.right = false
            return
        }
    }
    document.addEventListener('keyup', handlekeyUp);
    document.addEventListener('contextmenu', event => event.preventDefault());
    handlemouseDown = (e) =>  {
        let found = false
        playa.inventory.forEach((slot, i) => {
            if(e.clientX > (canvas.width)/10 + (canvas.width)/10 * i - 45 && e.clientX < (canvas.width)/10 + (canvas.width)/10 * i - 45 + 90 
              && e.clientY > canvas.height - 100 - 45 && e.clientY < canvas.height - 100 - 45 + 90){
                found = true
                if(slot == ' ') return
                if(e.button == 0) socket.emit('lc', i + 1)
                else if(e.button == 2) socket.emit('rc', i + 1)
            }
        })
        if(playa.armor){
            if(e.clientX > 10 && e.clientX < 10 + 90 &&
               e.clientY > 350 && e.clientY < 350 + 90){
                ctx.fillStyle = '#696969'
                ctx.beginPath()
                ctx.lineWidth = 1.5
                ctx.globalAlpha = 0.75
                ctx.rect(10, 350, 90, 90)
                ctx.fillRect(10, 350, 90, 90)
                ctx.stroke()
                socket.emit('unequip', 'armor')
            }
        }
        if(playa.hat){
            if(e.clientX > 10 && e.clientX < 10 + 90 &&
               e.clientY > 240 && e.clientY < 240 + 90){
                ctx.fillStyle = '#696969'
                ctx.beginPath()
                ctx.lineWidth = 1.5
                ctx.globalAlpha = 0.75
                ctx.rect(10, 240, 90, 90)
                ctx.fillRect(10, 240, 90, 90)
                ctx.stroke()
                socket.emit('unequip', 'hat')
            }
        }
        if(playa.chesting){
            playa.chestables.forEach((item, i) => {
                ctx.lineWidth = 2
                let offSetX = ((i - Math.floor(i/3) * 3) * 80)
                let offSetY = (Math.floor(i / 3) * 80)
                if(
                    e.clientX > (canvas.width - 300)/2 + 40 + offSetX && e.clientX < (canvas.width - 300)/2 + 40 + offSetX + 60 &&
                    e.clientY > (canvas.height - 300)/2 + 40 + offSetY && e.clientY < (canvas.height - 300)/2 + 40 + offSetY + 60
                ){
                    if(e.button == 0) socket.emit('lcChest', i + 1)
                    else if(e.button == 2) socket.emit('rcChest', i + 1)
                }
                
            })
        }
        if(found) return
        if(Math.sqrt(Math.pow((e.clientX-290), 2)+ Math.pow((e.clientY-130), 2)) <= 50){
            socket.emit('clan', true)
        }
        if(playa.clanning && playa.clans && !playa.clan){
            if(e.clientX > 410 + (canvas.width - 820)/2 && e.clientX <  410 + (canvas.width - 820)/2 + (canvas.width - 820)/2 && e.clientY > 110 && e.clientY < 110 + 24 && clanbox.value().length){
                ctx.fillRect(410 + (canvas.width - 820)/2 , 110, (canvas.width - 820)/2, 24)
                socket.emit('createClan', clanbox.value().toUpperCase())
            }
            playa.clans.forEach((name, i) => {
                let offSetX = ((i - Math.floor(i/2) * 2) * (canvas.width - 820)/2)
                let offSetY = (Math.floor(i / 2) * 30)
                if(e.clientX > 400 + (canvas.width - 820)/4 + offSetX && e.clientX < 400 + (canvas.width - 820)/4 + offSetX +  (canvas.width - 820)/4 + 2.5  &&
                  e.clientY > 110 + 26 + offSetY && e.clientY < 110 + 26 + offSetY + 22){
                    socket.emit('joinClan', name)
                    ctx.textAlign = 'start'
                    ctx.font = '12px Arial'
                    //ctx.fillText(name, 410 + offSetX, 110 + 12 + 26 + offSetY)
                    ctx.fillRect(400 + (canvas.width - 820)/4 + offSetX, 110 + 26 + offSetY, (canvas.width - 820)/4 + 2.5 , 22)
                    
                }
            })
        }
        if(playa.clanning && playa.clan && e.clientX > 400 + canvas.width - 900 && e.clientX < 400 + canvas.width - 900 + 75 
            && e.clientY >  canvas.height - 150 && e.clientY < canvas.height - 150 + 25){
            ctx.fillRect(400 + canvas.width - 900, canvas.height - 150, 75, 25)
            socket.emit('leaveClan', '')
          
        }
        if(playa.owner && playa.clanning){
            playa.clanMembers.forEach((player , i) => {
                let offSetX = ((i - Math.floor(i/2) * 2) * (canvas.width - 1000)/2)
                let offSetY = (Math.floor(i / 2) * 50)
                if(e.clientX > 500 + (canvas.width - 1000)/2 - 75 + offSetX && e.clientX < 500 + (canvas.width - 1000)/2 - 75 + offSetX + 50 && e.clientY > 200 -13.5 + offSetY && e.clientY < 200 -13.5 + offSetY + 15){
                    ctx.strokeStyle = 'black'
                    ctx.fillStyle = 'crimson'
                    ctx.lineWidth = 7.5
                    ctx.beginPath()
                    ctx.rect(500 + (canvas.width - 1000)/2 - 75 + offSetX, 200 -13.5 + offSetY, 50, 15)
                    ctx.stroke()
                    ctx.fillRect(500 + (canvas.width - 1000)/2 - 75 + offSetX, 200 -13.5 + offSetY, 50, 15)
                    socket.emit('removeMember', player.id)
                }
                
            })
        }
        if(playa.crafting && playa.craftablesEx){
            playa.craftablesEx.forEach((craft, i) => {
                let offSetX = ((i - Math.floor(i/13) * 13) * 80)
                let offSetY = (Math.floor(i / 13) * 80)
                if(e.clientX > offSetX + 120 && e.clientX < offSetX + 120 + 60
                  && e.clientY > offSetY + 120 && e.clientY < offSetY + 120 + 60){
                    found = true
                     if(craft.craftable) socket.emit('craftEx', craft.craft)
                }
            })
        }
        if(playa.req && e.clientX > 810 && e.clientX < 810 + 50 && e.clientY > 50 && e.clientY < 50 + 30){
            ctx.strokeStyle = 'black'
            ctx.lineWidth = 7.5
            ctx.rect(810, 50, 50, 30)
            ctx.stroke()
            ctx.fillStyle = '#006400'
            ctx.fillRect(810, 50, 50, 30)
            socket.emit('acceptReq')
        }
        if(playa.req && e.clientX > 810 + 70 && e.clientX < 810 + 50 + 70 && e.clientY > 50 && e.clientY < 50 + 30){
            ctx.strokeStyle = 'black'
            ctx.lineWidth = 7.5
            ctx.rect(810 + 70, 50, 50, 30)
            ctx.stroke()
            ctx.fillStyle = 'firebrick'
            ctx.fillRect(810 + 70, 50, 50, 30)
            socket.emit('denyReq')
        }
        else {
            playa.craftables.forEach((craft, i) => {
                if(e.clientX > 90 + (i % 2 == 1 ? 80 : 0) && e.clientX < 90 + (i % 2 == 1 ? 80 : 0) + 60
                  && e.clientY > 90 + (Math.floor(i / 2) * 80) && e.clientY < 90 + (Math.floor(i / 2) * 80) + 60){
                    found = true
                   socket.emit('craft', craft)
                
                }
            })
        }
        if(e.button == 2) found = true
        /*
        
            ctx.rect((canvas.width)/10 + (canvas.width)/10 * i - 45, canvas.height - 100 - 45, 90, 90)
            ctx.fillRect((canvas.width)/10 + (canvas.width)/10 * i  - 45, canvas.height - 100 - 45, 90, 90)
        */
        
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
        let mousedis = Math.sqrt(Math.pow(0 - x, 2) + Math.pow(0 - y, 2))
        if (radian < 0) {
            radian += Math.PI * 2;
        }
        var angle = radian * 180 / Math.PI;
        movement.angle = angle;
        movement.mousedis = mousedis
    }
    var leaderboard = []
    let dropped = []
    let chatbox
    let chatboxDestroyed = true
    
    let clanbox
    let clanboxDestroyed = true
    document.addEventListener('mousemove', handlemouseMove);
    window.moveinterval = setInterval(function() {
        socket.emit('movement', movement);
    }, 1000 / 60);
    class miniPlayer {
        constructor(initPack){
            this.usr = initPack.usr || ''
            this.x = initPack.x
            this.y = initPack.y
            this.hp = initPack.health || 20
            this.maxHp = initPack.maxHp || 20
            this.food = initPack.food || 20 
            this.maxFood = initPack.maxFood || 20
            this.mainHand = initPack.mainHand || 'hand'
            this.id = initPack.id || Math.random()
            this.angle = initPack.angle || 0
            this.lhit = initPack.lhit || false
            this.rhit = initPack.rhit || false
            this.rad = initPack.rad || 28
            this.msg = []
            this.clan = initPack.clan || null
        }
        drawPerf(opt){
            if(!opt) opt = {}
            ctx.restore()
            ctx.save()
            ctx.scale(this.rad/25, this.rad/25)
            var currx = (this.x)/(this.rad/25)
            var curry = (this.y)/(this.rad/25)
            if(currx < -this.rad || currx > canvas.width + this.rad) return
            if(curry < -this.rad || curry > canvas.height + this.rad) return
            ctx.save();
            
            //ctx.drawImage(Img.player, currx - this.rad, curry - this.rad, this.rad * 2, this.rad * 2)
            
            ctx.save()
            ctx.beginPath()
            ctx.fillStyle = 'red';
            if(opt.drawHp) var hpBar = 80 * this.rad/25 * this.hp / this.maxHp
            ctx.fillRect(currx - 40 * this.rad/25 , curry - 50 * this.rad/25, hpBar, 10);
            ctx.fillStyle = 'blue';
            if(opt.drawStamina) var staminaBar = 80 * this.rad/25 * this.stamina / this.maxStamina
            ctx.fillRect(currx - 40 * this.rad/25, curry - 2 * this.rad + 10, staminaBar, 10　);
            ctx.fillStyle = 'orange'
            if(opt.drawFood) var foodBar = 80 * this.rad/25 * this.food / this.maxFood
            ctx.fillRect(currx - 40 * this.rad/25, curry - 50 * this.rad/25 - 10, foodBar, 10　);
            if(this.clan){ 
                ctx.textAlign = "center"
                ctx.font = '18px Zorque';
                ctx.strokeStyle = 'black';
                ctx.lineWidth = 2;
                ctx.beginPath()
                ctx.strokeText(`[${this.clan}]${this.usr}`, currx, curry + 55 * this.rad/25); 
                ctx.fillStyle = 'white';
                ctx.fillText(`[${this.clan}]${this.usr}`, currx, curry + 55 * this.rad/25);
            }else {
                ctx.textAlign = "center"
                ctx.font = '18px Zorque';
                ctx.strokeStyle = 'black';
                ctx.lineWidth = 2;
                ctx.beginPath()
                ctx.strokeText(this.usr, currx, curry + 55 * this.rad/25); 
                ctx.fillStyle = 'white';
                ctx.fillText(this.usr, currx, curry + 55 * this.rad/25);
            }
            this.msg.forEach((msgObj, i) => {
                if(this.msg.length == 1 && i == 0){
                    ctx.globalAlpha = Math.abs(msgObj.per - 1)
                    ctx.textAlign = "center"
                    ctx.font = '12px Arial';
                    ctx.strokeStyle = 'black';
                    ctx.lineWidth = 2;
                    ctx.beginPath()
                    ctx.strokeText(msgObj.msg, currx, curry - 60 * this.rad/25);
                    ctx.fillStyle = 'white';
                    ctx.fillText(msgObj.msg, currx, curry - 60 * this.rad/25);
                }else if(this.msg.length == 2 && i == 1){
                    ctx.globalAlpha = Math.abs(msgObj.per - 1)
                    ctx.textAlign = "center"
                    ctx.font = '12px Arial';
                    ctx.strokeStyle = 'black';
                    ctx.lineWidth = 2;
                    ctx.beginPath()
                    ctx.strokeText(msgObj.msg, currx, curry - 60 * this.rad/25);
                    ctx.fillStyle = 'white';
                    ctx.fillText(msgObj.msg, currx, curry - 60 * this.rad/25);
                }else if(this.msg.length == 2 && i == 0){
                    ctx.globalAlpha = Math.abs(msgObj.per - 1)
                    ctx.textAlign = "center"
                    ctx.font = '12px Arial';
                    ctx.strokeStyle = 'black';
                    ctx.lineWidth = 2;
                    ctx.beginPath()
                    ctx.strokeText(msgObj.msg, currx, curry - 20 - 60 * this.rad/25);
                    ctx.fillStyle = 'white';
                    ctx.fillText(msgObj.msg, currx, curry - 20 - 60 * this.rad/25);
                }
            })
            ctx.globalAlpha = 1
            ctx.translate(currx, curry)
            
            ctx.rotate((Math.PI / 180) * this.angle)
            ctx.scale(this.rad/25, this.rad/25)
            if (this.mainHand == 'hand') {
                if (!(this.rhit)) {
                    ctx.beginPath()
                    ctx.fillStyle = 'black'
                    ctx.arc(32, 15, 7.5, 0, 2 * Math.PI)
                    ctx.fill()
                    ctx.beginPath()
                    ctx.fillStyle = '#7F7F7F'
                    ctx.arc(32, 15, 7.5 - 2, 0, 2 * Math.PI)
                    ctx.fill()
                    //ctx.drawImage(Img.hand, 32 - 7.5, 15 - 7.5, 15, 15)
                } else {
                    ctx.save();
                    ctx.translate(32 - 7.5, 15 - 7.5);
                    ctx.rotate((Math.PI / 180) * (360 - (-Math.abs(-160 * this.punchper + 80) + 80)))
                    ctx.beginPath()
                    ctx.fillStyle = 'black'
                    ctx.arc(7.5, 7.5, 7.5, 0, 2 * Math.PI)
                    ctx.fill()
                    ctx.beginPath()
                    ctx.fillStyle = '#7F7F7F'
                    ctx.arc(7.5, 7.5, 7.5 - 2, 0, 2 * Math.PI)
                    ctx.fill()
                    ctx.restore()
                }
                if (!(this.lhit)) {
                    ctx.beginPath()
                    ctx.fillStyle = 'black'
                    ctx.arc(32, -15, 7.5, 0, 2 * Math.PI)
                    ctx.fill()
                    ctx.beginPath()
                    ctx.fillStyle = '#7F7F7F'
                    ctx.arc(32, -15, 7.5 - 2, 0, 2 * Math.PI)
                    ctx.fill()
                } else {
                    ctx.save();
                    ctx.translate(32 - 7.5, -(15 - 7.5));
                    ctx.rotate((Math.PI / 180) * (0 + (-Math.abs(-160 * this.punchper + 80) + 80)))
                    ctx.beginPath()
                    ctx.fillStyle = 'black'
                    ctx.arc(7.5, -7.5, 7.5, 0, 2 * Math.PI)
                    ctx.fill()
                    ctx.beginPath()
                    ctx.fillStyle = '#7F7F7F'
                    ctx.arc(7.5, -7.5, 7.5 - 2, 0, 2 * Math.PI)
                    ctx.fill()
                    ctx.restore();
                }
            } else {
                if(/Axe|Pickaxe|Sword|Hammer/.test(this.mainHand)){
                    if(/Axe/.test(this.mainHand)){
                        let img = this.mainHand.toLowerCase().replace(/\s/, '')
                        ctx.save()
                        ctx.translate(32 - 7.5 + 5, 0)
                        if(this.hitting) ctx.rotate((Math.PI / 180) * (360 - (-Math.abs(-120 * this.per + 60) + 60)))
                        ctx.save()
                        ctx.translate(-2.5 + 75/2 - 32 - 7.5 + 10, -30 + 75/2)
                        ctx.rotate((Math.PI / 180) * 180)
                        ctx.drawImage(Img[img], 0 - 75/2, 0 - 75/2, 75, 75)
                        ctx.restore()
                        ctx.drawImage(Img.hand, 0, 15 - 7.5 - 5, 15, 15)
                        ctx.drawImage(Img.hand, 0, 15 - 2 - 7.5 - 30, 15, 15)
                        ctx.restore()
                    }else if(/Pickaxe/.test(this.mainHand)){
                        let img = this.mainHand.toLowerCase().replace(/\s/, '')
                        ctx.save()
                        ctx.translate(32 - 7.5 + 5, 0)
                        
                        if(this.hitting) ctx.rotate((Math.PI / 180) * (360 - (-Math.abs(-120 * this.per + 60) + 60)))
                        ctx.save()
                        ctx.translate(-2.5 + 75/2 - 32 - 7.5 + 10, -30 + 75/2)
                        ctx.rotate((Math.PI / 180) * 180)
                        ctx.drawImage(Img[img], 0 - 75/2, 0 - 75/2, 75, 75)
                        ctx.restore()
                        ctx.drawImage(Img.hand, 0, 15 - 7.5 - 5, 15, 15)
                        ctx.drawImage(Img.hand, 0, 15 - 2 - 7.5 - 30, 15, 15)
                        ctx.restore()
                    }else if(/Sword/.test(this.mainHand)){
                        let img = this.mainHand.toLowerCase().replace(/\s/, '')
                        ctx.save()
                        ctx.translate(32 - 7.5 + 5, 0)
                        ctx.strokeStyle = 'black'
                        ctx.lineWidth = '20px'
                        ctx.drawImage(Img.hand, -15, 15 - 7.5 - 5 + 25, 15, 15)
                        if(this.hitting) ctx.rotate((Math.PI / 180) * (360 - (-Math.abs(-120 * this.per + 60) + 60)))
                        ctx.save()
                        ctx.translate(-2.5 + 75/2 - 32 - 7.5 + 10, -30 + 75/2)
                        ctx.rotate((Math.PI / 180) * 180)
                        ctx.drawImage(Img[img], 0 - 75/2, 0 - 75/2, 75, 75)
                        ctx.restore()
                    
                        ctx.drawImage(Img.hand, 0, 15 - 2 - 7.5 - 30, 15, 15)
                        ctx.restore()
                    }else if(/Hammer/.test(this.mainHand)){
                        let img = this.mainHand.toLowerCase().replace(/\s/, '')
                        ctx.save()
                        ctx.translate(32 - 7.5 + 5, 0)
                        if(this.hitting) ctx.rotate((Math.PI / 180) * (360 - (-Math.abs(-120 * this.per + 60) + 60)))
                        ctx.save()
                        ctx.translate(-2.5 + 75/2 - 32 - 7.5 + 10, -30 + 75/2)
                        ctx.rotate((Math.PI / 180) * 180)
                        ctx.drawImage(Img[img], 0 - 75/2, 0 - 75/2, 75, 75)
                        ctx.restore()
                        ctx.drawImage(Img.hand, 0, 15 - 7.5 - 5, 15, 15)
                        ctx.drawImage(Img.hand, 0, 15 - 2 - 7.5 - 30, 15, 15)
                        ctx.restore()
                    }
                }
                if(/Wall|Door|Floor|Crafting Table|Chest/.test(this.mainHand)){
                    let img = this.mainHand.toLowerCase().replace(/\s/, '')
                    ctx.drawImage(Img.hand, 32 - 7.5, -15 - 7.5, 15, 15)
                    ctx.save()
                    ctx.translate(32 - 7.5 + 5, 0)
                    ctx.drawImage(Img.hand, -15, 15 - 7.5 - 5 + 25, 15, 15)
                    ctx.restore()
                }
                if(this.mainHand == 'carrot'){
                    ctx.save();
                    ctx.translate(32, 15);
                    let r
                    if(this.per) r = (Math.PI / 180) * (360 - (-Math.abs(-160 * this.per + 80) + 80))
                    else r = 0
                    if(r < 180) r += 180
                    else r -= 180
                    ctx.rotate(r)
                    ctx.beginPath()
                    ctx.fillStyle = 'black'
                    ctx.arc(0, 0, 7.5, 0, 2 * Math.PI)
                    ctx.fill()
                    ctx.beginPath()
                    ctx.fillStyle = '#7F7F7F'
                    ctx.arc(0, 0, 7.5 - 2, 0, 2 * Math.PI) 
                    ctx.fill()
                    ctx.drawImage(Img.carrot, 0 - 15, 0 - 15, 30, 30)
                    ctx.restore()
                    
                    ctx.beginPath()
                    ctx.fillStyle = 'black'
                    ctx.arc(32, -15, 7.5, 0, 2 * Math.PI)
                    ctx.fill()
                    ctx.beginPath()
                    ctx.fillStyle = '#7F7F7F'
                    ctx.arc(32, -15, 7.5 - 2, 0, 2 * Math.PI)
                    ctx.fill()
                }
                //ctx.drawImage(Img[this.mainHand], 32 - 7.5, 15 - 7.5, 15, 15)
            }
            ctx.restore()
            ctx.beginPath()
            ctx.fillStyle = '#000010'
            ctx.arc(currx, curry, this.rad, 0, 2 * Math.PI)
            ctx.fill()
            ctx.beginPath()
            ctx.fillStyle = '#C3C3C3'
            ctx.arc(currx, curry, this.rad - 2, 0, 2 * Math.PI)
            ctx.fill()
            ctx.translate(currx, curry)
            ctx.rotate((Math.PI / 180) * this.angle)
            ctx.fillStyle = 'black'
            ctx.beginPath()
            ctx.arc(0 + 9 * this.rad/28, 0 + 8 * this.rad/28, 6 * this.rad/28, 0, 2*Math.PI);
            ctx.arc(0 + 9 * this.rad/28, 0 - 8 * this.rad/28, 6 * this.rad/28, 0, 2*Math.PI);
            ctx.fill()
            ctx.fillStyle = 'white'
            ctx.beginPath()
            ctx.arc(0 + 6.5 * this.rad/28, 0 + 7 * this.rad/28, 2.5 * this.rad/28, 0, 2*Math.PI);
            ctx.arc(0 + 6.5 * this.rad/28, 0 - 7 * this.rad/28, 2.5 * this.rad/28, 0, 2*Math.PI);
            ctx.fill()
            ctx.restore();
            ctx.restore();
        }
    }
    let clanMember1 = new miniPlayer({
        x:270,
        y:110,
        rad:20,
        angle:70
    })
    let clanMember2 = new miniPlayer({
        x:300,
        y:130,
        rad:20,
        angle:70
    })

    /*ctx.fillStyle = 'black'
    ctx.beginPath()
    ctx.arc(290, 120, 50, 0, 2 * Math.PI)
    ctx.fill()
    ctx.fillStyle = 'grey'
    ctx.beginPath()
    ctx.arc(290, 120, 47, 0, 2 * Math.PI)
    ctx.fill()
    */
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
            this.food = initPack.health
            this.maxFood = initPack.maxFood
            this.mainHand = initPack.mainHand
            this.id = initPack.id
            this.angle = initPack.angle
            this.lhit = initPack.lhit
            this.rhit = initPack.rhit
            this.armor = initPack.armor
            this.rad = 28
            this.msg = []
            this.clan = initPack.clan
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
            
            ctx.save()
            ctx.beginPath()
            ctx.fillStyle = 'red';
            ctx.fillRect(currx - 40 * this.rad/25 , curry - 50 * this.rad/25, hpBar, 10);
            if (this.id == socket.id) { 
                ctx.fillStyle = 'blue';
                var staminaBar = 80 * this.rad/25 * this.stamina / this.maxStamina
                ctx.fillRect(currx - 40 * this.rad/25, curry - 2 * this.rad + 10, staminaBar, 10　);
                ctx.fillStyle = 'orange'
                var foodBar = 80 * this.rad/25 * this.food / this.maxFood
                ctx.fillRect(currx - 40 * this.rad/25, curry - 50 * this.rad/25 - 10, foodBar, 10　);
            }
            if(this.clan){ 
                ctx.textAlign = "center"
                ctx.font = '18px Zorque';
                ctx.strokeStyle = 'black';
                ctx.lineWidth = 2;
                ctx.beginPath()
                ctx.strokeText(`[${this.clan}]${this.usr}`, currx, curry + 55 * this.rad/25); 
                ctx.fillStyle = 'white';
                ctx.fillText(`[${this.clan}]${this.usr}`, currx, curry + 55 * this.rad/25);
            }else {
                ctx.textAlign = "center"
                ctx.font = '18px Zorque';
                ctx.strokeStyle = 'black';
                ctx.lineWidth = 2;
                ctx.beginPath()
                ctx.strokeText(this.usr, currx, curry + 55 * this.rad/25); 
                ctx.fillStyle = 'white';
                ctx.fillText(this.usr, currx, curry + 55 * this.rad/25);
            }
            if(playa.admin){
                let p = leaderboard.findIndex(player => player.id == this.id) + 1
                ctx.textAlign = "center"
                ctx.font = '18px Zorque';
                ctx.strokeStyle = 'black';
                ctx.lineWidth = 2;
                ctx.beginPath()
                ctx.strokeText(p, currx, curry + 73 * this.rad/25); 
                ctx.fillStyle = 'white';
                ctx.fillText(p, currx, curry + 73 * this.rad/25);
            }
            this.msg.forEach((msgObj, i) => {
                if(this.msg.length == 1 && i == 0){
                    ctx.globalAlpha = Math.abs(msgObj.per - 1)
                    ctx.textAlign = "center"
                    ctx.font = '12px Arial';
                    ctx.strokeStyle = 'black';
                    ctx.lineWidth = 2;
                    ctx.beginPath()
                    ctx.strokeText(msgObj.msg, currx, curry - 60 * this.rad/25);
                    ctx.fillStyle = 'white';
                    ctx.fillText(msgObj.msg, currx, curry - 60 * this.rad/25);
                }else if(this.msg.length == 2 && i == 1){
                    ctx.globalAlpha = Math.abs(msgObj.per - 1)
                    ctx.textAlign = "center"
                    ctx.font = '12px Arial';
                    ctx.strokeStyle = 'black';
                    ctx.lineWidth = 2;
                    ctx.beginPath()
                    ctx.strokeText(msgObj.msg, currx, curry - 60 * this.rad/25);
                    ctx.fillStyle = 'white';
                    ctx.fillText(msgObj.msg, currx, curry - 60 * this.rad/25);
                }else if(this.msg.length == 2 && i == 0){
                    ctx.globalAlpha = Math.abs(msgObj.per - 1)
                    ctx.textAlign = "center"
                    ctx.font = '12px Arial';
                    ctx.strokeStyle = 'black';
                    ctx.lineWidth = 2;
                    ctx.beginPath()
                    ctx.strokeText(msgObj.msg, currx, curry - 20 - 60 * this.rad/25);
                    ctx.fillStyle = 'white';
                    ctx.fillText(msgObj.msg, currx, curry - 20 - 60 * this.rad/25);
                }
            })
            ctx.globalAlpha = 1
            ctx.translate(currx, curry)
            
            ctx.rotate((Math.PI / 180) * this.angle)
            ctx.scale(this.rad/25, this.rad/25)
            if (this.mainHand == 'hand') {
                if (!(this.rhit)) {
                    ctx.beginPath()
                    ctx.fillStyle = 'black'
                    ctx.arc(32, 15, 7.5, 0, 2 * Math.PI)
                    ctx.fill()
                    ctx.beginPath()
                    ctx.fillStyle = '#7F7F7F'
                    ctx.arc(32, 15, 7.5 - 2, 0, 2 * Math.PI)
                    ctx.fill()
                    //ctx.drawImage(Img.hand, 32 - 7.5, 15 - 7.5, 15, 15)
                } else {
                    ctx.save();
                    ctx.translate(32 - 7.5, 15 - 7.5);
                    ctx.rotate((Math.PI / 180) * (360 - (-Math.abs(-160 * this.punchper + 80) + 80)))
                    ctx.beginPath()
                    ctx.fillStyle = 'black'
                    ctx.arc(7.5, 7.5, 7.5, 0, 2 * Math.PI)
                    ctx.fill()
                    ctx.beginPath()
                    ctx.fillStyle = '#7F7F7F'
                    ctx.arc(7.5, 7.5, 7.5 - 2, 0, 2 * Math.PI)
                    ctx.fill()
                    ctx.restore()
                }
                if (!(this.lhit)) {
                    ctx.beginPath()
                    ctx.fillStyle = 'black'
                    ctx.arc(32, -15, 7.5, 0, 2 * Math.PI)
                    ctx.fill()
                    ctx.beginPath()
                    ctx.fillStyle = '#7F7F7F'
                    ctx.arc(32, -15, 7.5 - 2, 0, 2 * Math.PI)
                    ctx.fill()
                } else {
                    ctx.save();
                    ctx.translate(32 - 7.5, -(15 - 7.5));
                    ctx.rotate((Math.PI / 180) * (0 + (-Math.abs(-160 * this.punchper + 80) + 80)))
                    ctx.beginPath()
                    ctx.fillStyle = 'black'
                    ctx.arc(7.5, -7.5, 7.5, 0, 2 * Math.PI)
                    ctx.fill()
                    ctx.beginPath()
                    ctx.fillStyle = '#7F7F7F'
                    ctx.arc(7.5, -7.5, 7.5 - 2, 0, 2 * Math.PI)
                    ctx.fill()
                    ctx.restore();
                }
            } else {
                if(/Axe|Pickaxe|Sword|Hammer/.test(this.mainHand)){
                    if(/Axe/.test(this.mainHand)){
                        let img = this.mainHand.toLowerCase().replace(/\s/, '')
                        ctx.save()
                        ctx.translate(32 - 7.5 + 5, 0)
                        if(this.hitting) ctx.rotate((Math.PI / 180) * (360 - (-Math.abs(-120 * this.per + 60) + 60)))
                        ctx.save()
                        ctx.translate(-2.5 + 75/2 - 32 - 7.5 + 10, -30 + 75/2)
                        ctx.rotate((Math.PI / 180) * 180)
                        ctx.drawImage(Img[img], 0 - 75/2, 0 - 75/2, 75, 75)
                        ctx.restore()
                        ctx.drawImage(Img.hand, 0, 15 - 7.5 - 5, 15, 15)
                        ctx.drawImage(Img.hand, 0, 15 - 2 - 7.5 - 30, 15, 15)
                        ctx.restore()
                    }else if(/Pickaxe/.test(this.mainHand)){
                        let img = this.mainHand.toLowerCase().replace(/\s/, '')
                        ctx.save()
                        ctx.translate(32 - 7.5 + 5, 0)
                        
                        if(this.hitting) ctx.rotate((Math.PI / 180) * (360 - (-Math.abs(-120 * this.per + 60) + 60)))
                        ctx.save()
                        ctx.translate(-2.5 + 75/2 - 32 - 7.5 + 10, -30 + 75/2)
                        ctx.rotate((Math.PI / 180) * 180)
                        ctx.drawImage(Img[img], 0 - 75/2, 0 - 75/2, 75, 75)
                        ctx.restore()
                        ctx.drawImage(Img.hand, 0, 15 - 7.5 - 5, 15, 15)
                        ctx.drawImage(Img.hand, 0, 15 - 2 - 7.5 - 30, 15, 15)
                        ctx.restore()
                    }else if(/Sword/.test(this.mainHand)){
                        let img = this.mainHand.toLowerCase().replace(/\s/, '')
                        ctx.save()
                        ctx.translate(32 - 7.5 + 5, 0)
                        ctx.strokeStyle = 'black'
                        ctx.lineWidth = '20px'
                        ctx.drawImage(Img.hand, -15, 15 - 7.5 - 5 + 25, 15, 15)
                        if(this.hitting) ctx.rotate((Math.PI / 180) * (360 - (-Math.abs(-120 * this.per + 60) + 60)))
                        ctx.save()
                        ctx.translate(-2.5 + 75/2 - 32 - 7.5 + 10, -30 + 75/2)
                        ctx.rotate((Math.PI / 180) * 180)
                        ctx.drawImage(Img[img], 0 - 75/2, 0 - 75/2, 75, 75)
                        ctx.restore()
                    
                        ctx.drawImage(Img.hand, 0, 15 - 2 - 7.5 - 30, 15, 15)
                        ctx.restore()
                    }else if(/Hammer/.test(this.mainHand)){
                        let img = this.mainHand.toLowerCase().replace(/\s/, '')
                        ctx.save()
                        ctx.translate(32 - 7.5 + 5, 0)
                        if(this.hitting) ctx.rotate((Math.PI / 180) * (360 - (-Math.abs(-120 * this.per + 60) + 60)))
                        ctx.save()
                        ctx.translate(-2.5 + 75/2 - 32 - 7.5 + 10, -30 + 75/2)
                        ctx.rotate((Math.PI / 180) * 180)
                        ctx.drawImage(Img[img], 0 - 75/2, 0 - 75/2, 75, 75)
                        ctx.restore()
                        ctx.drawImage(Img.hand, 0, 15 - 7.5 - 5, 15, 15)
                        ctx.drawImage(Img.hand, 0, 15 - 2 - 7.5 - 30, 15, 15)
                        ctx.restore()
                    }
                }
                if(/Wall|Door|Floor|Crafting Table|Chest/.test(this.mainHand)){
                    let img = this.mainHand.toLowerCase().replace(/\s/, '')
                    ctx.drawImage(Img.hand, 32 - 7.5, -15 - 7.5, 15, 15)
                    ctx.save()
                    ctx.translate(32 - 7.5 + 5, 0)
                    ctx.drawImage(Img.hand, -15, 15 - 7.5 - 5 + 25, 15, 15)
                    ctx.restore()
                }
                if(this.mainHand == 'carrot'){
                    ctx.save();
                    ctx.translate(32, 15);
                    let r
                    if(this.per) r = (Math.PI / 180) * (360 - (-Math.abs(-160 * this.per + 80) + 80))
                    else r = 0
                    if(r < 180) r += 180
                    else r -= 180
                    ctx.rotate(r)
                    ctx.beginPath()
                    ctx.fillStyle = 'black'
                    ctx.arc(0, 0, 7.5, 0, 2 * Math.PI)
                    ctx.fill()
                    ctx.beginPath()
                    ctx.fillStyle = '#7F7F7F'
                    ctx.arc(0, 0, 7.5 - 2, 0, 2 * Math.PI) 
                    ctx.fill()
                    ctx.drawImage(Img.carrot, 0 - 15, 0 - 15, 30, 30)
                    ctx.restore()
                    
                    ctx.beginPath()
                    ctx.fillStyle = 'black'
                    ctx.arc(32, -15, 7.5, 0, 2 * Math.PI)
                    ctx.fill()
                    ctx.beginPath()
                    ctx.fillStyle = '#7F7F7F'
                    ctx.arc(32, -15, 7.5 - 2, 0, 2 * Math.PI)
                    ctx.fill()
                }
                //ctx.drawImage(Img[this.mainHand], 32 - 7.5, 15 - 7.5, 15, 15)
            }
            ctx.restore()
            ctx.beginPath()
            ctx.fillStyle = '#000010'
            ctx.arc(currx, curry, this.rad, 0, 2 * Math.PI)
            ctx.fill()
            ctx.beginPath()
            ctx.fillStyle = '#C3C3C3'
            ctx.arc(currx, curry, this.rad - 2, 0, 2 * Math.PI)
            ctx.fill()
            if(this.armor) ctx.drawImage(Img[this.armor], currx - this.rad, curry - this.rad, this.rad * 2, this.rad * 2)
            ctx.translate(currx, curry)
            ctx.rotate((Math.PI / 180) * this.angle)
            ctx.fillStyle = 'black'
            ctx.beginPath()
            ctx.arc(0 + 9 * this.rad/28, 0 + 8 * this.rad/28, 6 * this.rad/28, 0, 2*Math.PI);
            ctx.arc(0 + 9 * this.rad/28, 0 - 8 * this.rad/28, 6 * this.rad/28, 0, 2*Math.PI);
            ctx.fill()
            ctx.fillStyle = 'white'
            ctx.beginPath()
            ctx.arc(0 + 6.5 * this.rad/28, 0 + 7 * this.rad/28, 2.5 * this.rad/28, 0, 2*Math.PI);
            ctx.arc(0 + 6.5 * this.rad/28, 0 - 7 * this.rad/28, 2.5 * this.rad/28, 0, 2*Math.PI);
            ctx.fill()
            ctx.restore();
            ctx.restore();
            if(this.posPlace && /Wall|Door|Floor|Crafting Table|Chest/.test(this.mainHand)){
                let img = this.mainHand.toLowerCase().replace(/\s/, '')
                ctx.restore()
                ctx.save()
                ctx.globalAlpha =0.5
                if(/Wall|Door|Floor|Crafting Table/.test(this.mainHand)) ctx.drawImage(Img[img], this.posPlace.x - 50 + x, this.posPlace.y - 50 + y, 100, 100)
                else if(/Chest/.test(this.mainHand)){ 
                    ctx.save()
                    ctx.translate(this.posPlace.x + x, this.posPlace.y + y)
                    if(pang == 'left' || pang == 'right'){
                        ctx.rotate(Math.PI/180 * 90)
                    }
                    ctx.drawImage(Img[img], 0 - 47.5, 0 - 25, 95, 50)
                }
                if(/Door/.test(this.mainHand)){
                      if(pang == 'up'){
                          ctx.save()
                          ctx.beginPath()
                          ctx.fillStyle = '#767676'
                          ctx.arc(this.posPlace.x + 50 + x, this.posPlace.y - 50 + y, 8, 0, 2 * Math.PI)
                          '#FF7D36'
                          ctx.fill()
                          ctx.beginPath()
                          ctx.fillStyle = '#c0c0c0'
                          ctx.arc(this.posPlace.x + 50 + x, this.posPlace.y - 50 + y, 6, 0, 2 * Math.PI)
                          ctx.fill()

                          ctx.beginPath()
                          ctx.fillStyle = '#767676'
                          ctx.arc(this.posPlace.x - 15 + x, this.posPlace.y - 50 + y, 10, 0, 2 * Math.PI)
                          ctx.fill()
                          ctx.beginPath()
                          ctx.fillStyle = '#80461B'
                          ctx.arc(this.posPlace.x - 15 + x, this.posPlace.y - 50 + y, 7, 0, 2 * Math.PI)
                          ctx.fill()
                          ctx.restore()
                      }
                      if(pang == 'down'){
                          ctx.save()
                          ctx.beginPath()
                          ctx.fillStyle = '#767676'
                          ctx.arc(this.posPlace.x - 50 + x, this.posPlace.y + 50 + y, 8, 0, 2 * Math.PI)
                          '#FF7D36'
                          ctx.fill()
                          ctx.beginPath()
                          ctx.fillStyle = '#c0c0c0'
                          ctx.arc(this.posPlace.x - 50 + x, this.posPlace.y + 50 + y, 6, 0, 2 * Math.PI)
                          ctx.fill()

                          ctx.beginPath()
                          ctx.fillStyle = '#767676'
                          ctx.arc(this.posPlace.x + 15 + x, this.posPlace.y + 50 + y, 10, 0, 2 * Math.PI)
                          ctx.fill()
                          ctx.beginPath()
                          ctx.fillStyle = '#80461B'
                          ctx.arc(this.posPlace.x + 15 + x, this.posPlace.y + 50 + y, 7, 0, 2 * Math.PI)
                          ctx.fill()
                          ctx.restore()
                      }

                      if(pang == 'left'){
                          ctx.save()
                          ctx.beginPath()
                          ctx.fillStyle = '#767676'
                          ctx.arc(this.posPlace.x - 50 + x, this.posPlace.y - 50 + y, 8, 0, 2 * Math.PI)
                          '#FF7D36'
                          ctx.fill()
                          ctx.beginPath()
                          ctx.fillStyle = '#c0c0c0'
                          ctx.arc(this.posPlace.x - 50 + x, this.posPlace.y - 50 + y, 6, 0, 2 * Math.PI)
                          ctx.fill()

                          ctx.beginPath()
                          ctx.fillStyle = '#767676'
                          ctx.arc(this.posPlace.x - 50 + x, this.posPlace.y + 15 + y, 10, 0, 2 * Math.PI)
                          ctx.fill()
                          ctx.beginPath()
                          ctx.fillStyle = '#80461B'
                          ctx.arc(this.posPlace.x - 50 + x, this.posPlace.y + 15 + y, 7, 0, 2 * Math.PI)
                          ctx.fill()
                          ctx.restore()
                      }
                      if(pang == 'right'){
                          ctx.save()
                          ctx.beginPath()
                          ctx.fillStyle = '#767676'
                          ctx.arc(this.posPlace.x + 50 + x, this.posPlace.y + 50 + y, 8, 0, 2 * Math.PI)
                          '#FF7D36'
                          ctx.fill()
                          ctx.beginPath()
                          ctx.fillStyle = '#c0c0c0'
                          ctx.arc(this.posPlace.x + 50 + x, this.posPlace.y + 50 + y, 6, 0, 2 * Math.PI)
                          ctx.fill()

                          ctx.beginPath()
                          ctx.fillStyle = '#767676'
                          ctx.arc(this.posPlace.x + 50 + x, this.posPlace.y - 15 + y, 10, 0, 2 * Math.PI)
                          ctx.fill()
                          ctx.beginPath()
                          ctx.fillStyle = '#80461B'
                          ctx.arc(this.posPlace.x + 50 + x, this.posPlace.y - 15 + y, 7, 0, 2 * Math.PI)
                          ctx.fill()
                          ctx.restore()
                      }
                }
                ctx.restore()
            }
        }
        processInitpack(initPack) {
            this.x = initPack.x
            this.y = initPack.y
            this.hp = initPack.health
            this.maxHp = initPack.maxHp
            this.food = initPack.food
            this.maxFood = initPack.maxFood
            this.mainHand = initPack.mainHand
            this.id = initPack.id
            this.angle = initPack.angle
            this.lhit = initPack.lhit
            this.rhit = initPack.rhit
            this.armor = initPack.armor
            this.hitting = initPack.hitting
            this.punchper = initPack.punchper
            this.per = initPack.per
            this.msg = initPack.msg
            this.clan = initPack.clan
            this.owner = initPack.owner
        }
        processSelfInitPack(initPack) {
            this.stamina = initPack.stamina
            this.maxStamina = initPack.maxStamina
            this.inventory = initPack.inventory
            this.crafting = initPack.crafting
            this.chesting = initPack.chesting
            this.craftables = initPack.craftables
            this.craftablesEx = initPack.craftablesEx
            this.chestables = initPack.chestables
            this.posPlace = initPack.posPlace
            this.clanning = initPack.clanning
            this.clans = initPack.clans
            this.clanMembers = initPack.clanMembers
            this.req = initPack.req
            this.admin = initPack.admin
            //if(this.clans) console.log(this.clans)
        }
    }
    class Demon {
        /**
         * Creates a new Player
         * @param {Number} x 
         * @param {Number} y 
         * @param {String} mainHand 
         */
        constructor(initPack) {
            this.x = initPack.x
            this.y = initPack.y
            this.id = initPack.id
            this.angle = initPack.angle
            this.lhit = initPack.lhit
            this.rhit = initPack.rhit
            this.rad = 30
            this.kills = 0
            this.bcolor = 'crimson'
            this.hcolor = 'maroon'
            Demons.push(this)
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
            
            
            ctx.save()
            ctx.beginPath()
            ctx.translate(currx, curry)
            ctx.rotate((Math.PI / 180) * this.angle)
            ctx.scale(this.rad/25, this.rad/25)
            if (!(this.rhit)) {
                ctx.beginPath()
                ctx.fillStyle = 'black'
                ctx.arc(32, 15, 7.5, 0, 2 * Math.PI)
                ctx.fill()
                ctx.beginPath()
                ctx.fillStyle = this.hcolor
                ctx.arc(32, 15, 7.5 - 2, 0, 2 * Math.PI)
                ctx.fill()
                //ctx.drawImage(Img.hand, 32 - 7.5, 15 - 7.5, 15, 15)
            } else {
                ctx.save();
                ctx.translate(32 - 7.5, 15 - 7.5);
                ctx.rotate((Math.PI / 180) * (360 - (-Math.abs(-160 * this.punchper + 80) + 80)))
                ctx.beginPath()
                ctx.fillStyle = 'black'
                ctx.arc(7.5, 7.5, 7.5, 0, 2 * Math.PI)
                ctx.fill()
                ctx.beginPath()
                ctx.fillStyle = this.hcolor
                ctx.arc(7.5, 7.5, 7.5 - 2, 0, 2 * Math.PI)
                ctx.fill()
                ctx.restore()
            }
            if (!(this.lhit)) {
                ctx.drawImage(Img.hand, 32 - 7.5, -15 - 7.5, 15, 15)
                ctx.beginPath()
                ctx.fillStyle = 'black'
                ctx.arc(32, -15, 7.5, 0, 2 * Math.PI)
                ctx.fill()
                ctx.beginPath()
                ctx.fillStyle = this.hcolor
                ctx.arc(32, -15, 7.5 - 2, 0, 2 * Math.PI)
                ctx.fill()
            } else {
                ctx.save();
                ctx.translate(32 - 7.5, -(15 - 7.5));
                ctx.rotate((Math.PI / 180) * (0 + (-Math.abs(-160 * this.punchper + 80) + 80)))
                ctx.beginPath()
                ctx.fillStyle = 'black'
                ctx.arc(7.5, -7.5, 7.5, 0, 2 * Math.PI)
                ctx.fill()
                ctx.beginPath()
                ctx.fillStyle = this.hcolor
                ctx.arc(7.5, -7.5, 7.5 - 2, 0, 2 * Math.PI)
                ctx.fill()
                ctx.restore();
            }
            
            ctx.restore()
            ctx.beginPath()
            ctx.fillStyle = '#000010'
            ctx.arc(currx, curry, this.rad, 0, 2 * Math.PI)
            ctx.fill()
            ctx.beginPath()
            ctx.fillStyle = this.bcolor
            ctx.arc(currx, curry, this.rad - 2, 0, 2 * Math.PI)
            ctx.fill()
            ctx.translate(currx, curry)
            ctx.rotate((Math.PI / 180) * this.angle)
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
            ctx.restore();
            ctx.restore();
        }
        processInitpack(initPack) {
            if(initPack.kills == 1){
                this.rad = 32
                this.hcolor = 'coral'
                this.bcolor = 'orange'
            }else if(initPack.kills == 2){
                this.rad = 32
                this.hcolor = 'khaki'
                this.bcolor = 'yellow'
            }
            this.x = initPack.x
            this.y = initPack.y
            this.id = initPack.id
            this.angle = initPack.angle
            this.lhit = initPack.lhit
            this.rhit = initPack.rhit
            this.punchper = initPack.punchper
        }
    }
    class Rabbit {
        /**
         * Creates a new Player
         * @param {Number} x 
         * @param {Number} y 
         * @param {String} mainHand 
         */
        constructor(initPack) {
            this.x = initPack.x
            this.y = initPack.y
            this.id = initPack.id
            this.angle = initPack.angle
            this.lhit = initPack.lhit
            this.rhit = initPack.rhit
            this.rad = 25
            this.kills = 0
            this.bcolor = 'white'
            this.hcolor = 'grey'
            Rabbits.push(this)
        }
        draw(x, y) {
            ctx.restore()
            ctx.save()
            ctx.scale(this.rad/25, this.rad/25)
            var hpBar = 80 * this.rad/25 * this.hp / this.maxHp
            var currx = (this.x + x)/(this.rad/25)
            var curry = (this.y + y)/(this.rad/25)
            //if(currx < -this.rad/25 || currx > canvas.width) return
            //if(curry < -this.rad/25 || curry > canvas.height) return
            ctx.save();
            
            //ctx.drawImage(Img.player, currx - this.rad, curry - this.rad, this.rad * 2, this.rad * 2)
            
            
            ctx.save()
            ctx.beginPath()
            ctx.translate(currx, curry)
            ctx.rotate((Math.PI / 180) * this.angle)
            ctx.scale(this.rad/25, this.rad/25)
            if (!(this.rhit)) {
                ctx.beginPath()
                ctx.fillStyle = 'black'
                ctx.arc(32, 15, 7.5, 0, 2 * Math.PI)
                ctx.fill()
                ctx.beginPath()
                ctx.fillStyle = this.hcolor
                ctx.arc(32, 15, 7.5 - 2, 0, 2 * Math.PI)
                ctx.fill()
                //ctx.drawImage(Img.hand, 32 - 7.5, 15 - 7.5, 15, 15)
            } else {
                ctx.save();
                ctx.translate(32 - 7.5, 15 - 7.5);
                ctx.rotate((Math.PI / 180) * (360 - (-Math.abs(-160 * this.punchper + 80) + 80)))
                ctx.beginPath()
                ctx.fillStyle = 'black'
                ctx.arc(7.5, 7.5, 7.5, 0, 2 * Math.PI)
                ctx.fill()
                ctx.beginPath()
                ctx.fillStyle = this.hcolor
                ctx.arc(7.5, 7.5, 7.5 - 2, 0, 2 * Math.PI)
                ctx.fill()
                ctx.restore()
            }
            if (!(this.lhit)) {
                ctx.drawImage(Img.hand, 32 - 7.5, -15 - 7.5, 15, 15)
                ctx.beginPath()
                ctx.fillStyle = 'black'
                ctx.arc(32, -15, 7.5, 0, 2 * Math.PI)
                ctx.fill()
                ctx.beginPath()
                ctx.fillStyle = this.hcolor
                ctx.arc(32, -15, 7.5 - 2, 0, 2 * Math.PI)
                ctx.fill()
            } else {
                ctx.save();
                ctx.translate(32 - 7.5, -(15 - 7.5));
                ctx.rotate((Math.PI / 180) * (0 + (-Math.abs(-160 * this.punchper + 80) + 80)))
                ctx.beginPath()
                ctx.fillStyle = 'black'
                ctx.arc(7.5, -7.5, 7.5, 0, 2 * Math.PI)
                ctx.fill()
                ctx.beginPath()
                ctx.fillStyle = this.hcolor
                ctx.arc(7.5, -7.5, 7.5 - 2, 0, 2 * Math.PI)
                ctx.fill()
                ctx.restore();
            }
            
            ctx.restore()
            ctx.beginPath()
            ctx.fillStyle = '#000010'
            ctx.arc(currx, curry, this.rad, 0, 2 * Math.PI)
            ctx.fill()
            ctx.beginPath()
            ctx.fillStyle = this.bcolor
            ctx.arc(currx, curry, this.rad - 2, 0, 2 * Math.PI)
            ctx.fill()
            ctx.translate(currx, curry)
            ctx.rotate((Math.PI / 180) * this.angle)
            ctx.fillStyle = 'black'
            ctx.beginPath()
            ctx.arc(0 + 9 * this.rad/28, 0 + 8 * this.rad/28, 6 * this.rad/28, 0, 2*Math.PI);
            ctx.arc(0 + 9 * this.rad/28, 0 - 8 * this.rad/28, 6 * this.rad/28, 0, 2*Math.PI);
            ctx.fill()
            ctx.fillStyle = 'white'
            ctx.beginPath()
            ctx.arc(0 + 6.5 * this.rad/28, 0 + 7 * this.rad/28, 2.5 * this.rad/28, 0, 2*Math.PI);
            ctx.arc(0 + 6.5 * this.rad/28, 0 - 7 * this.rad/28, 2.5 * this.rad/28, 0, 2*Math.PI);
            ctx.fill()
            ctx.restore();
            ctx.restore();
        }
        processInitpack(initPack) {
            this.x = initPack.x
            this.y = initPack.y
            this.id = initPack.id
            this.angle = initPack.angle
            this.lhit = initPack.lhit
            this.rhit = initPack.rhit
            this.punchper = initPack.punchper
        }
    }
    class Destroyer {
          /**
           * Creates a new Player
           * @param {Number} x 
           * @param {Number} y 
           * @param {String} mainHand 
           */
          constructor(initPack) {
              this.x = initPack.x
              this.y = initPack.y
              this.id = initPack.id
              this.angle = initPack.angle
              this.lhit = initPack.lhit
              this.rhit = initPack.rhit
              this.rad = 35
              Destroyers.push(this)
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


              ctx.save()
              ctx.beginPath()
              ctx.translate(currx, curry)
              ctx.rotate((Math.PI / 180) * this.angle)
              ctx.scale(this.rad/25, this.rad/25)
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

              ctx.restore()
              ctx.beginPath()
              ctx.fillStyle = '#000010'
              ctx.arc(currx, curry, this.rad, 0, 2 * Math.PI)
              ctx.fill()
              ctx.beginPath()
              ctx.fillStyle = 'green'
              ctx.arc(currx, curry, this.rad - 2, 0, 2 * Math.PI)
              ctx.fill()
              ctx.translate(currx, curry)
              ctx.rotate((Math.PI / 180) * this.angle)
              ctx.fillStyle = 'black'
              ctx.beginPath()
              ctx.arc(0 + 9 * 50/35, 0 + 8 * 50/35, 6 * 50/35, 0, 2*Math.PI);
              ctx.arc(0 + 9 * 50/35, 0 - 8 * 50/35, 6 * 50/35, 0, 2*Math.PI);
              ctx.fill()
              ctx.fillStyle = 'yellow'
              ctx.beginPath()
              ctx.arc(0 + 6.5 * 50/35, 0 + 7 * 50/35, 2.5 * 50/35, 0, 2*Math.PI);
              ctx.arc(0 + 6.5 * 50/35, 0 - 7 * 50/35, 2.5 * 50/35, 0, 2*Math.PI);
              ctx.fill()
              ctx.restore();
              ctx.restore();
          }
          processInitpack(initPack) {
              this.x = initPack.x
              this.y = initPack.y
              this.id = initPack.id
              this.angle = initPack.angle
              this.lhit = initPack.lhit
              this.rhit = initPack.rhit
              this.punchper = initPack.punchper
          }
      }
    var CTrees = new Mapper() 
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
            ctx.drawImage(Img['tree1'], this.x - 100/2 + x, this.y - 100/2 + y, 100, 100)
        }
    }
    var Stones = new Mapper()
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
    var Irons = new Mapper()
    class Iron {
        constructor(pack){
            this.x = pack.x
            this.y = pack.y
            this.id = pack.id
            Irons.set(this.id, this)
        }
        show(x, y){
            ctx.drawImage(Img['iron'], this.x - 50 + x, this.y - 50 + y, 100, 100)
        }
    }
    var Golds = new Mapper()
    class Gold {
        constructor(pack){
            this.x = pack.x
            this.y = pack.y
            this.id = pack.id
            Golds.set(this.id, this)
        }
        show(x, y){
            ctx.drawImage(Img['gold'], this.x - 50 + x, this.y - 50 + y, 100, 100)
        }
    }
    var Diamonds = new Mapper()
    class Diamond {
        constructor(pack){
            this.x = pack.x
            this.y = pack.y
            this.id = pack.id
            Diamonds.set(this.id, this)
        }
        show(x, y){
            ctx.drawImage(Img['diamond'], this.x - 50 + x, this.y - 50 + y, 100, 100)
        }
    }
    var Emeralds = new Mapper()
    class Emerald {
        constructor(pack){
            this.x = pack.x
            this.y = pack.y
            this.id = pack.id
            Emeralds.set(this.id, this)
        }
        show(x, y){
            ctx.drawImage(Img['emerald'], this.x - 50 + x, this.y - 50 + y, 100, 100)
        }
    }
    var Amethysts = new Mapper()
    class Amethyst {
        constructor(pack){
            this.x = pack.x
            this.y = pack.y
            this.id = pack.id
            Amethysts.set(this.id, this)
        }
        show(x, y){
            ctx.drawImage(Img['amethyst'], this.x - 50 + x, this.y - 50 + y, 100, 100)
        }
    }
    var CarrotFarms = new Mapper()
    class CarrotFarm {
        constructor(pack){
            this.x = pack.x
            this.y = pack.y
            this.id = pack.id
            CarrotFarms.set(this.id, this)
        }
        show(x, y){
            ctx.drawImage(Img['carrotfarm'], this.x - 50 + x, this.y - 50 + y, 100, 100)
        }
    }
    var Walls = new Mapper()
    class Wall {
        constructor(pack){
            this.x = pack.x
            this.y = pack.y
            this.id = pack.id
            this.material = pack.material
            Walls.set(this.id, this)
        }
        show(x, y){
            ctx.save()
            ctx.translate(this.x + x, this.y + y)
            if(this.material == 'stone'){
                if(
                    Walls.find(w => (w.x == this.x && w.y == this.y - 100), this) &&
                    Walls.find(w => (w.x == this.x && w.y == this.y + 100), this) &&
                    Walls.find(w => (w.x == this.x - 100 && w.y == this.y), this) &&
                    Walls.find(w => (w.x == this.x + 100 && w.y == this.y), this)
                ){
                    ctx.drawImage(Img['stonewallfourway'], -50, -50, 100, 100)
                
                }else if(
                    (
                        Walls.find(w => w.x == this.x + 100 && w.y == this.y) &&
                        Walls.find(w => w.x == this.x - 100 && w.y == this.y)
                    ) ||
                    (
                        Walls.find(w => w.x == this.x && w.y == this.y + 100) &&
                        Walls.find(w => w.x == this.x && w.y == this.y - 100)
                    )
                ){
                    if(
                        (
                            Walls.find(w => w.x == this.x + 100 && w.y == this.y) &&
                            Walls.find(w => w.x == this.x - 100 && w.y == this.y)
                        )
                    ){
                        if(Walls.find(w => w.x == this.x && w.y == this.y + 100)){
                            ctx.drawImage(Img['stonewallthreeway'], -50, -50, 100, 100)
                        }else if(Walls.find(w => w.x == this.x && w.y == this.y - 100)){
                            ctx.rotate(180 * Math.PI/180)
                            ctx.drawImage(Img['stonewallthreeway'], -50, -50, 100, 100)
                        }else {
                            ctx.drawImage(Img['stonewalltwoway'], -50, -50, 100, 100)
                        }
                    }else if(
                        (
                            Walls.find(w => w.x == this.x && w.y == this.y + 100) &&
                            Walls.find(w => w.x == this.x && w.y == this.y - 100)
                        )
                    ){
                        if(Walls.find(w => w.x == this.x - 100 && w.y == this.y)){
                            ctx.rotate(90 * Math.PI/180)
                            ctx.drawImage(Img['stonewallthreeway'], -50, -50, 100, 100)
                        }else if(Walls.find(w => w.x == this.x + 100 && w.y == this.y)){
                            ctx.rotate(270 * Math.PI/180)
                            ctx.drawImage(Img['stonewallthreeway'], -50, -50, 100, 100)
                        }else {
                            ctx.rotate(90 * Math.PI/180)
                            ctx.drawImage(Img['stonewalltwoway'], -50, -50, 100, 100)
                        }
                    }
                    
                }else if(
                    (
                        Walls.find(w => w.x == this.x && w.y == this.y + 100) &&
                        Walls.find(w => w.x == this.x + 100 && w.y == this.y)
                    ) || 
                    (
                        Walls.find(w => w.x == this.x && w.y == this.y + 100) &&
                        Walls.find(w => w.x == this.x - 100 && w.y == this.y)
                    ) ||
                    (
                        Walls.find(w => w.x == this.x && w.y == this.y - 100) &&
                        Walls.find(w => w.x == this.x - 100 && w.y == this.y)
                    ) ||
                    (
                        Walls.find(w => w.x == this.x && w.y == this.y - 100) &&
                        Walls.find(w => w.x == this.x + 100 && w.y == this.y)
                    ) 
                ){
                    if(
                        Walls.find(w => w.x == this.x && w.y == this.y + 100) &&
                        Walls.find(w => w.x == this.x + 100 && w.y == this.y)
                    )ctx.drawImage(Img['stonewallcorner'], -50, -50, 100, 100)
                    else if(
                        Walls.find(w => w.x == this.x && w.y == this.y + 100) &&
                        Walls.find(w => w.x == this.x - 100 && w.y == this.y)
                    ){
                        ctx.rotate(90 * Math.PI/180)
                        ctx.drawImage(Img['stonewallcorner'], -50, -50, 100, 100)
                    }else if(
                        Walls.find(w => w.x == this.x && w.y == this.y - 100) &&
                        Walls.find(w => w.x == this.x - 100 && w.y == this.y)
                    ){
                        ctx.rotate(180 * Math.PI/180)
                        ctx.drawImage(Img['stonewallcorner'], -50, -50, 100, 100)
                    }else if(
                        Walls.find(w => w.x == this.x && w.y == this.y - 100) &&
                        Walls.find(w => w.x == this.x + 100 && w.y == this.y)
                    ){
                        ctx.rotate(270 * Math.PI/180)
                        ctx.drawImage(Img['stonewallcorner'], -50, -50, 100, 100)
                    }
                }else if(
                    Walls.find(w => w.x == this.x + 100 && w.y == this.y) ||
                    Walls.find(w => w.x == this.x && w.y == this.y + 100) ||
                    Walls.find(w => w.x == this.x - 100 && w.y == this.y) ||
                    Walls.find(w => w.x == this.x && w.y == this.y - 100)
                ){
                    if(Walls.find(w => w.x == this.x + 100 && w.y == this.y)) ctx.drawImage(Img['stonewalloneway'], -50, -50, 100, 100)
                    else if(Walls.find(w => w.x == this.x && w.y == this.y + 100)){
                        ctx.rotate(90 * Math.PI/180)
                        ctx.drawImage(Img['stonewalloneway'], -50, -50, 100, 100)
                    }else if(Walls.find(w => w.x == this.x - 100 && w.y == this.y)){
                        ctx.rotate(180 * Math.PI/180)
                        ctx.drawImage(Img['stonewalloneway'], -50, -50, 100, 100)
                    }else if(Walls.find(w => w.x == this.x && w.y == this.y - 100)){
                        ctx.rotate(270 * Math.PI/180)
                        ctx.drawImage(Img['stonewalloneway'], -50, -50, 100, 100)
                    }
                }else{
                    ctx.drawImage(Img['stonewall'], -50, -50, 100, 100)
                }
            }else ctx.drawImage(Img[this.material + 'wall'], -50, -50, 100, 100)
            ctx.restore()
        }
    }
    let Doors = new Mapper()
    class Door {
        constructor(pack){
            this.x = pack.x
            this.y = pack.y
            this.id = pack.id
            this.material = pack.material
            this.ang = pack.ang
            this.open = pack.open
            Doors.set(this.id, this)
        }
        show(x, y){
            if(this.ang == 'up'){
                ctx.save()
                ctx.translate(this.x + 50 + x, this.y - 50 + y)
                if(this.per && !this.open) ctx.rotate(180 * this.per * Math.PI / 180)
                if(this.per && this.open) ctx.rotate((180 - 180 * this.per) * Math.PI / 180)
                if(!this.per && this.open) ctx.rotate(Math.PI)
                ctx.drawImage(Img[this.material + 'door'], 0 - 100, 0, 100, 100)
                ctx.beginPath()
                ctx.fillStyle = '#767676'
                ctx.arc(0, 0, 8, 0, 2 * Math.PI)
                '#FF7D36'
                ctx.fill()
                ctx.beginPath()
                ctx.fillStyle = '#c0c0c0'
                ctx.arc(0, 0, 6, 0, 2 * Math.PI)
                ctx.fill()
              
                ctx.beginPath()
                ctx.fillStyle = '#767676'
                ctx.arc(0 - 65, 0, 10, 0, 2 * Math.PI)
                ctx.fill()
                ctx.beginPath()
                ctx.fillStyle = '#80461B'
                ctx.arc(0 - 65, 0, 7, 0, 2 * Math.PI)
                ctx.fill()
                ctx.restore()
            }
            if(this.ang == 'down'){
                ctx.save()
                ctx.translate(this.x - 50 + x, this.y + 50 + y)
                if(this.per && !this.open) ctx.rotate(180 * this.per * Math.PI / 180)
                if(this.per && this.open) ctx.rotate((180 - 180 * this.per) * Math.PI / 180)
                if(!this.per && this.open) ctx.rotate(Math.PI)
                ctx.drawImage(Img[this.material + 'door'], 0, 0 - 100, 100, 100)
                ctx.beginPath()
                ctx.fillStyle = '#767676'
                ctx.arc(0, 0, 8, 0, 2 * Math.PI)
                '#FF7D36'
                ctx.fill()
                ctx.beginPath()
                ctx.fillStyle = '#c0c0c0'
                ctx.arc(0, 0, 6, 0, 2 * Math.PI)
                ctx.fill()
              
                ctx.beginPath()
                ctx.fillStyle = '#767676'
                ctx.arc(0 + 65, 0, 10, 0, 2 * Math.PI)
                ctx.fill()
                ctx.beginPath()
                ctx.fillStyle = '#80461B'
                ctx.arc(0 + 65, 0, 7, 0, 2 * Math.PI)
                ctx.fill()
                ctx.restore()
            }
            
            if(this.ang == 'left'){
                ctx.save()
                ctx.translate(this.x - 50 + x, this.y - 50 + y)
                //if(this.open) ctx.rotate(180 * Math.PI / 180)
                if(this.per && !this.open) ctx.rotate(180 * this.per * Math.PI / 180)
                if(this.per && this.open) ctx.rotate((180 - 180 * this.per) * Math.PI / 180)
                if(!this.per && this.open) ctx.rotate(Math.PI)
                //if(this.per && this.open) ctx.rotate()
                ctx.beginPath()
                ctx.fillStyle = '#767676'
                ctx.drawImage(Img[this.material + 'door'], 0, 0, 100, 100)
                ctx.arc(0, 0, 8, 0, 2 * Math.PI)
                '#FF7D36'
                ctx.fill()
                ctx.beginPath()
                ctx.fillStyle = '#c0c0c0'
                ctx.arc(0, 0, 6, 0, 2 * Math.PI)
                ctx.fill()
              
                ctx.beginPath()
                ctx.fillStyle = '#767676'
                ctx.arc(0, + 65, 10, 0, 2 * Math.PI)
                ctx.fill()
                ctx.beginPath()
                ctx.fillStyle = '#80461B'
                ctx.arc(0, 0 + 65, 7, 0, 2 * Math.PI)
                ctx.fill()
                ctx.restore()
            }
            if(this.ang == 'right'){
                ctx.save()
                ctx.translate(this.x + 50 + x, this.y + 50 + y)
                if(this.per && !this.open) ctx.rotate(180 * this.per * Math.PI / 180)
                if(this.per && this.open) ctx.rotate((180 - 180 * this.per) * Math.PI / 180)
                if(!this.per && this.open) ctx.rotate(Math.PI)
                ctx.beginPath()
                ctx.fillStyle = '#767676'
                ctx.drawImage(Img[this.material + 'door'], 0 - 100, 0 - 100, 100, 100)
                ctx.arc(0, 0, 8, 0, 2 * Math.PI)
                '#FF7D36'
                ctx.fill()
                ctx.beginPath()
                ctx.fillStyle = '#c0c0c0'
                ctx.arc(0, 0, 6, 0, 2 * Math.PI)
                ctx.fill()
              
                ctx.beginPath()
                ctx.fillStyle = '#767676'
                ctx.arc(0, 0 - 65, 10, 0, 2 * Math.PI)
                ctx.fill()
                ctx.beginPath()
                ctx.fillStyle = '#80461B'
                ctx.arc(0, 0 - 65, 7, 0, 2 * Math.PI)
                ctx.fill()
                ctx.restore()
            }
        }
        processUpdatePack(pack){
            this.per = pack.per
            this.open = pack.open
        }
    }
    var Floors = new Mapper()
    class Floor {
        constructor(pack){
            this.x = pack.x
            this.y = pack.y
            this.id = pack.id
            this.material = pack.material
            Floors.set(this.id, this)
        }
        show(x, y){
            ctx.drawImage(Img[this.material + 'floor'], this.x - 50 + x, this.y - 50 + y, 100, 100)
        }
    }
    var CraftingTables = new Mapper()
    class CraftingTable {
        constructor(pack){
            this.x = pack.x
            this.y = pack.y
            this.id = pack.id
            this.material = pack.material
            CraftingTables.set(this.id, this)
        }
        show(x, y){
            ctx.drawImage(Img['craftingtable'], this.x - 50 + x, this.y - 50 + y, 100, 100)
        }
    }
    let Chests = new Mapper()
    class Chest {
        constructor(pack){
            this.x = pack.x
            this.y = pack.y
            this.id = pack.id
            this.ang = pack.ang
            Chests.set(this.id, this)
        }
        show(x, y){
            //ctx.drawImage(Img['craftingtable'], this.x - 50 + x, this.y - 50 + y, 100, 100)
            ctx.save()
            ctx.fillStyle = 'red'
            ctx.translate(this.x + x, this.y + y)
            if(this.ang == 'left' || this.ang == 'right') ctx.rotate(Math.PI/180 * 90)
            ctx.drawImage(Img['chest'], 0 - 45, 0 - 25, 95, 50)
            ctx.restore()
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
    let Demons = []
    let Destroyers = []
    let Rabbits = []
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
        pack.iron.forEach((initPack)=>{
            new Iron(initPack)
        })
        
        pack.gold.forEach((initPack)=>{
            new Gold(initPack)
        })
        pack.diamond.forEach((initPack)=>{
            new Diamond(initPack)
        })
        pack.emerald.forEach((initPack)=>{
            new Emerald(initPack)
        })
        pack.amethyst.forEach((initPack)=>{
            new Amethyst(initPack)
        })
        pack.wall.forEach((initPack)=>{
            new Wall(initPack)
            
        })
        pack.door.forEach((initPack)=>{
            new Door(initPack)
        })
        pack.floor.forEach((initPack)=>{
            new Floor(initPack)
        })
        pack.ctable.forEach((initPack)=>{
            new CraftingTable(initPack)
        })
        pack.chest.forEach((initPack)=>{
            new Chest(initPack)
        })
        pack.demon.forEach((initPack)=>{
            if(Demons.find(demon => demon.id == initPack.id)) return
            new Demon(initPack)
        })
        pack.destroyer.forEach((initPack)=>{
            if(Destroyers.find(des => des.id == initPack.id)) return
            new Destroyer(initPack)
        })
        pack.cfarm.forEach((initPack)=>{
            new CarrotFarm(initPack)
        })
        pack.rabbit.forEach((initPack)=>{
            if(Rabbits.find(rabbit => rabbit.id == initPack.id)) return
            new Rabbit(initPack)
        })
    }
    readRemovePack = function(pack) {
        pack.player.forEach(function(id) {
            Players.splice(Players.findIndex(function(element) {
                return element.id == id
            }), 1)
        })
        pack.demon.forEach(function(id) {
            Demons.splice(Demons.findIndex(function(element) {
                return element.id == id
            }), 1)
        })
        pack.destroyer.forEach(function(id) {
            Destroyers.splice(Destroyers.findIndex(function(element) {
                return element.id == id
            }), 1)
        })
        pack.rabbit.forEach(function(id) {
            Rabbits.splice(Rabbits.findIndex(function(element) {
                return element.id == id
            }), 1)
        })
        pack.tree.forEach((id) => {
            CTrees.delete(id)
        })
        pack.stone.forEach((id) => {
            Stones.delete(id)
        })
        pack.iron.forEach((id) => {
            Irons.delete(id)
        })
        pack.gold.forEach((id) => {
            Golds.delete(id)
        })
        pack.diamond.forEach((id) => {
            Diamonds.delete(id)
        })
        pack.emerald.forEach((id) => {
            Emeralds.delete(id)
        })
        pack.amethyst.forEach((id) => {
            Amethysts.delete(id)
        })
        pack.wall.forEach((id) => {
            Walls.delete(id)
        })
        pack.door.forEach((id) => {
            Doors.delete(id)
        })
        pack.floor.forEach((id) => {
            Floors.delete(id)
        })
        pack.ctable.forEach((id) => {
            CraftingTables.delete(id)
        })
        pack.chest.forEach((id) => {
            Chests.delete(id)
        })
        pack.cfarm.forEach((id)=>{
            CarrotFarms.delete(id)
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
                
                ctx.fillStyle = '#876833'
                ctx.fillRect(canvas.width / 2 - playa.x, canvas.height / 2 - playa.y, 5000, 5000)
                //ctx.drawImage(Img.map, canvas.width / 2 - playa.x, canvas.height / 2 - playa.y, 2105, 1488)
                pack.player.forEach(function(pack) {
                    /**
                     * @type {Player} toUpdate
                     */
                    var toUpdate = Players.find(function(element) {
                        return element.id === pack.id
                    })
                    toUpdate.processInitpack(pack)
                })
                pack.demon.forEach(function(pack) {
                    var toUpdate = Demons.find(function(element) {
                        return element.id === pack.id
                    })
                    toUpdate.processInitpack(pack)
                })
                pack.destroyer.forEach(function(pack) {
                    var toUpdate = Destroyers.find(function(element) {
                        return element.id === pack.id
                    })
                    toUpdate.processInitpack(pack)
                })
                pack.rabbit.forEach(function(pack) {
                    var toUpdate = Rabbits.find(function(element) {
                        return element.id === pack.id
                    })
                  
                    toUpdate.processInitpack(pack)
                })
                pack.tree.forEach(pack => {
                    var toUpdate = CTrees.get(pack.id)
                    //document.write(pack.leaves)
                    toUpdate.catchLayers(pack)
                })
                pack.door.forEach(pack => {
                    let toUpdate = Doors.get(pack.id)
                    toUpdate.processUpdatePack(pack)
                })
                CTrees.forEach((tree) => {
                    tree.show(x, y)
                })
                Stones.forEach((stone) => {
                    stone.show(x, y)
                })
                Irons.forEach((iron) => {
                    iron.show(x, y)
                })
                Golds.forEach((gold) => {
                    gold.show(x, y)
                })
                Diamonds.forEach((diamond) => {
                    diamond.show(x, y)
                })
                Emeralds.forEach((emerald) => {
                    emerald.show(x, y)
                })
                Amethysts.forEach((amethyst) => {
                    amethyst.show(x, y)
                })
                Floors.forEach((floor) => {
                    floor.show(x, y)
                })
                Walls.forEach((wall) => {
                    wall.show(x, y)
                })
                Doors.forEach((door) => {
                    door.show(x, y)
                })
                CraftingTables.forEach((ctable) => {
                    ctable.show(x, y)
                })
                Chests.forEach((chest) => {
                    chest.show(x, y)
                })
                CarrotFarms.forEach((ctable) => {
                    ctable.show(x, y)
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
                dropped = pack.dropped
                dropped.forEach(item => {
                    if(item.slot.image == 'stone' || item.slot.image == 'iron' || item.slot.image == 'gold' || item.slot.image == 'diamond'|| item.slot.image == 'emerald' || item.slot.image == 'amethyst'){
                        ctx.drawImage(Img[item.slot.image], item.x + x - 20, item.y + y - 20, 40, 40)
                    }
                    if(/^leather$/.test(item.slot.type)) ctx.drawImage(Img[item.slot.image], item.x + x - 24.5, item.y + y - 28.5, 49, 57)
                    if(/Axe|Pickaxe|Sword|Hammer/.test(item.slot.type)){
                        ctx.save()
                        ctx.translate(item.x + x, item.y + y)
                        ctx.rotate(Math.PI/ 180 * 45)
                        ctx.drawImage(Img[item.slot.image], 0 - 40, 0 - 40, 80 , 80 )
                        ctx.restore()
                    }
                    if(item.slot.image == 'carrot'){
                        ctx.save()
                        ctx.translate(item.x + x, item.y + y)
                        ctx.rotate(Math.PI/ 180 * 45)
                        ctx.drawImage(Img[item.slot.image], -20, -20, 40, 40)
                        ctx.restore()
                    }
                    if(/Wall|Door|Floor|Crafting Table|Chest|Armor/.test(item.slot.type)){
                        ctx.save()
                        ctx.translate(item.x + x, item.y + y)
                        ctx.rotate(Math.PI/ 180 * 10)
                        if(item.slot.type == 'Chest') ctx.drawImage(Img[item.slot.image], 0 - 23.75, 0 - 12.5, 47.5 , 25 )
                        else ctx.drawImage(Img[item.slot.image], 0 - 25, 0 - 25, 50 , 50 )
                        ctx.restore()  
                    }
                    if(item.slot.type == 'wood'){
                        ctx.save()
                        ctx.translate(item.x + x, item.y + y)
                        ctx.beginPath()
                        ctx.lineJoin = ctx.lineCap = 'round';
                        ctx.lineWidth = 10
                        ctx.strokeStyle = 'maroon'
                        ctx.moveTo(0 - 45 + 75, 0 - 45 + 27.857)
                        ctx.lineTo(0 - 45 + 15, 0 - 45 + 62.143)
                        ctx.stroke()
                      
                        ctx.lineJoin = ctx.lineCap = 'round';
                        ctx.lineWidth = 7
                        ctx.strokeStyle = 'saddlebrown'
                        ctx.moveTo(0 - 45 + 75, 0 - 45 + 27.857)
                        ctx.lineTo(0 - 45 + 15, 0 - 45 + 62.143)
                        ctx.stroke()
                      
                        ctx.beginPath()
                        ctx.lineJoin = ctx.lineCap = 'round';
                        ctx.lineWidth = 10
                        ctx.strokeStyle = 'maroon'
                        ctx.moveTo(0 - 45 + 15, 0 - 45 + 27.857)
                        ctx.lineTo(0 - 45 + 75, 0 - 45 + 62.143)
                        ctx.stroke()
                        
                        ctx.lineJoin = ctx.lineCap = 'round';
                        ctx.lineWidth = 7
                        ctx.strokeStyle = 'saddlebrown'
                        ctx.beginPath()
                        ctx.moveTo(0 - 45 + 15, 0 - 45 + 27.857)
                        ctx.lineTo(0 - 45 + 75, 0 - 45 + 62.143)
                        ctx.stroke()
                        ctx.restore()
                    }
                })
                ctx.lineWidth = 0.5
                ctx.strokeStyle = 'black'
                ctx.font  = '10px Arial'
                Players.forEach(function(player) {
                    player.draw(x, y)
                })
                Demons.forEach(function(demon) {
                    demon.draw(x, y)
                })
                Destroyers.forEach(function(demon) {
                    demon.draw(x, y)
                })
                Rabbits.forEach(function(rabbit) {
                    rabbit.draw(x, y)
                })
                ctx.restore();
                if(playa.clanning){
                    ctx.fillStyle = 'black'
                    ctx.lineWidth = 2
                    ctx.beginPath()
                    ctx.globalAlpha = 0.5

                    ctx.rect(400, 100, canvas.width - 800, canvas.height - 200)

                    ctx.fill()
                    if(playa.clan){
                        
                        ctx.beginPath()
                        ctx.rect(500, 125, canvas.width - 1000, 50)
                        ctx.strokeStyle = 'grey'
                        ctx.fillStyle = 'white'
                        ctx.textAlign = 'center'
                        ctx.stroke()
                        ctx.font = '40px Arial'
                        ctx.strokeText(playa.clan, 500 + (canvas.width - 1000)/2, 125 + 40)
                        ctx.fillText(playa.clan, 500 + (canvas.width - 1000)/2, 125 + 40)
                        ctx.fillStyle = 'red'
                        ctx.globalAlpha = 0.75
                        ctx.fillRect(400 + canvas.width - 900, canvas.height - 150, 75, 25)
                        'MMMMMMMMMMMMMMMM'
                        
                        playa.clanMembers.forEach((player, i) => {
                            let offSetX = ((i - Math.floor(i/2) * 2) * (canvas.width - 1000)/2)
                            let offSetY = (Math.floor(i / 2) * 50)
                            ctx.fillStyle = 'white'
                            ctx.font = '13.5px Arial'
                            ctx.textAlign = 'start'
                            ctx.fillText(player.usr, 500 + offSetX, 200 + offSetY)
                            if(playa.owner && playa.id != player.id){
                                ctx.strokeStyle = 'grey'
                                ctx.fillStyle = 'red'
                                ctx.lineWidth = 7.5
                                ctx.beginPath()
                                ctx.rect(500 + (canvas.width - 1000)/2 - 75 + offSetX, 200 -13.5 + offSetY, 50, 15)
                                ctx.stroke()
                                ctx.fillRect(500 + (canvas.width - 1000)/2 - 75 + offSetX, 200 -13.5 + offSetY, 50, 15)
                            }
                        })
                    } else {
                        if(clanboxDestroyed){
                            clanbox = new CanvasInput({
                                canvas:canvas,
                                x:410,
                                y:110,
                                width:(canvas.width - 820)/2 - 10,
                                height:22,
                                fontSize: 14,
                                borderWidth: 1,
                                padding:0,
                                borderColor: 'none',
                                boxShadow: 'none',
                                innerShadow: 'none',
                                placeHolder: 'Enter clan name',
                                maxlength: 5
                            })
                            clanboxDestroyed = false
                            clanbox.focus()
                        }
                        clanbox.render()
                        ctx.fillStyle = 'red'
                        ctx.fillRect(410 + (canvas.width - 820)/2 , 110, (canvas.width - 820)/2, 24)
                        playa.clans.forEach((name, i) => {
                            let offSetX = ((i - Math.floor(i/2) * 2) * (canvas.width - 820)/2)
                            let offSetY = (Math.floor(i / 2) * 30)
                            ctx.textAlign = 'start'
                            ctx.font = '12px Arial'
                            ctx.fillText(name, 410 + offSetX, 110 + 12 + 26 + offSetY)
                            ctx.fillRect(400 + (canvas.width - 820)/4 +offSetX, 110 + 26 + offSetY, (canvas.width - 820)/4 + 2.5 , 22)

                        })
                        //ctx.rect(400, 100, canvas.width - 800, canvas.height - 200)

                        //ctx.fill()
                    }
                    ctx.globalAlpha = 1
                }else if(clanbox && !clanboxDestroyed){
                    clanbox.destroy()
                    clanboxDestroyed = true
                }
                ctx.fillStyle = 'black'
                ctx.strokeStyle = 'black'
                
                if(playa.crafting && playa.craftablesEx){
                    ctx.fillStyle = 'black'
                    ctx.lineWidth = 2
                    ctx.beginPath()
                    ctx.globalAlpha = 0.5
                    
                    ctx.rect(100, 100, canvas.width - 200, canvas.height - 300)
                    ctx.fill()
                    playa.craftablesEx.forEach((craft, i) => {
                        ctx.lineWidth = 2
                        let offSetX = ((i - Math.floor(i/13) * 13) * 80)
                        let offSetY = (Math.floor(i / 13) * 80)
                        ctx.beginPath()
                        ctx.globalAlpha = 0.875
                        ctx.rect(120 + offSetX, 120 + offSetY, 60, 60)
                        ctx.stroke()
                        if(craft.craftable) ctx.fillStyle = 'black'
                        else ctx.fillStyle = 'red'
                        ctx.globalAlpha = 0.5
                        ctx.beginPath()
                        ctx.fillRect(120 + offSetX, 120 + offSetY, 60, 60)
                        if(/Axe|Pickaxe|Sword|Hammer/.test(craft.craft)){
                            let img = craft.craft.toLowerCase().replace(/\s/, '')
                            ctx.globalAlpha = 1
                            ctx.save()
                            ctx.translate(120 + offSetX + 27.5, 120 + offSetY + 27.5 + 5)
                            ctx.rotate(Math.PI/180 * 45)
                            ctx.drawImage(Img[img], 0 - 27.5, 0 - 27.5, 55, 55)
                            ctx.restore()
                        }
                        if(/Wall|Door|Floor|Crafting Table|Chest|Armor/.test(craft.craft)){
                            let img = craft.craft.toLowerCase().replace(/\s/, '')
                            console.log(img)
                            ctx.globalAlpha = 1
                            ctx.save()
                            ctx.translate(120 + offSetX + 30, 120 + offSetY + 30)
                            ctx.rotate(Math.PI/180 * 8)
                            if(craft.craft == 'Chest') ctx.drawImage(Img[img], 0 - 12.75, 0 - 7.5, 25.5, 15)
                            else ctx.drawImage(Img[img], 0 - 15, 0 - 15, 30, 30)
                            ctx.restore()
                        }
                    })
                    ctx.globalAlpha = 1
                } else {
                    playa.craftables.forEach((craft, i) => {
                        
                        if(/Axe|Pickaxe|Sword|Hammer/.test(craft)){
                            let img = craft.toLowerCase().replace(/\s/, '')
                            ctx.globalAlpha = 0.875
                            ctx.lineWidth = 2
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
                            ctx.drawImage(Img[img], 0 - 27.5, 0 - 27.5, 55, 55)
                            ctx.restore()
                        }
                        if(/Wall|Door|Floor|Crafting Table|Chest|Armor/.test(craft)){
                            let img = craft.toLowerCase().replace(/\s/, '')
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
                            ctx.translate(90 + (i % 2 == 1 ? 80 : 0) + 30, 90 + (Math.floor(i / 2) * 80) + 30)
                            ctx.rotate(Math.PI/180 * 8)
                            ctx.drawImage(Img[img], 0 - 15, 0 - 15, 30, 30)
                            ctx.restore()
                        }
                    })
                }
                if(playa.chesting && playa.chestables){
                    ctx.fillStyle = 'black'
                    ctx.lineWidth = 2
                    ctx.beginPath()
                    ctx.globalAlpha = 0.5
                    
                    ctx.rect((canvas.width - 300)/2, (canvas.height - 300)/2, 300, 300)
                    ctx.fill()
                    playa.chestables.forEach((item, i) => {
                        ctx.lineWidth = 2
                        let offSetX = ((i - Math.floor(i/3) * 3) * 80)
                        let offSetY = (Math.floor(i / 3) * 80)
                        ctx.beginPath()
                        ctx.globalAlpha = 0.875
                        ctx.rect((canvas.width - 300)/2 + 40 + offSetX, (canvas.height - 300)/2 + 40 + offSetY, 60, 60)
                        ctx.stroke()
                        ctx.fillStyle = 'grey'
                        ctx.globalAlpha = 0.5
                        ctx.beginPath()
                        ctx.fillRect((canvas.width - 300)/2 + 40 + offSetX, (canvas.height - 300)/2 + 40 + offSetY, 60, 60)
                        if(/^leather$/.test(item.type)) ctx.drawImage(Img[item.image], item.x + x - 24.5, item.y + y - 28.5, 49, 57)
                        if(/^(stone|iron|gold|diamond|emerald|amethyst)$/.test(item.type)){
                            ctx.save()
                            ctx.translate((canvas.width)/10 + (canvas.width)/10 * i , canvas.height - 100)
                            ctx.rotate(Math.PI/ 180 * 0)
                            ctx.drawImage(Img[item.image], 0 - 20, 0 - 20, 40, 40)
                            ctx.restore()
                            ctx.beginPath()
                            ctx.lineWidth = 1.5
                            ctx.font = "15px Arial"
                            ctx.strokeStyle = 'black'
                            ctx.fillStyle = 'white'
                            ctx.strokeText(item.count, (canvas.width)/10 + (canvas.width)/10 * i  + 18, canvas.height - 58)
                            ctx.fillText(item.count, (canvas.width)/10 + (canvas.width)/10 * i  + 18, canvas.height - 58)
                            ctx.stroke()
                        }
                        if(/Axe|Pickaxe|Sword|Hammer/.test(item.type)){
                            ctx.globalAlpha = 1
                            ctx.save()
                            ctx.translate((canvas.width - 300)/2 + 40 + offSetX + 27.5, (canvas.height - 300)/2 + 40 + offSetY + 27.5 + 5)
                            ctx.rotate(Math.PI/180 * 45)
                            ctx.drawImage(Img[item.image], 0 - 27.5, 0 - 27.5, 55, 55)
                            ctx.restore()
                        }
                        if(/Wall|Door|Floor|Crafting Table|Chest|Armor/.test(item.type)){
                            ctx.globalAlpha = 1
                            ctx.save()
                            ctx.translate((canvas.width - 300)/2 + 40 + offSetX + 30, (canvas.height - 300)/2 + 40 + offSetY + 30)
                            ctx.rotate(Math.PI/180 * 8)
                            ctx.drawImage(Img[item.image], 0 - 15, 0 - 15, 30, 30)
                            ctx.restore()
                            ctx.lineWidth = 3/4
                            ctx.font = "11.25 Arial"
                            ctx.strokeStyle = 'black'
                            ctx.fillStyle = 'white'
                            ctx.strokeText(item.count, (canvas.width - 300)/2 + 40 + offSetX + 27.5 + 10, (canvas.height - 300)/2 + 40 + offSetY + 60 - 6)
                            ctx.fillText(item.count, (canvas.width - 300)/2 + 40 + offSetX + 27.5 + 10, (canvas.height - 300)/2 + 40 + offSetY + 60 - 6)
                            ctx.stroke()
                        }
                    })
                    ctx.globalAlpha = 1
                }
                ctx.fillStyle = 'black'
                ctx.beginPath()
                ctx.arc(290, 120, 50, 0, 2 * Math.PI)
                ctx.fill()
                ctx.fillStyle = 'grey'
                ctx.beginPath()
                ctx.arc(290, 120, 47, 0, 2 * Math.PI)
                ctx.fill()
                clanMember1.drawPerf()
                clanMember2.drawPerf()
                if(playa.req){
                    ctx.font = '20px Arial'
                    ctx.textAlign = 'end'
                    ctx.fillStyle = 'black'
                    ctx.fillText(playa.req.usr, 800, 50 + 20)
                    ctx.beginPath()
                    ctx.strokeStyle = 'grey'
                    ctx.lineWidth = 7.5
                    ctx.rect(810, 50, 50, 30)
                    ctx.rect(810 + 70, 50, 50, 30)
                    ctx.stroke()
                    ctx.fillStyle = 'green'
                    ctx.fillRect(810, 50, 50, 30)
                    ctx.fillStyle = 'red'
                    ctx.fillRect(810 + 70, 50, 50, 30)
                }
                
                if(movement.chatting){
                    if(chatboxDestroyed){
                        chatbox = new CanvasInput({
                            canvas:canvas,
                            x:canvas.width/2 - 75,
                            y:canvas.height/2 - 77,
                            fontSize: 14,
                            borderWidth: 1,
                            borderColor: 'none',
                            borderRadius: 50,
                            boxShadow: 'none',
                            innerShadow: 'none',
                            placeHolder: 'Enter message here...'
                        })
                        chatboxDestroyed = false
                        chatbox.focus()
                    }
                    chatbox.render()
                    //chatbox.blur()
                }else if(chatbox && !chatboxDestroyed){
                    chatbox.destroy()
                    chatboxDestroyed = true
                }
                playa.inventory.forEach((slot, i) => {
                    ctx.beginPath()
                    ctx.lineWidth = 1.5
                    ctx.font = "20px Arial"
                    ctx.fillStyle = '#696969'
                    ctx.textAlign = 'start'
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
                    if(/Axe|Pickaxe|Sword|Hammer/.test(slot.type)){
                        //let img = slot.image.toLowerCase().replace(/\s/, '')
                        ctx.save()
                        ctx.translate((canvas.width)/10 + (canvas.width)/10 * i , canvas.height - 100 + 7)
                        ctx.rotate(Math.PI/ 180 * 45)
                        ctx.drawImage(Img[slot.image], 0 - 40, 0 - 40, 80 , 80 )
                        ctx.restore()
                    }
                    if(/^(stone|iron|gold|diamond|emerald|amethyst)$/.test(slot.image)){
                        ctx.save()
                        ctx.translate((canvas.width)/10 + (canvas.width)/10 * i , canvas.height - 100)
                        ctx.rotate(Math.PI/ 180 * 0)
                        ctx.drawImage(Img[slot.image], 0 - 20, 0 - 20, 40, 40)
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
                    if(/^leather$/.test(slot.type)){
                        ctx.save()
                        ctx.translate((canvas.width)/10 + (canvas.width)/10 * i , canvas.height - 100)
                        ctx.rotate(Math.PI/ 180 * 0)
                        ctx.drawImage(Img[slot.image], 0 - 24.5, 0 - 28.5, 49, 57)
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
                    if(/Wall|Door|Floor|Crafting Table|Chest|Armor/.test(slot.type)){
                        ctx.save()
                        ctx.translate((canvas.width)/10 + (canvas.width)/10 * i , canvas.height - 100 + 7)
                        ctx.rotate(Math.PI/ 180 * 10)
                        if(slot.type == 'Chest') ctx.drawImage(Img[slot.image], 0 - 23.75, 0 - 12.5, 47.5 , 25)
                        else ctx.drawImage(Img[slot.image], 0 - 25, 0 - 25, 50 , 50)
                        ctx.restore()
                        ctx.lineWidth = 1.5
                        ctx.font = "15px Arial"
                        ctx.strokeStyle = 'black'
                        ctx.fillStyle = 'white'
                        ctx.strokeText(slot.count, (canvas.width)/10 + (canvas.width)/10 * i  + 18, canvas.height - 58)
                        ctx.fillText(slot.count, (canvas.width)/10 + (canvas.width)/10 * i  + 18, canvas.height - 58)
                        ctx.stroke()
                    }
                    if(slot.type == 'carrot'){
                        ctx.save()
                        ctx.translate((canvas.width)/10 + (canvas.width)/10 * i , canvas.height - 100 + 7)
                        ctx.rotate(Math.PI/ 180 * 45)
                        ctx.drawImage(Img[slot.image], -20, -20, 40, 40)
                        ctx.restore()
                        ctx.lineWidth = 1.5
                        ctx.font = "15px Arial"
                        ctx.strokeStyle = 'black'
                        ctx.fillStyle = 'white'
                        ctx.strokeText(slot.count, (canvas.width)/10 + (canvas.width)/10 * i  + 18, canvas.height - 58)
                        ctx.fillText(slot.count, (canvas.width)/10 + (canvas.width)/10 * i  + 18, canvas.height - 58)
                        ctx.stroke()
                    }
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
                    }
                    //if(playa.inventory[i] != ' ') ctx.drawImage(Img[playa.inventory[i]], 200  + 120.75 * i - 50, canvas.height - 100 - 50, 100, 100)
                    
                })
                ctx.fillStyle = '#696969'
                ctx.beginPath()
                ctx.lineWidth = 1.5
                ctx.globalAlpha = 0.75
                ctx.rect(10, 350, 90, 90)
                ctx.fillRect(10, 350, 90, 90)
                ctx.stroke()
                
                ctx.globalAlpha = 1
                if(playa.armor){
                    ctx.drawImage(Img[playa.armor], 30, 370, 50, 50)
                }
                ctx.globalAlpha = 0.75
                ctx.beginPath()
                ctx.rect(10, 240, 90, 90)
                ctx.fillRect(10, 240, 90, 90)
                ctx.globalAlpha = 1
                ctx.stroke();
                if(pack.tod == 'day'){
                    //ctx.globalAlpha = pack.per * 0.5
                    //ctx.fillRect(canvas.width / 2 - playa.x, canvas.height / 2 - playa.y, 2500, 2500)
                }
                if(pack.tod == 'night'){
                    ctx.fillStyle = 'black'
                    ctx.globalAlpha = (-1 * (Math.abs(pack.per - 0.5)) + 0.5) * 0.9
                    ctx.fillRect(canvas.width / 2 - playa.x, canvas.height / 2 - playa.y, 5000, 5000)
                }
                
                ctx.globalAlpha = 1
                ctx.beginPath()
                ctx.fillStyle = 'yellow'
                ctx.arc(canvas.width - 100, canvas.height - 200, 50, Math.PI, 2 * Math.PI)
                ctx.fill()
                ctx.beginPath()
                ctx.fillStyle = 'darkblue'
                ctx.arc(canvas.width - 100, canvas.height - 200, 50, 0, 1 * Math.PI)
                ctx.fill()
                ctx.beginPath()
                ctx.moveTo(canvas.width - 100, canvas.height - 200)
                let xclocke
                let yclocke
                let xclockr
                let yclockr
                let xclockl
                let yclockl
                if(pack.tod == 'day'){
                    xclocke = Math.cos((pack.per * 180 + 180) * Math.PI / 180) * 45 + canvas.width - 100
                    yclocke = Math.sin((pack.per * 180 + 180) * Math.PI / 180) * 45 + canvas.height - 200
                    xclockr = Math.cos((pack.per * 180 + 180 + 5) * Math.PI / 180) * 35 + canvas.width - 100
                    yclockr = Math.sin((pack.per * 180 + 180 + 5) * Math.PI / 180) * 35 + canvas.height - 200
                    xclockl = Math.cos((pack.per * 180 + 180 - 5) * Math.PI / 180) * 35 + canvas.width - 100
                    yclockl = Math.sin((pack.per * 180 + 180 - 5) * Math.PI / 180) * 35 + canvas.height - 200
                }else {
                    xclocke = Math.cos(pack.per * 180 * Math.PI / 180) * 45 + canvas.width - 100
                    yclocke = Math.sin(pack.per * 180 * Math.PI / 180) * 45 + canvas.height - 200
                    xclockr = Math.cos((pack.per * 180 + 5) * Math.PI / 180) * 35 + canvas.width - 100
                    yclockr = Math.sin((pack.per * 180 + 5) * Math.PI / 180) * 35 + canvas.height - 200
                    xclockl = Math.cos((pack.per * 180 - 5) * Math.PI / 180) * 35 + canvas.width - 100
                    yclockl = Math.sin((pack.per * 180 - 5) * Math.PI / 180) * 35 + canvas.height - 200
                }
                ctx.lineTo(xclocke, yclocke)
                ctx.stroke()
                ctx.beginPath()
                ctx.moveTo(xclocke, yclocke)
                ctx.lineTo(xclockr, yclockr)
                ctx.stroke()
                ctx.beginPath()
                ctx.moveTo(xclocke, yclocke)
                ctx.lineTo(xclockl, yclockl)
                ctx.stroke()
                ctx.beginPath()
                ctx.fillStyle = '#FDB813'
                ctx.arc(canvas.width - 100, canvas.height - 200, 10, 0, 2 * Math.PI)
                ctx.fill()
                ctx.lineCap = 'butt'
            }
        }
    }
    socket.on('state', readPack);
}

var die = function() {
    loaded = false
    document.removeEventListener("keydown", handlekeyDown)
    document.removeEventListener("keyup", handlekeyUp)
    document.removeEventListener("mousedown", handlemouseDown)
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