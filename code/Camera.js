import './gl-matrix.js';
import {MathBD, m4, v4, v3, genTransformationInfo} from './MathBD.js';


class Camera{
	constructor(canvas){
		this.pos = [0, 0, -60];
		this.target = [0,0,0];
		
		this.yaw   = 0.0; // zx;
		this.pitch = 0.0; // y;
		this.revalidateTargetPos();
		
		this.canvas = canvas;
		
		this.generateProjectionMatrix();
		
		let offs = 20;
		let z = -60
		this.autoRotation = {
			isRunning: true,
			pos:  [ [-offs, -offs, z],
					[ offs,  offs, z * 0.8],
					[-offs,  offs, z * 0.9],
					[ offs, -offs, z]
				  ],
			travelTime: 5000,
			curTime: 0,
			id: 0,
		};
//		this.generateCirleAutoRotationPositions();
		this.startAutoRotation();
	}
	
	generateCirleAutoRotationPositions(){
		let offs = 30;
		let z = -60;
		let positions = [];
		let ids = 0;
		let steps = 20;
		for(let i=0; i < steps; i++){
			let angle = (Math.PI * 2) / steps * i;
			let x = Math.cos(angle) * offs;
			let y = Math.sin(angle) * offs;
			positions.push([x, y, z]);
		}
		this.autoRotation.travelTime = 1000;
		this.autoRotation.pos = positions;
	}
	
	getPosition(){
		return this.pos.slice();
	}
	
	nextRound(dt){
		if(this.autoRotation.isRunning){
			this.runAutoRotation(dt);
		}
	}
	
	startAutoRotation(){		
		this.pos = this.autoRotation.pos[this.autoRotation.id];
		this.autoRotation.isRunning = true;
	}
	stopAutoRotation(){
		this.autoRotation.isRunning = false;
		this.pos = [0, 0, -60];
	}
	setAutoRotation(){
		if(this.autoRotation.isRunning){
			this.stopAutoRotation();
		}else{
			this.startAutoRotation();
		}
	}
	runAutoRotation(dt){
		if(this.autoRotation.isRunning){
			let curTime = Math.min(this.autoRotation.travelTime, this.autoRotation.curTime + dt);
			this.autoRotation.curTime = curTime;
			
			let id = this.autoRotation.id;
			let nextId = (this.autoRotation.id + 1) % this.autoRotation.pos.length;
			
			let ratio = curTime / this.autoRotation.travelTime;
			let curPos = this.autoRotation.pos[id];
			let nextPos = this.autoRotation.pos[nextId];
			
			let newPos = v3.add(curPos, v3.mul(v3.sub(nextPos, curPos), ratio));
			
			this.pos = newPos;
			this.target = [0,0,0];
						
			if(curTime >= this.autoRotation.travelTime){
				this.autoRotation.curTime = 0;
				this.autoRotation.id = (this.autoRotation.id + 1) % this.autoRotation.pos.length;
			}
		}
	}
	
//	-----------------------------------------------------
	
	setViewOffset(offset){
		let yaw   = this.yaw;
//		let pitch = this.pitch;
		
		yaw   += offset.x;
		this.pitch += offset.y;
		
		let pitchMax = Math.PI / 2.0 - 0.0175; // Math.PI / 2.0 == 90° - 0.0175 -> 0.0174...Radians ~ 1° -> ca 89°
		
/*		if(yaw > max)
			yaw = max;
		else if (yaw < -max)
			yaw = -max;*/
		
		if(this.pitch > pitchMax)
			this.pitch = pitchMax;
		else if (this.pitch < -pitchMax)
			this.pitch = -pitchMax;
		
		this.yaw   = yaw;
		this.pitch = this.pitch;
		
		this.revalidateTargetPos();
	}
	turnLeft(offset){
		this.setViewOffset({x: Math.abs(offset), y: 0});
	}
	turnRight(offset){
		this.setViewOffset({x:-Math.abs(offset), y: 0});
	}
	lookUp(offset){
		this.setViewOffset({x: 0, y:  Math.abs(offset)});
	}
	lookDown(offset){
		this.setViewOffset({x: 0, y: -Math.abs(offset)});
	}
	
	revalidateTargetPos(){
		let newX = Math.cos(this.pitch) * Math.sin(this.yaw);
		let newY = Math.sin(this.pitch);
		let newZ = Math.cos(this.pitch) * Math.cos(this.yaw);
		
		this.target = v3.add(this.pos, [newX, newY, newZ]);
	}
	move(offset){
		this.pos    = v3.add(this.pos   , offset);
		this.target = v3.add(this.target, offset);
	}
	moveForward(fctr){
		let viewDir = v3.normalize( v3.sub(this.target, this.pos) );
		let offsVec = v3.mul(viewDir, fctr);
		this.pos = v3.add(this.pos, offsVec);
		this.target = v3.add(this.target, offsVec);
	}
	moveUp(fctr){
		let viewDir = v3.normalize( v3.sub(this.target, this.pos) );
		let crossViewDir = v3.cross(v3.normalize( v3.sub(this.target, this.pos)), [0,1,0]);
		let crossSidwDir = v3.cross(crossViewDir, viewDir);
		let offsVec = v3.mul(crossSidwDir, fctr);
		this.pos = v3.add(this.pos, offsVec);
		this.target = v3.add(this.target, offsVec);
	}
	moveSideways(fctr){
		let crossViewDir = v3.cross(v3.normalize( v3.sub(this.target, this.pos)), [0,1,0]);
		let offsVec = v3.mul(crossViewDir, fctr);
		this.pos = v3.add(this.pos, offsVec);
		this.target = v3.add(this.target, offsVec);
	}
	setPos(pos){ // pos == [x,y,z] -> array mit 3 werte = v3
		this.pos = pos;	
	}
	setTarget(target){ // target == [x,y,z] -> array mit 3 werte = v3
		this.target = target;	
	}
	
