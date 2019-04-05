
class Polygon{
	constructor(v1, v2, v3){
		this.v1 = v1;
		this.v2 = v2;
		this.v3 = v3;	
	}
	toString(){
		return 	   'Polygon[(x: ' + this.v1[0] + '  y: ' + this.v1[1] + '  z: ' + this.v1[2] + '),' +
						  ' (x: ' + this.v2[0] + '  y: ' + this.v2[1] + '  z: ' + this.v2[2] + '),' +
						  ' (x: ' + this.v3[0] + '  y: ' + this.v3[1] + '  z: ' + this.v3[2] + ')]';
	}
	toArray(){
		return 	 [this.v1[0], this.v1[1], this.v1[2], 
				  this.v2[0], this.v2[1], this.v2[2],
				  this.v3[0], this.v3[1], this.v3[2]];
	}
	appendToArray(arr){
		arr.push(this.v1[0], this.v1[1], this.v1[2], 
				 this.v2[0], this.v2[1], this.v2[2],
				 this.v3[0], this.v3[1], this.v3[2]);
	}
}

export {Polygon};