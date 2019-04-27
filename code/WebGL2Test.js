"use strict";

import {ShaderFactory} from './ShaderCreator.js';
import {MathBD, m4, v4, v3, genTransformationInfo} from './MathBD.js';
import {Camera} from './Camera.js';
import {Ballin} from './Ballin.js';
import {Cube} 	from './Cube.js';
import {Sphere} from './Sphere.js';
import {LightSource} from './LightSource.js';
import {Line} from "./Line.js";
import {Circle} from "./Circle.js";
import {Torus} from './Torus.js';
import {InstancedTriangle} from './InstancedTriangle.js';
import {Background} from "./Background.js";

class BallinHelper{
	constructor(){
		
		this.initBallin();
		
		this.genRandomLightPath();
		
		this.sliderFctr = 0.1;
		
		this.moveSensitivity = 1;
		this.lookSensitivity = 0.002;
		this.turnSensitivity = 0.05;
		this.lightMoveSensitivity = 1;
		
		this.gameLoopOn = true;
	}
	
	setViewOffset(offset){
		offset.x *= this.lookSensitivity;
		offset.y *= this.lookSensitivity;
		this.camera.setViewOffset(offset);
		this.repaintGame();
	}
	lookUp(turnSensitivity = this.turnSensitivity){
		this.camera.lookUp(turnSensitivity);
		this.repaintGame();
	}
	lookDown(){
		this.camera.lookDown(this.turnSensitivity);
		this.repaintGame();
	}
	turnLeft(){
		this.camera.turnLeft(this.turnSensitivity);
		this.repaintGame();
	}
	turnRight(){
		this.camera.turnRight(this.turnSensitivity);
		this.repaintGame();
	}
	setLookSensitivity(lookSensitivity){
		this.lookSensitivity = lookSensitivity;
	}
	setMoveSensitivity(moveSensitivity){
		this.moveSensitivity = moveSensitivity;
	}
	getLookSensitivity(){return this.lookSensitivity;}
	getMoveSensitivity(){return this.moveSensitivity;}
	
	moveCamera(offset){
		offset = v3.mul(offset, 0.1);
		this.camera.move(offset);
		this.repaintGame();
	}
	moveForward(offset = this.moveSensitivity){
		this.camera.moveForward(offset);
		this.repaintGame();
	}
	moveUp(offset = this.moveSensitivity){
		this.camera.moveUp(offset);
		this.repaintGame();
	}
	moveBackward(){
		this.moveForward( -this.moveSensitivity );
	}
	moveDown(){
		this.moveUp( -this.moveSensitivity );
	}
	moveLeft(){
		this.moveSideways( -this.moveSensitivity );
	}
	moveRight(){
		this.moveSideways(  this.moveSensitivity );
	}
	moveSideways(offset){
		this.camera.moveSideways(offset);
		this.repaintGame();
	}
	
	setCameraX(val){
		this.camera.setX(val * this.sliderFctr);
		this.repaintGame();
	}
	setCameraY(val){
		this.camera.setY(val * this.sliderFctr);
		this.repaintGame();
	}
	setCameraZ(val){
		this.camera.setZ(val);
		this.repaintGame();
	}
	
	setCameraTargetX(val){
		this.camera.setTargetX(val * this.sliderFctr);
		this.repaintGame();
	}
	setCameraTargetY(val){
		this.camera.setTargetY(val * this.sliderFctr);
		this.repaintGame();
	}
	setCameraTargetZ(val){
		this.camera.setTargetZ(val);
		this.repaintGame();
	}
	lightLeft(offset = this.lightMoveSensitivity){
		this.lightPos[0] += offset;
		this.repaintGame();
	}
	lightRight(){
		this.lightLeft(-this.lightMoveSensitivity);
	}
	lightForward(offset = this.lightMoveSensitivity){
		this.lightPos[2] += offset;
		this.repaintGame();
	}
	lightBackward(){
		this.lightForward( -this.lightMoveSensitivity );
	}
	lightUp(offset = this.lightMoveSensitivity){
		this.lightPos[1] += offset;
		this.repaintGame();
	}
	lightDown(){
		this.lightUp( -this.lightMoveSensitivity );
	}
	setLightX(val){
		this.lightPos[0] = val;
		this.repaintGame();
	}
	setLightY(val){
		this.lightPos[1] = val;
		this.repaintGame();
	}
	setLightZ(val){
		this.lightPos[2] = val;
		this.repaintGame();
	}
	setLightRed(val){
		this.lightCol[0] = val;
		this.repaintGame();
	}
	setLightGreen(val){
		this.lightCol[1] = val;
		this.repaintGame();
	}
	setLightBlue(val){
		this.lightCol[2] = val;
		this.repaintGame();
	}
	
