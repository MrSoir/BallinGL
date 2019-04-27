import './gl-matrix.js';
import {m4,v4, v3, MathBD, genTransformationInfo} from "./MathBD.js";
import {GLSL_Functions} from "./GLSL_Functions.js";
import {GL_Shape} from "./GL_Shape.js";

class Background extends GL_Shape{
	constructor(glMeta, size, center, centCol, gradCol){
		super(glMeta, 
			  undefined, //lightningMeta
			  undefined, //customUniforms
			  undefined, //instancingMeta
			  false		 // initShadersImmediately -> erst werden die customUniforms definiert, dann erst duerfen die shaders erstellt werden
			  );
		
		this.size = size;
		this.center = center;
		
		this.color   = this.validateColor(centCol);
		this.gradCol = this.validateColor(gradCol);
		
		this.genVertices();
		
		this.customUniforms = this.genCustomUniforms();
		this.initShaders(glMeta);
	}
	validateColor(col){
		if(col.length === 4){
			return col;
		}
		return [col[0], col[1], col[2], 1];
	}
	
	genUniformData(){
		return [
			{name: 'BackgrndCent'	, data: this.center},
		    {name: 'BackgrndSize'	, data: this.size},
		    {name: 'GradCol'		, data: this.gradCol},
		];
	}
	
	genCustomUniforms(){
		return {
			uniforms: 			this.genUniformData(),
			
			// VS:
			
			// FS:
			FS_BefMain: 		Background.FS_BefMain,
			FS_Main_BefLight: 	Background.FS_Main_BefLight,
		};
	}
	
	
	genVertices(){
		let w2 = this.size[0] * 0.5;
		let h2 = this.size[1] * 0.5;
		
		let cx = this.center[0];
		let cy = this.center[1];
		let cz = this.center[2];
		
		this.vertices = 
			   [ cx + -w2, cy + -h2, cz,	0, 0, -1,
				 cx +  w2, cy +  h2, cz,	0, 0, -1,
				 cx + -w2, cy +  h2, cz,    0, 0, -1,
				 
				 cx + -w2, cy + -h2, cz,    0, 0, -1,
				 cx +  w2, cy + -h2, cz,    0, 0, -1,
				 cx +  w2, cy +  h2, cz,    0, 0, -1];
	}
	getVertices(){
		return this.vertices;
	}
}

Background.FS_BefMain = `
	uniform vec3 BackgrndCent;
	uniform vec3 BackgrndSize;
	uniform vec4 GradCol;
	
	vec4 calcBackgrndColor(vec4 colBefLight){
		float posDist = length(BackgrndCent - FragPos);
		float ref     = min(BackgrndSize.x, BackgrndSize.y) * 0.5;//length( vec3(BackgrndSize.x * 0.5, BackgrndSize.y * 0.5, 0.0));
		
		float ratio = posDist / ref;
		return colBefLight + (GradCol - colBefLight) * ratio;
	}
`;

Background.FS_Main_BefLight = `

		colBefLight = calcBackgrndColor(colBefLight);
		
`;

export {Background};