module.exports = class {
	/**
	 * 
	 * @param {Number} x 
	 * @param {Number} y 
	 */
	constructor(x, y){
		/**
		 * @type Number
		 */
		this.x = x || 0;
		/**
		 * @type Number
		 */
		this.y = y || 0;
	}
	getDirection(){
		return Math.atan2(this.y, this.x);
	}
	setDirection(angle){
		var magnitude = this.mag();
		this.x = Math.cos(angle * Math.PI/180) * magnitude;
		this.y = Math.sin(angle * Math.PI/180) * magnitude;
	}
	mag(){
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}
	setMag(magnitude){
		var direction = this.getDirection(); 
		this.x = Math.cos(direction) * magnitude;
		this.y = Math.sin(direction) * magnitude;
	}
	add(v2){
		this.x += v2.x;
		this.y += v2.y;
	}
	sub(v2){
		this.x -= v2.x;
		this.y -= v2.y;
	}
	mult(scalar){
		this.x *= scalar;
		this.y *= scalar;
	}
	div(scalar){
		this.x /= scalar;
		this.y /= scalar;
	}
	limit(max){
		if(this.mag > max){
			this.setMag(max);
			return
		}else {
			return
		}
	}
	normalize(){
		var m = this.mag();
		if (m > 0) {
			this.div(m);
		}
	}
	copy(){
		return new Vector(this.x, this.y);
	}
	toString(){
		return 'x: ' + this.x + ', y: ' + this.y;
	}
	toArray(){
		return [this.x, this.y];
	}
	toObject(){
		return {x: this.x, y: this.y};
	}
	getDistance(v2){
		return Math.sqrt(Math.pow(this.x - v2.x, 2) + Math.pow(this.y - v2.y, 2));
	}
}
PVector = {
	add:function(v1,v2){
		var v3 = new Vector(v1.x + v2.x, v1.y + v2.y);
		return v3;
	},
	sub:function(v1,v2){
		var v3 = new Vector(v1.x - v2.x, v1.y - v2.y);
		return v3;
	},
	mult:function(v2,v2){
		var v3 = new Vector(v1.x * v2.x, v1.y * v2.y);
		return v3;
	},
	div:function(v1,v2){
		var v3 = new Vector(v1.x / v2.x, v1.y / v2.y);
		return v3;
	}
}