	moveMagnetRight(){
		this.ballin.moveMagnetRight();
		this.repaintGame();
	}
	moveMagnetLeft(){
		this.ballin.moveMagnetLeft();
		this.repaintGame();
	}
	
	setMousePos(pos, canvasBounds){
		this.ballin.setMousePos(pos, canvasBounds);
		this.repaintGame();
	}
	setRelMousePos(dx, dy){
		this.ballin.setRelMousePos(dx, dy);
		this.repaintGame();
	}
	
	setCameraAutoRotation(){
		this.camera.setAutoRotation();
	}
//	-------------------------------------------------------------

	setSpeed(speed){
		this.ballin.setSpeed(speed);
	}
	setLevel(level){
		this.ballin.setLevel(level);
	}
	
	genModelMatrix(id){
		let transInfos = genTransformationInfo();
		//transInfos.scale = [0.5, 1.0, 1.0];
		//transInfos.rotate = [Math.PI/4.0, 0.0, 0.0];
		transInfos.translate = [0.0, 0.0, id * 5];
		
		return m4.generateTransformationMatrix(transInfos);
	}
	genView(){
		this.view = this.camera.generateViewMatrix();
	}
	genProjection(){
		this.proj = this.camera.getProjectionMatrix();
	}
	
	getGlMeta(){
		return {
		  	gl: 		this.gl,
		  	view: 		this.view.slice(),
		  	projection: this.proj.slice(),
		  	cameraPos: 	this.camera.getPosition(),
		  	lightPos: 	this.lightPos.slice(),
		  	lightCol: 	this.lightCol.slice(),
		};
	}
	
//	------------------------------------------------------------------
	
	nextLevel(){
		this.ballin.nextLevel();
	}
	setLevelUpdater(levelUpdater){
		this.ballin.setLevelUpdater(levelUpdater);
	}
	
	//----------------------------------------------------------------------
	
	resize(){
		this.canvas = document.getElementById('canvas');
	    canvas.width  = window.innerWidth;
	    canvas.height = window.innerHeight;
	    
	    this.canvasWidth  = canvas.width;
	    this.canvasHeight = canvas.height;
	    
	    if(this.camera === undefined ||
	   	   this.camera === null){
	   	   	this.camera = new Camera(this.canvas);
	   	}
	    
	    this.camera.generateProjectionMatrix();
	    
		this.genView();
		this.genProjection();
	}
	
/*	setParticleFactor(fctr){
		this.ballin.setParticleFactor(fctr);
	}
	getParticleFactor(){
		this.ballin.getParticleFactor();
	}*/
	
	initBallin(){

		this.lightPos = [0, 0, -10];
		this.lightCol = [1, 1, 1];
	   
		// -- Init WebGL Context
	  	var gl = canvas.getContext('webgl2');//, { antialias: true });
	  	var isWebGL2 = !!gl;
		if(!isWebGL2) {
			document.getElementById('info').innerHTML = 'WebGL 2 is not available.  See <a href="https://www.khronos.org/webgl/wiki/Getting_a_WebGL_Implementation">How to get a WebGL 2 implementation</a>';
			return;
		}
		
		this.resize();
		
		this.gl = gl;
		
		// genView und genProjection MUESSEN (logischwerweise) vor getGlMeta aufgerufen werden!!!
		let glMeta = this.getGlMeta();
		
		this.ballin = new Ballin(glMeta);
		
//		this.instncdTriangles = new InstancedTriangle(glMeta);
		
		this.background = new Background(glMeta, [300, 300, 0], [0,0,40], [1,0,0, 1], [0,0,0, 1]);
		this.lightSource = new LightSource(glMeta);

		this.finishedRendering = true;
		this.repaintGame(0);
	}
	repaint(){
		this.repaintGameHelper();
	}
	
