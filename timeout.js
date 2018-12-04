module.exports = class Timeout {
    constructor(){
        this.timeout = setTimeout(...arguments)
        this.start = new Date()
        this.time = arguments[1]
    }
    get timeLeft(){
        return new Date().getTime() - this.start.getTime()
    }
    get percntDone(){
        return (new Date().getTime() - this.start.getTime())/this.time < 1.2 ? (new Date().getTime() - this.start.getTime())/this.time : 1
    }
}