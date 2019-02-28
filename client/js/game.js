//Sets a few core values and then sets up onsubmits
/* global changelog io usr loadingTimer*/
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
createImage('diamondaxe',  'png')
createImage('diamondpickaxe',  'png')
createImage('diamondsword',  'png')
createImage('diamondhammer',  'png')
createImage('stone', 'png')
createImage('iron', 'png')
createImage('gold', 'png')
createImage('diamond', 'png')
createImage('woodwall', 'png')
createImage('stonewall', 'png')
createImage('ironwall', 'png')
createImage('wooddoor', 'png')
createImage('woodfloor', 'png')
createImage('stonefloor', 'png')
createImage('craftingtable', 'png')

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
        angle: 0,
        grab:false,
        mousedis:0,
        prot:false,
        chatting:false
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
        
        if(playa && playa.crafting){
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
        if(playa && playa.crafting){
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
        if(found) return
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
    document.addEventListener('mousemove', handlemouseMove);
    window.moveinterval = setInterval(function() {
        socket.emit('movement', movement);
    }, 1000 / 60);
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
            this.msg = []
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
                ctx.fillRect(currx - 40 * this.rad/25, curry - 2 * this.rad + 10/*((30 * this.rad)/25 + (-0.4 * this.rad) - 10)*//*10 * this.rad/25*/, staminaBar, 10　);
            }
            ctx.textAlign = "center"
            ctx.font = '18px Zorque';
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 2;
            ctx.beginPath()
            ctx.strokeText(this.usr, currx, curry + 55 * this.rad/25);
            ctx.fillStyle = 'white';
            ctx.fillText(this.usr, currx, curry + 55 * this.rad/25);
            this.msg.forEach((msgObj, i) => {
                if(this.msg.length == 1 && i == 0){
                    ctx.globalAlpha = Math.abs(msgObj.per - 1)
                    ctx.textAlign = "center"
                    ctx.font = '9px Zorque';
                    ctx.strokeStyle = 'black';
                    ctx.lineWidth = 2;
                    ctx.beginPath()
                    ctx.strokeText(msgObj.msg, currx, curry - 60 * this.rad/25);
                    ctx.fillStyle = 'white';
                    ctx.fillText(msgObj.msg, currx, curry - 60 * this.rad/25);
                }else if(this.msg.length == 2 && i == 1){
                    ctx.globalAlpha = Math.abs(msgObj.per - 1)
                    ctx.textAlign = "center"
                    ctx.font = '9px Zorque';
                    ctx.strokeStyle = 'black';
                    ctx.lineWidth = 2;
                    ctx.beginPath()
                    ctx.strokeText(msgObj.msg, currx, curry - 60 * this.rad/25);
                    ctx.fillStyle = 'white';
                    ctx.fillText(msgObj.msg, currx, curry - 60 * this.rad/25);
                }else if(this.msg.length == 2 && i == 0){
                    ctx.globalAlpha = Math.abs(msgObj.per - 1)
                    ctx.textAlign = "center"
                    ctx.font = '9px Zorque';
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
                if(/Wall|Door|Floor|Crafting Table/.test(this.mainHand)){
                    let img = this.mainHand.toLowerCase().replace(/\s/, '')
                    ctx.drawImage(Img.hand, 32 - 7.5, -15 - 7.5, 15, 15)
                    ctx.save()
                    ctx.translate(32 - 7.5 + 5, 0)
                    ctx.drawImage(Img.hand, -15, 15 - 7.5 - 5 + 25, 15, 15)
                    ctx.restore()
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
            if(this.posPlace && /Wall|Door|Floor|Crafting Table/.test(this.mainHand)){
                let img = this.mainHand.toLowerCase().replace(/\s/, '')
                ctx.restore()
                ctx.save()
                ctx.globalAlpha =0.5
                ctx.drawImage(Img[img], this.posPlace.x -50 + x, this.posPlace.y - 50 + y, 100, 100)
                if(!/Door/.test(this.mainHand)) return
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
                ctx.restore()
            }
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
            this.hitting = initPack.hitting
            this.punchper = initPack.punchper
            this.per = initPack.per
            this.msg = initPack.msg
        }
        processSelfInitPack(initPack) {
            this.stamina = initPack.stamina
            this.maxStamina = initPack.maxStamina
            this.inventory = initPack.inventory
            this.crafting = initPack.crafting
            this.craftables = initPack.craftables
            this.craftablesEx = initPack.craftablesEx
            this.posPlace = initPack.posPlace
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
            ctx.fillStyle = '#C3C3C3'
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
            ctx.drawImage(Img['tree1'], this.x - 100/2 + x, this.y - 100/2 + y, 100, 100)
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
    var Irons = new Map()
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
    var Golds = new Map()
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
    var Diamonds = new Map()
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
    var Walls = new Map()
    class Wall {
        constructor(pack){
            this.x = pack.x
            this.y = pack.y
            this.id = pack.id
            this.material = pack.material
            Walls.set(this.id, this)
        }
        show(x, y){
            ctx.drawImage(Img[this.material + 'wall'], this.x - 50 + x, this.y - 50 + y, 100, 100)
        }
    }
    let Doors = new Map()
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
    var Floors = new Map()
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
    var CraftingTables = new Map()
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
        pack.demon.forEach((initPack)=>{
            if(Demons.find(demon => demon.id == initPack.id)) return
            new Demon(initPack)
        })
        pack.destroyer.forEach((initPack)=>{
            if(Destroyers.find(des => des.id == initPack.id)) return
            new Destroyer(initPack)
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
                    if(item.slot.image == 'stone' || item.slot.image == 'iron' || item.slot.image == 'gold'){
                        ctx.drawImage(Img[item.slot.image], item.x + x - 20, item.y + y - 20, 40, 40)
                    }
                    if(/Axe|Pickaxe|Sword|Hammer/.test(item.slot.type)){
                        ctx.save()
                        ctx.translate(item.x + x, item.y + y)
                        ctx.rotate(Math.PI/ 180 * 45)
                        ctx.drawImage(Img[item.slot.image], 0 - 40, 0 - 40, 80 , 80 )
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
                ctx.restore();
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
                        if(/Wall|Door|Floor|Crafting/.test(craft.craft)){
                            let img = craft.craft.toLowerCase().replace(/\s/, '')
                              
                            ctx.globalAlpha = 1
                            ctx.save()
                            ctx.translate(120 + offSetX + 30, 120 + offSetY + 30)
                            ctx.rotate(Math.PI/180 * 8)
                            ctx.drawImage(Img[img], 0 - 15, 0 - 15, 30, 30)
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
                            ctx.drawImage(Img[img], 0 - 27.5, 0 - 27.5, 55, 55)
                            ctx.restore()
                        }
                        if(/Wall|Door|Floor|Crafting/.test(craft)){
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
                    if(/^(stone|iron|gold|diamond)$/.test(slot.image)){
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
                    if(/Wall|Door|Floor|Crafting Table/.test(slot.type)){
                        ctx.save()
                        ctx.translate((canvas.width)/10 + (canvas.width)/10 * i , canvas.height - 100 + 7)
                        ctx.rotate(Math.PI/ 180 * 10)
                        ctx.drawImage(Img[slot.image], 0 - 25, 0 - 25, 50 , 50 )
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
                
                ctx.restore()
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