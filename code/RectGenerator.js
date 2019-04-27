import './gl-matrix.js';
import {m4,v4, v3, MathBD} from "./MathBD.js";

var RectGenerator = {
	genRect: function(topLeft, topRight, bottomLeft, bottomRight){
		return [topLeft[0], topLeft[1], topLeft[2],
				  bottomLeft[0], bottomLeft[1], bottomLeft[2],
				  topRight[0], topRight[1], topRight[2],
				  
				  bottomLeft[0], bottomLeft[1], bottomLeft[2],
				  bottomRight[0], bottomRight[1], bottomRight[2],
				  topRight[0], topRight[1], topRight[2]];
	},
	genRectAroundCenter: function(center, width, height){
		let w2 = width * 0.5,
			 h2 = height * 0.5;
			 
		let z = center[2];
		
		return RectGenerator.genRect([center[0]-w2, center[1]-h2, z],
									 [center[0]+w2, center[1]-h2, z],
									 [center[0]-w2, center[1]+h2, z],
									 [center[0]+w2, center[1]+h2, z]);
	},
}

export {RectGenerator};