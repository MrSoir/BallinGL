import './gl-matrix.js';
import {m4,v4, v3, v2, MathBD, genTransformationInfo} from "./MathBD.js";
import {Torus} from "./Torus.js";


class Magnet{
	constructor(glMeta, center, radius, color=[0.2, 0.2, 0.2, 1]){
		this.center = center;
		this.radius = radius;
		this.rotate = [0,0,0];
		
		this.angle = 0; // angle noch in degrees, da ich damals den fragmentShader noch in degrees programmiert habe. muss auch nicht geaendert werden, da der fragmentShader ohne toDegrees-Umwandlung klarkommt!
		this.color = color;
		this.angleColor = [1, 30/255, 1, 1];
		this.puffer = 15;				// puffer == wie breit soll der angle-indicator werden
		this.indicator_puffer = 0.2;	// indicator_puffer == puffer, damit der indicator sauber, glatt und geschmeidig aussieht
		
		this.force = 5;
	}
	
	getAngle(){
		return this.angle + 90;
	}
	
	// in setMousePos wird wird abhaengig von der mouseposition pos der magnet-indicator ausgerichtet (this.angle)
	// dabei wird auf den z-wert verzichtet, es wird also davon ausgegangen, dass die mouseposition pos nur eine
	// x und eine y aber keine z-komponente enthaelt. damit wird implizit davon ausgegangen, dass beim bewegen der maus
	// der benutzer frontal auf den magnet/torus starrt:
	setMousePos(mousePos, canvasBounds){
		let canvasCenter = {x: canvasBounds.x + canvasBounds.width  * 0.5,
						    	  y: canvasBounds.y + canvasBounds.height * 0.5};
		
		let pos2D;
		// je nachdem, ob mousePos als {x: ?, y: ?} oder als [x,y] angeliefert wird:
		if(mousePos.length >= 2){
			pos2D = [mousePos[0], mousePos[1]];
		}else{
			pos2D = [mousePos.x, mousePos.y];
		}
		
		let center2D = [canvasCenter.x, canvasCenter.y];
		let diff = v2.sub(pos2D, center2D);
		let angle = MathBD.getTanDegr(diff[0], diff[1]);
		
		angle = (angle + 90) % 360;
		
		this.angle = angle;
	}
	setRelMousePos(dx, dy){		
		let angle = MathBD.getTanDegr(dx, dy);
		
		angle = (angle + 90) % 360;
		
		if(!!angle){
			this.angle = angle;
		}
	}
	
	increaseAngle(offset){
		this.angle = (this.angle + offset);
		if(this.angle < 0){
			this.angle = 360.0 + this.angle;
		}
		this.angle = this.angle % 360;
	}
	decreaseAngle(offset){
		this.increaseAngle( -offset );
	}
	paint(glMeta){
		if(this.torus === undefined){
			let torus = new Torus(glMeta, 
								  this.genTransformationData(), 
								  this.color,
								  this.genCustomUniforms());
			this.torus = torus;
		}else{
			this.torus.transformationData = this.genTransformationData();
			this.torus.resetCustomUniformData( this.genUniformData() );
		}
		this.torus.paint(glMeta);
	}

	setAngle(pos){
		let center = this.center;
		let dir = v3.normalize(v3.sub(pos, center));
		
		if(dir[0] == 0){
			if(dir[1] >= 0){
				this.angle = Math.PI / 2; // 90°
			}else{
				this.angle = Math.PI * 3/2; // 270°
			}
		}else{
			this.angle = Math.atan(dir[1]/dir[0]);
		}
	}
	genTransformationData(){
		return {
			rotate: 	this.rotate,
			translate: 	this.center,
			scale: 		[this.radius, this.radius, this.radius],
		};
	}
	genUniformData(){
		let center2D = [this.center[0], this.center[1]];
		return [
			{name: 'center'             , data: center2D},
		    {name: 'angleColor'         , data: this.angleColor},
		    {name: 'angle'              , data: [this.angle]},
		    {name: 'puffer'             , data: [this.puffer]},
		    {name: 'indicator_puffer'   , data: [this.indicator_puffer]},
		];
	}
	genCustomUniforms(){
		return {
			uniforms: 			this.genUniformData(),
			
			// VS:
			VS_BefMain:			Magnet.VS_BefMain,
			VS_Main_AftTrans: 	Magnet.VS_Main_AftTrans,
			
			// FS:
			FS_BefMain: 		Magnet.FS_BefMain,
			FS_Main_BefLight: 	Magnet.FS_Main_BefLight,
			FS_Main_AftLight: 	Magnet.FS_Main_AftLight,
		};
	}
}

//	----------------------------------------------------------------------
// VertexShader:

Magnet.VS_BefMain = 
`
out vec2 modelSpaceFragPos;
`;
Magnet.VS_Main_AftTrans = `modelSpaceFragPos = vec2(aPos.x, aPos.y);`;
	
//	----------------------------------------------------------------------
// FragmentShader:

Magnet.FS_BefMain = 
`in vec2 modelSpaceFragPos;

uniform vec4 angleColor;
uniform float angle;
uniform float puffer;
uniform float indicator_puffer;
uniform vec2 center;


float computeAngleFromPoint(vec2 v)
{
    vec2 refVec = vec2(0.0f,1.0f);
    vec2 tarVec = vec2(v.x, v.y);
    tarVec = normalize(tarVec);
    
    float cosinus = dot(tarVec, refVec);
    float angle = degrees(acos(cosinus));
    if(v.x > 0.0)
        angle = 360.0 - angle;
    return angle;
}
int computeMagnetAngleId(){
	vec2 v_to_cent = modelSpaceFragPos;
    float curAngle = computeAngleFromPoint(v_to_cent);
    
    float upperBound = mod(angle+puffer, 360.0f);
    float lowerBound = mod(angle-puffer, 360.0f);


    if( curAngle <= indicator_puffer || 
        curAngle >= (360.0f-indicator_puffer) )
    {
        return 1;
    }else
    {
        if(upperBound < angle){
            if(curAngle <= upperBound){
                return 0;
            }else if (curAngle >= lowerBound){
                return 0;
            }else{
                return -1;
            }
        }else if (lowerBound > angle){
            if(curAngle >= lowerBound){
                return 0;
            }else if (curAngle <= upperBound){
                return 0;
            }else{
                return -1;
            }
        }else if ( curAngle <= upperBound &&
                   curAngle >= lowerBound ){
           return 0;
        }else{
            return -1;
        }
    }
}
vec4 getMagnetColor(int id){
	switch( id ){
		case 0:
			return vec4(1.0, 0.0, 0.0, 1.0);
			break;
		case 1:
			return angleColor;
			break;
		default:
			return objCol;
	}
}

`;

Magnet.FS_Main_BefLight = 
`	
	int angleId = computeMagnetAngleId();
	colBefLight = getMagnetColor(angleId);
`;

Magnet.FS_Main_AftLight = 
`	
	if(angleId > -1){
		colAftLight *= 2.5;
	}
`;

export {Magnet};


