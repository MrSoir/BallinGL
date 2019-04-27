import './gl-matrix.js';
import {m4,v4, v3, MathBD, genTransformationInfo} from "./MathBD.js";
import {GLSL_Functions} from "./GLSL_Functions.js";
import {GL_Shape} from "./GL_Shape.js";
import {SphereFactory} from './SphereFactory.js';
import {Sphere} from './Sphere.js';

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