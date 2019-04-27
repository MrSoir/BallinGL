import './gl-matrix.js';
import {m4,v4, v3, MathBD, genTransformationInfo} from "./MathBD.js";
import {GLSL_Functions} from "./GLSL_Functions.js";
import {GL_Shape} from "./GL_Shape.js";
import {STL_Parser} from "./STL_Parser.js";
import {TorusMeshData} from "./TorusMeshData.js";
import {TorusMeshDataOBJ} from "./TorusMeshDataOBJ.js";
import {CubeHoleMeshData} from './CubeHoleMeshData.js';


class Torus extends GL_Shape{
	constructor(glMeta, 
				transformationData=genTransformationInfo(), 
				color=[0.2,0.2,0.2],
				customUniforms){
					
		super(glMeta, undefined, customUniforms);
		
		this.transformationData = transformationData;
		
		this.color = color;
		
/*		this.shaderAttibMeta = {
			dataSizes: [3],
			stride: 3,
		};*/
		this.shaderAttibMeta = {
			dataSizes: [3,3],
			stride: 6,
		};
	}
	
	// ueberschreibt GL_Shape.getVertices:
	getVertices(){
		return Torus.data.verticesWithNormals;
    };
}

Torus.data = STL_Parser.parseOBJ(TorusMeshDataOBJ);


export {Torus};