	repaintGame(dt = 0){
		if( !this.finishedRendering )
			return;
		
		if(this.gameLoopOn)
			return; // dann wird schon durch die gameloop neu gerendert!
		
		this.repaintGameHelper();
	}
	moveGame(dt = 0, render){
		if(dt > 0){
			this.ballin.nextRound(dt);
			this.moveLightOnPath(dt);
			this.camera.nextRound(dt);
			if(render && this.finishedRendering){
				this.repaintGameHelper();
			}
		}
	}
	
	justRender(){
		this.repaintGameHelper();
	}
	
	genRandomLightPath(){
		let pathCount = 10;
		
		this.lightPath = [];
		
		for(let i=0; i < pathCount; ++i){
			let offs = 20;
			
			let xOffs = MathBD.rndNumbGen(-offs, offs);
			let yOffs = MathBD.rndNumbGen(-offs, offs);
			let zOffs = MathBD.rndNumbGen(0, 30);
			
			let angle = MathBD.rndNumbGen(0, 2*Math.PI);
			
			let scale = 10;
			
			let x = Math.cos(angle) * scale + xOffs;
			let y = Math.sin(angle) * scale + yOffs;
			let z = -zOffs;
			
			this.lightPath.push( [x,y,z] );
		}
		
		this.lightMovement = {
			moveTime: 5000,
			pastTime: 0,
			curPathId: 0,
			lightPath: this.lightPath,
		};
	}
	
	moveLightOnPath(dt){
		
		let lightMovement = this.lightMovement;
		
		lightMovement.pastTime += dt;
		if(lightMovement.pastTime > lightMovement.moveTime){
			lightMovement.pastTime = 0;
			lightMovement.curPathId = (lightMovement.curPathId + 1) % lightMovement.lightPath.length;
		}
		
		let curPathId  = lightMovement.curPathId;
		let nextPathId = (curPathId + 1) % lightMovement.lightPath.length;
		
		let curPos  = lightMovement.lightPath[curPathId];
		let nextPos = lightMovement.lightPath[nextPathId];
		
		let curOffsRatio = lightMovement.pastTime / lightMovement.moveTime;
		
		let updatedPos = v3.add(curPos, v3.mul(v3.sub(nextPos, curPos), curOffsRatio));
		
		this.lightPos = updatedPos;
		
		
		/*if(this.lightAngle === undefined){
			this.lightAngle = 0;
		}
		
		let offs = 5;
		let xOffs = MathBD.rndNumbGen(-offs, offs);
		let yOffs = MathBD.rndNumbGen(-offs, offs);
		let zOffs = MathBD.rndNumbGen(-offs, offs);
		
		let scale = 10;
		
		let x = Math.cos(this.lightAngle) * scale + xOffs;
		let y = Math.sin(this.lightAngle) * scale + yOffs;
		let z = Math.cos(this.lightAngle) * scale + zOffs;
		
		this.lightPos = [x,y,z];
		
		this.lightAngle = (this.lightAngle + dt * 0.001) % (2 * Math.PI);*/
	}
	
	
	repaintGameHelper(){
		
		this.finishedRendering = false;
		
		let gl = this.gl;
		
		let triOffs = 0.5;
		var positions = [
		   	-triOffs, -triOffs, 0.0,
		   	 triOffs, -triOffs, 0.0,
		     0.0,  triOffs, 0.0
	  	];
		  	
		// Tell WebGL how to convert from clip space to pixels
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
		
		gl.enable(gl.DEPTH_TEST);
		gl.clearColor(0,0,0, 1);
		gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
		  	
		this.genView();
		this.genProjection();
	  
		let glMeta = this.getGlMeta();
		
		this.background.paint(glMeta);
  		
		this.ballin.paintGame(glMeta);
		
		let ligthTrns = genTransformationInfo();
		ligthTrns.translate = this.lightPos.slice();
		ligthTrns.scale = [1.0,1.0,1.0];
		this.lightSource.transformationData = ligthTrns;
//		let lightSource = new LightSource(glMeta, ligthTrns);
		this.lightSource.paint(glMeta);
		
/*		let cubeTrns = genTransformationInfo();
		cubeTrns.scale = [6.0,3.0,3.0];
		let cube = new Cube(glMeta, cubeTrns);
		cube.paint(glMeta);*/
  		
//		this.instncdTriangles.paint(glMeta);
		
/*	  	let cube = new Cube(glMeta);
	  	cube.paint(glMeta);*/
	  	
	  	this.finishedRendering = true;
	}
};



export {BallinHelper};