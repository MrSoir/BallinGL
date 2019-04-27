import './gl-matrix.js';
import {m4,v4, v3, MathBD, genTransformationInfo} from "./MathBD.js";
import {GLSL_Functions} from "./GLSL_Functions.js";
import {GL_Shape} from "./GL_Shape.js";
import {STL_Parser} from "./STL_Parser.js";
import {TorusMeshData} from "./TorusMeshData.js";
import {CubeHoleMeshData} from './CubeHoleMeshData.js';
import {CubeHoleMeshDataOBJ} from "./CubeHoleMeshDataOBJ.js";


class CubeHole extends GL_Shape{
	constructor(glMeta,
				transformationData=genTransformationInfo(), 
				color=[0.2,0.2,0.2], 
				lightningMeta,
				customUniforms){
		super(glMeta, lightningMeta, customUniforms);
		
		// GL_Shape definiert und verwendet ebenfalls this.transformationData & this.color
		// diese werte werden nun ueberschrieben:
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
		return CubeHole.data.verticesWithNormals;
    };
}

CubeHole.data = STL_Parser.parseOBJ(CubeHoleMeshDataOBJ);


export {CubeHole};


