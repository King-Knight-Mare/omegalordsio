Math.getRandomNum = function(min, max) {
    return Math.random() * (max - min) + min;
}
Math.getRandomInt = function(min, max) {
    return Math.round(Math.random() * (max - min)) + min;
}
Math.getFRandomInt = function(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}
Math.conRad = function(angle){
    return ((Math.PI/180) * angle)
}
Math.roundToDeci = (num, n) => {
    return Math.round(num * n)/n
}

Math.roundToDeca = (num, n) => {
    return Math.round(num / n) * n
}
Math.test = () => {
    console.log(Math.getRandomNum(0, 10))
    console.log(Math.getRandomInt(0, 10))
    console.log(Math.conRad(45))
    console.log(Math.roundToDeci(.004005, 100))
    console.log(Math.roundToDeca(123456789, 1000))
}
//Math.test()
module.exports = Math