import '/code/gl-matrix.js';
import {m4,v4, v3, MathBD, genTransformationInfo} from "/code/MathBD.js";
import {GLSL_Functions} from "/code/GLSL_Functions.js";
import {GL_Shape} from "/code/GL_Shape.js";
import {STL_Parser} from "/code/STL_Parser.js";
import {SphereMeshData} from "/code/SphereMeshData.js";
import {SphereMeshDataPLY} from "/code/SphereMeshDataPLY.js";
import {SphereMeshDataOBJ} from "/code/SphereMeshDataOBJ.js";

class Sphere extends GL_Shape{
	constructor(glMeta, transformationData=genTransformationInfo(), 
				color=[0.2,0.2,0.2], 
				lightningMeta, 
				customGLSLmeta,
				instancingMeta){
		super(glMeta, lightningMeta, customGLSLmeta, instancingMeta);
		
		console.log('in sphere constructor');
		
		// GL_Shape definiert und verwendet ebenfalls this.transformationData & this.color
		// diese werte werden nun ueberschrieben:
		this.transformationData = transformationData;
		
		this.color = color;

	}
	
	// ueberschreibt GL_Shape.getVertices:
	getVertices(){
		if(this.lightningMeta.lightningOn)
			return Sphere.data.verticesWithNormals;
		else
			return Sphere.data.vertices;
    }
}

Sphere.data = STL_Parser.parseOBJ(SphereMeshDataOBJ);


export {Sphere};


