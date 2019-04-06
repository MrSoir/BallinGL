import '/code/gl-matrix.js';
import {m4,v4, v3, MathBD} from "/code/MathBD.js";
import {GLSL_Functions} from "/code/GLSL_Functions.js";
import {GL_Shape} from "/code/GL_Shape.js"
import {SphereFactory} from '/code/SphereFactory.js';
import {ShaderFactory} from '/code/ShaderCreator.js';
import {RectGenerator} from '/code/RectGenerator.js';
import {STL_Parser} from "/code/STL_Parser.js";
import {CubeHoleMeshData} from '/code/CubeHoleMeshData.js';
import {CubeHole} from '/code/CubeHole.js';

class Court{
	constructor(glMeta, center, size, color = [1.0,0.2,0.2], level=0){
		
		this.size = size;
		this.center = center;
		this.borderWidth = 1;
		
		this.rotate = [0,0,0];
//		this.scale 	= [1,1,1];
		
		this.color = color;
		
		this.level = level;
		
		// jedes mal beim resizen muessen die borders neu berechnet werden!!!:
		this.gateFctr = 0.4;
		
		this.maxGates = 4;
		this.genGates();
		this.genGatesColors();
	}
	flatten(tarArr, sourceArr){
		for(let i=0; i < sourceArr.length; ++i){
			tarArr.push.apply(tarArr, sourceArr[i]);
		}
	}
	
	genGatesColors(){
		this.gatesColors = [[0.0, 1.0, 0.0, 1.0],
							[0.3, 0.3, 1.0, 1.0],
							[1.0, 0.0, 1.0, 1.0],
							[0.9568627451	,	0.2578125	,	0.439688716, 1.0],
							];
		this.gatesColorArr = [];
		this.flatten(this.gatesColorArr, this.gatesColors);
	}
	getGateColor(id){
		return this.gatesColors[id].slice();
	}
	getGateCount(){return this.gates.length;}
	
	setLevel(level){
		this.level = level;
		this.genGates();
	}
	
	getGates(){return this.gates.slice();}
	genGates(){
		this.gates = [];
		this.gatesArr = [];
		
		let levelCnt = Math.min(this.level+1, this.maxGates);
		let courtBorders = this.getMinMax();
		
		for(let i=0; i < levelCnt; ++i){
			this.gates.push( this.genGate(i, courtBorders) );
		}
		
		this.flatten(this.gatesArr, this.gates);
	}
	genGate(id, courtBorders){
		let fctr = this.gateFctr;
		
		let w = courtBorders.maxX-courtBorders.minX;
		let h = courtBorders.maxY-courtBorders.minY;
		
		let w2 = w * 0.5;
		let h2 = h * 0.5;
		
		let wFct2 = w2 * fctr;
		let hFct2 = h2 * fctr;
		
		let centX = courtBorders.minX + w * 0.5;
		let centY = courtBorders.minX + h * 0.5;
		
		let bw = this.borderWidth + 0.4;
		
		switch (id){
			case 0:
				return [centX - wFct2, centX + wFct2, centY + h2, centY + h2 + bw];
				break;
			case 1:
				return [centX + w2, centX + w2 + bw, centY - hFct2, centY + hFct2];
				break;
			case 2:
				return [centX - wFct2, centX + wFct2, centY - h2 - bw, centY - h2];
				break;
			case 3:
				return [centX - w2 - bw, centX - w2, centY - hFct2, centY + hFct2];
				break;
		}
	}
	ballIntersectsBorders(ball){		
		let [ballMinX, ballMaxX, ballMinY, ballMaxY] = ball.getMinMax();
		let [minX, maxX, minY, maxY] = this.getMinMax();
		
		return ballMinX <= minX ||
			   ballMaxX >= maxX ||
			   ballMinY <= minY ||
			   ballMaxY >= maxY;
	}
	// checkt ober der ball sich noch im spielfeld befindet. falls nicht, setzt er ihn wieder ins spielfeld zurueck und
	// aendert seine bewegungsrichtung:
	checkIfBallIsInsideCourtAndCorrectIfNot(ball, smallerCourtFctr = 1){
		if(ball.isInGate)
			return false;
		
		let ballMinMax = ball.getMinMax();
		let courtMinMax = this.getMinMax(smallerCourtFctr);
				
		let radius = ball.radius;
		
		let ballCenter = ball.getCenter();
		let ballVel    = ball.getVelocity();
		
		let touchedBorders = false;
		if(ballMinMax.minX < courtMinMax.minX){
			ballCenter[0] = courtMinMax.minX + radius;
			ballVel[0]	  =  Math.abs(ballVel[0]);
			touchedBorders = true;
		}else if (ballMinMax.maxX > courtMinMax.maxX){
			ballCenter[0] = courtMinMax.maxX - radius;
			ballVel[0]	  = -Math.abs(ballVel[0]);
			touchedBorders = true;
		}
		
		if(ballMinMax.minY < courtMinMax.minY){
			ballCenter[1] = courtMinMax.minY + radius;
			ballVel[1]	  =  Math.abs(ballVel[1]);
			touchedBorders = true;
		}else if (ballMinMax.maxY > courtMinMax.maxY){
			ballCenter[1] = courtMinMax.maxY - radius;
			ballVel[1]	  = -Math.abs(ballVel[1]);
			touchedBorders = true;
		}
		
		if(touchedBorders){
			ball.setCenter(ballCenter);
			ball.setVelocity(ballVel);
		}
		return touchedBorders;
	}
	
