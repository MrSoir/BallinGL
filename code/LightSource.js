import '/code/gl-matrix.js';
import {m4,v4, v3, MathBD, genTransformationInfo} from "/code/MathBD.js";
import {GLSL_Functions} from "/code/GLSL_Functions.js";
import {GL_Shape} from "/code/GL_Shape.js";
import {SphereFactory} from '/code/SphereFactory.js';
import {Sphere} from '/code/Sphere.js';

class LightSource extends Sphere{
	constructor(glMeta, 
				transformationData=genTransformationInfo(), 
				color=[1,1,1]){
		super(glMeta, 
			  transformationData, 
			  color, 
			  {lightningOn: false});
	}
	
	// ueberschreibt GL_Shape.getVertices:
	getVertices(){
		return Sphere.data.vertices;
	}
}


export {LightSource};