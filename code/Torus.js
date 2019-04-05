import '/code/gl-matrix.js';
import {m4,v4, v3, MathBD, genTransformationInfo} from "/code/MathBD.js";
import {GLSL_Functions} from "/code/GLSL_Functions.js";
import {GL_Shape} from "/code/GL_Shape.js";
import {STL_Parser} from "/code/STL_Parser.js";
import {TorusMeshData} from "/code/TorusMeshData.js";
import {TorusMeshDataOBJ} from "/code/TorusMeshDataOBJ.js";
import {CubeHoleMeshData} from '/code/CubeHoleMeshData.js';


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