	checkIfIsInGate(ball){
		let ballMinMax = ball.getMinMax();
		let gateBounds = this.gates[ball.gateId];
		
		let bcx = ball.center[0];
		let bcy = ball.center[1];
		
		if(ball.gateId == 0){
			if(ballMinMax.maxY >= gateBounds[2] &&
				bcx >= gateBounds[0] &&
				bcx <= gateBounds[1] ){
				return true;
			}
		}else if(ball.gateId == 2){
			if(ballMinMax.minY <= gateBounds[3] &&
				bcx >= gateBounds[0] &&
				bcx <= gateBounds[1] ){
				return true;
			}
		}else if(ball.gateId == 1){
			if(ballMinMax.maxX >= gateBounds[0] &&
				bcy >= gateBounds[2] &&
				bcy <= gateBounds[3] ){
				return true;
			}
		}else if(ball.gateId == 3){
			if(ballMinMax.minX <= gateBounds[1] &&
				bcy >= gateBounds[2] &&
				bcy <= gateBounds[3] ){
				return true;
			}
		}
		return false;
	}	
	
	getMinMax(smallerCourtFctr = 1){
		let minX = this.center[0] - (this.size.width * 0.5) * smallerCourtFctr;
		let maxX = minX + this.size.width * smallerCourtFctr;
		let minY = this.center[1] - (this.size.height * 0.5) * smallerCourtFctr;
		let maxY = minY + this.size.height * smallerCourtFctr;
		let minZ = this.center[2] - (this.size.depth  * 0.5) * smallerCourtFctr;
		let maxZ = minZ + this.size.depth;
		return {minX, maxX,
				minY, maxY,
				minZ, maxZ};
	}
	
	getVertices(){
		return Court.data.verticesWithNormals;
    };
	
	paint(glMeta){
		
		if(this.cubeHole === undefined){
			let lightningMeta = GL_Shape.genLightningMeta();
			lightningMeta.ambientFctr = 0.3;
			
			let cubeHole = new CubeHole(glMeta, this.genTransformationData(), 
								    	this.color,
								    	lightningMeta,
								    	this.genUniforms());
			cubeHole.transformationData = this.genTransformationData();
			
			this.cubeHole = cubeHole;
		}else{
			this.cubeHole.transformationData = this.genTransformationData();
			this.cubeHole.resetCustomUniformData( this.genUniformData() );
		}
		this.cubeHole.paint(glMeta);
	}
	
	genTransformationData(){
		return {
			rotate: 	this.rotate,
			translate: 	this.center,
			scale: 		[this.getScaleX(), this.getScaleY(), this.getScaleZ()],//this.size.slice(),
		};
	}
	getScaleX(){
		return this.size.width*0.5;
	}
	getScaleY(){
		return this.size.height*0.5;
	}
	getScaleZ(){
		return this.size.depth*0.5;
	}
	
	getFS_BefMain(){
		let level = this.level;
		
		let arrLength = this.gatesColors.length;
		
		let FS_BefMainStr =  GLSL_Functions.StrReplacer(Court.FS_BefMain, arrLength, arrLength);
		return FS_BefMainStr;
	}
	genUniformData(){
		return [
			{name: 'gatesColors'	, data: this.gatesColorArr,	asVector: true, offset: 4},
		    {name: 'gatesDims'  	, data: this.gatesArr	   , 	asVector: true, offset: 4},
		    {name: 'bordSclFctrX'	, data: [this.getScaleX()],},
		    {name: 'bordSclFctrY'	, data: [this.getScaleY()],},
		];
	}
	genUniforms(){
		return {
			uniforms: 			this.genUniformData(),
			
			// VS:
			VS_BefMain:			Court.VS_BefMain,
			VS_Main_BefTrans: 	Court.VS_Main_BefTrans,
			
			// FS:
			FS_BefMain: 		this.getFS_BefMain(),//Court.FS_BefMain,
			FS_Main_BefLight: 	Court.FS_Main_BefLight,
			FS_Main_AftLight: 	Court.FS_Main_AftLight,
		};
	}
}

Court.data = STL_Parser.parse(CubeHoleMeshData);


//	----------------------------------------------------------------------
// VertexShader:

Court.VS_BefMain = 
`
out vec2 untransformedPos;
`;
Court.VS_Main_BefTrans = `untransformedPos = vec2(pos.x, pos.y);`;
	
//	----------------------------------------------------------------------
// FragmentShader:

Court.FS_BefMain = 
`in vec2 untransformedPos;

uniform vec4 gatesColors[{x}];
uniform vec4 gatesDims[{x}];
uniform float bordSclFctrX;
uniform float bordSclFctrY;

int gateId(){
	for(int i=0; i < gatesDims.length(); ++i){
		float x = untransformedPos.x * bordSclFctrX;
		float y = untransformedPos.y * bordSclFctrY;
		if(x >= gatesDims[i][0] &&
		   x <= gatesDims[i][1] &&
		   y >= gatesDims[i][2] &&
		   y <= gatesDims[i][3]){
		   return i;
		}
	}
	return -1;
}
vec4 computeCourtColor(vec4 colBefLight){
	int id = gateId();
	if(id > -1){
		return gatesColors[id];
	}
	return colBefLight;
}

`;

Court.FS_Main_BefLight = 
`	
	colBefLight = computeCourtColor(colBefLight);
`;
Court.FS_Main_AftLight = 
`	
	if(gateId() > -1){
		colAftLight *= 2.5;
	}
`;


export {Court};

