import {GL_Shape} from "./GL_Shape.js";
import {RectGenerator} from "./RectGenerator.js";

class Line extends GL_Shape{
	constructor(glMeta, positions, color = [1,0,0]){
		super(glMeta);
		
		this.pos1 = positions.pos1;
		this.pos2 = positions.pos2; 
		
		this.color = color;
		
		this.shaderAttibMeta = {
			dataSizes: [3],
			stride: 3,
		};
	}
	getVertices(){
		let vertices = RectGenerator.genRect(this.pos1, this.posPlusOne(this.pos1), 
							  		 		 this.pos2, this.posPlusOne(this.pos2));
		return vertices;
	}
	posPlusOne(pos, offsX=0.1, offsY = 1, offsZ = 0.0){
		return [pos[0]+offsX, pos[1]+offsY, pos[2]+offsZ];
	}
}

export {Line};