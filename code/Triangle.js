import './gl-matrix.js';
import {m4,v4, v3, MathBD, genTransformationInfo} from "./MathBD.js";
import {GLSL_Functions} from "./GLSL_Functions.js";
import {GL_Shape} from "./GL_Shape.js";

class Triangle extends GL_Shape{
	constructor(glMeta, transformationData=genTransformationInfo(), 
				color=[0,1,0, 1], 
				lightningMeta, 
				customUniforms,
				instancingMeta){
		super(glMeta, lightningMeta, customUniforms, instancingMeta);
		
		this.transformationData = transformationData;
		
		this.color = color;
	}
	
	getVertices(){
		let to = 1;
		let to2 = to * 0.5;
		return [-to, -to2, 0.0,
				 to, -to2, 0.0,
	    	      0,  to,  0.0,
	    	    -to,  to2, 0.0,
	    	      0, -to,  0.0,
	    	     to,  to2, 0,0];
    };
}
					  

// aus performance-gruenden: der parameter triangles muessen keine Triangle-Klassenobjekte sein!!!
// folgendes ist vollkommend ausreichend: {transformation, color,}!!!
Triangle.paintTriangles = function(glMeta, triangles, lightningOn = false){
	
	if(triangles.length == 0){
//		console.log('riangle.paintTriangleS: nothing to paint...');
		return;
	}/*else{
		console.log(triangles.length, ' to paint!');
	}*/
	
	let models = [];
	let colors = [];
	
	for(let i=0; i < triangles.length; ++i){
		// 1. die transformationen zusammensuchen:
		let trnsfrm = triangles[i].transformation;
		let mdl = MathBD.genTransformationMatrix(trnsfrm);
		models.push.apply(models, mdl);//.push(mdl);
		
		// 2. nun die TriangleFarben: hier sicherstellen, dass die farbe ein 4-elemente-Array ist -> im FragmentShader wird gefordert: '... vec4 objCol;':
		let col = triangles[i].color;
		if(col[3] === undefined || col[3] === null){
			col[3] = 1;
		}
		colors.push( col[0], col[1], col[2], col[3] );
	}
	
	if(Triangle.instancingPrototype === undefined){
		console.log('creating instanced Triangle');
		let instancingMeta = {
			attributes:
				  [{data: models, 
				    name: 'iModel',  
				    dataType: 'mat4', 
				    dataSizes: [4,4,4,4],
				    VS_Main_BefTrans: 'model = iModel;',
				   },
				   {data: colors, 
				    name: 'aInstObjCol', 
				    dataType: 'vec4', 
				    dataSizes: [4],
				    VS_BefMain: 'flat out vec4 instObjCol;',
				    VS_Main_AftTrans: 'instObjCol = aInstObjCol;',
				    FS_BefMain: 'flat in  vec4 instObjCol;',
				    FS_Main_BefLight: 'colBefLight = instObjCol;',
				   },],
			count: triangles.length,
		};
		let lightningMeta = lightningOn ? undefined : {lightningOn: false};
		let trngl = new Triangle(glMeta, 
								/*transformationData:*/ undefined, 
								/*color:*/ undefined, 
								/*lightningMeta:*/ lightningMeta,
								/*customUniforms:*/ undefined,
								/*instancingMeta:*/ instancingMeta);
		Triangle.instancingPrototype = trngl;
	}else{
		Triangle.instancingPrototype.resetInstancingData({attributes: [{name: 'iModel'	   , data: models},
													  			  	   {name: 'aInstObjCol', data: colors}],
													  	  count: triangles.length});
	}
	Triangle.instancingPrototype.paint(glMeta);
};


export {Triangle};