	setX(x){
		let diff = x - this.pos[0];
		this.pos[0] = x;
		this.target[0] += diff;
	}
	setY(y){
		let diff = y - this.pos[1];
		this.pos[1] = y;
		this.target[1] += diff;
	}
	setZ(z){
		let diff = z - this.pos[2];
		this.pos[2] = z;
		this.target[2] += diff;
	}
	
/*	setTargetX(x){
		this.target[0] = x;	
	}
	setTargetY(y){
		this.target[1] = y;	
	}
	setTargetZ(z){
		this.target[2] = z;	
	}*/
	
//	-----------------------------------------------------
	
	generateViewMatrix(){
		//return this.lookAt();
		return mat4.lookAt([], this.pos, this.target, [0,1,0]);
/*		let cameraDirection = v3.normalize( v3.sub(this.pos, this.target) );
		
		let up = [0, 1, 0];
		let cameraRight = v3.normalize( v3.cross(up, cameraDirection) );
		let cameraUp    = v3.cross(cameraDirection, cameraRight);
		
		let viewMatrix = m4.mat(1.0);
		
		viewMatrix[0*4 + 0] = cameraRight[0];
		viewMatrix[0*4 + 1] = cameraRight[1];
		viewMatrix[0*4 + 2] = cameraRight[2];
		
		viewMatrix[1*4 + 0] = cameraUp[0];
		viewMatrix[1*4 + 1] = cameraUp[1];
		viewMatrix[1*4 + 2] = cameraUp[2];
		
		viewMatrix[2*4 + 0] = cameraDirection[0];
		viewMatrix[2*4 + 1] = cameraDirection[1];
		viewMatrix[2*4 + 2] = cameraDirection[2];
		
		let translateMatrix = m4.mat(1.0); // translateMatrix sorgt dafuer, dass die kamera an der pos positioniert ist
		translateMatrix[0*4 + 3] = -this.pos[0];
		translateMatrix[1*4 + 3] = -this.pos[1];
		translateMatrix[2*4 + 3] = -this.pos[2];
		
		viewMatrix[0*4 + 3] = -this.pos[0];
		viewMatrix[1*4 + 3] = -this.pos[1];
		viewMatrix[2*4 + 3] = -this.pos[2];
		
		//viewMatrix = m4.mul(viewMatrix, translateMatrix); // hier mal anders herum: nurmalerweise wird die translateMatrix an linke stelle der multiplikation gesetzt, hier ist das aber tats. korrekt!
		return m4.transpose(viewMatrix); // OpenGL-column-first-order....*/
	}
	
	lookAt(){
//		glm::mat4 calculate_lookAt_matrix(glm::vec3 position, glm::vec3 target, glm::vec3 worldUp)
    	// 1. Position = known
    	// 2. Calculate cameraDirection
    	
    	let worldUp = [0,1,0];
    	
    	let zaxis = v3.normalize( v3.sub(this.pos, this.target) );
    	// 3. Get positive right axis vector
    	let xaxis = v3.normalize( v3.cross( v3.normalize(worldUp), zaxis ) );
    	// 4. Calculate camera up vector
    	let yaxis = v3.cross(zaxis, xaxis);
 		
   	// Create translation and rotation matrix
   	// In glm we access elements as mat[col][row] due to column-major layout
    	let translation = m4.mat(); // Identity matrix by default
    	translation[3*4 + 0] = -this.pos[0]; // Third column, first row
    	translation[3*4 + 1] = -this.pos[1];
    	translation[3*4 + 2] = -this.pos[2];
    	let rotation = m4.mat();
    	rotation[0*4 + 0] = xaxis[0]; // First column, first row
	   	rotation[0*4 + 0] = xaxis[1];
	   	rotation[0*4 + 0] = xaxis[2];
    	rotation[0*4 + 1] = yaxis[0]; // First column, second row
    	rotation[0*4 + 1] = yaxis[1];
    	rotation[0*4 + 1] = yaxis[2];
    	rotation[0*4 + 2] = zaxis[0]; // First column, third row
    	rotation[0*4 + 2] = zaxis[1];
    	rotation[0*4 + 2] = zaxis[2]; 
 	
 	   // Return lookAt matrix as combination of translation and rotation matrix
    	return m4.mul(rotation, translation); // Remember to read from right to left (first translation then rotation)
	}
	
//	-----------------------------------------------------

	getProjectionMatrix(canvas){
		if(canvas !== undefined && canvas !== null){
			this.canvas = canvas;
		}

		if( (this.projMatr === undefined || this.projMatr === null)
				&& this.canvas !== undefined && this.canvas !== null){
			this.generateProjectionMatrix();
		}
			
		return this.projMatr;	
	}
	generateProjectionMatrix(){
		let height = this.canvas.clientHeight;
		let width = this.canvas.clientWidth;
		let aspectRatio = width/height;
		
		let near = 0.1;
		let far = 300;
		
		let pers = [];
		mat4.perspective(pers, Math.PI/4, aspectRatio, near, far);
		//mat4.ortho(pers, -width*0.5, width*0.5, -height*0.5, height*0.5, near, far);
		
		this.projMatr = pers;
	}
}

export {Camera};