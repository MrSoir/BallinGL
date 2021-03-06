import './gl-matrix.js';
import {m4,v4, v3, v2, MathBD, genTransformationInfo} from "./MathBD.js";

import {Ball} from './Ball.js';
import {Court} from './Court.js';
import {Magnet} from "./Magnet.js";
import {Triangle} from "./Triangle.js";

class Ballin{
	constructor(glMeta){
		this.zVal = 0;
		
		this.courtSize = {width: 30, height: 30, depth: 5};
		this.gameCenter = [0,0,0];
		
		this.magnet = new Magnet(glMeta, this.gameCenter, this.courtSize.width*0.77);
		this.magnetAngleIncrement = 5;
		
		this.level = 0;
		this.levelCycles = 4;
		this.maxLevel = 50;
		
		this.court = new Court(glMeta, this.gameCenter, this.courtSize);
		this.court.setLevel(this.level);
		
		this.setSpeed(18, 0);
		
		this.rigidObstacles = true;
		
		this.loadLevel();
	}
	
/*	setParticleFactor(fctr){
		Ball.particleFctr = fctr;
	}
	getParticleFactor(){return Ball.particleFctr;}*/
	
	setSpeed(maxSpeed, minSpeed = 0){
		this.maxSpeed = maxSpeed;
		this.minSpeed = minSpeed;
		
		this.minObstclSpeed = this.maxSpeed;
		this.minObstclSpeed = 3;
	}
	
	nextLevel(){
		this.level = (this.level + 1) % this.maxLevel;
		this.loadLevel();
	}
	setLevel(level){
		this.level = level;
		this.loadLevel();
	}
	
	loadLevel(){
		this.court.setLevel(this.level);
		this.initBalls();
		
		if( !!this.levelUpdater )
			this.levelUpdater(this.level);
	}
	setLevelUpdater(levelUpdater){
		this.levelUpdater = levelUpdater;
	}
	
	getGateCount(){
		return Math.min(this.level+1, 4);
	}
	
	// dafuer sorgen, dass max 3 baelle im gate sind, damit es nicht verstopft wird:
	tidyUpInfrontOfGates(){
		let maxBallsInGoal = 2;
		
		let gateIds = [];
		for(let i=0; i < this.court.getGateCount(); ++i){
			gateIds.push( [] );
		}
		
		for(let i=0; i < this.gameBalls.length; ++i){
			if(this.gameBalls[i].isInGate)
				gateIds[this.gameBalls[i].gateId].push( this.gameBalls[i].ballId );
		}

		for(let i=0; i < gateIds.length; ++i){
			while(gateIds[i].length > maxBallsInGoal){
				let ballIdToDelete = gateIds[i][gateIds[i].length-1];
				this.murderGameBall(ballIdToDelete);
				gateIds[i].splice(gateIds[i].length-1, 1);
			}
		}
	}
	murderGameBall(ballId){
		for(let i=0; i < this.gameBalls.length; ++i){
			if(this.gameBalls[i].ballId === ballId){
				this.gameBalls[i].murder();
				this.murderedBalls.push(this.gameBalls[i]);
				return;
			}
		}
	}
	removeGameBall(ballId){
		for(let i=0; i < this.gameBalls.length; ++i){
			if(this.gameBalls[i].ballId === ballId){
				this.gameBalls.splice(i,1);
				return;
			}
		}
	}
	revalidateAllBalls(){
		this.allBalls = [];
		this.allBalls.push.apply(this.allBalls, this.magnetBalls);
		this.allBalls.push.apply(this.allBalls, this.gameBalls);
		this.allBalls.push.apply(this.allBalls, this.obstacles);
	}
	
	deathwatch(dt){
		let newDeadBalls = false;
		for(let i=0; i < this.murderedBalls.length; ){
			let mb = this.murderedBalls[i];
			mb.killABitMore(dt);
			if(mb.isDead){
				newDeadBalls = true;
				this.removeGameBall(mb.ballId);
				this.murderedBalls.splice(i,1);
			}else{
				++i;
			}
		}
		if(newDeadBalls)
			this.revalidateAllBalls();
	}
	
	initBalls(){
		let maxMagnetBalls = 8;
		let magnetBallsCnt = Math.min( Math.floor((this.level / this.levelCycles) + 1) , maxMagnetBalls);
		
		let gameBallsCnt = this.level + 1;
		
		this.magnetBalls = this.generateBalls(magnetBallsCnt, [1, 0, 0, 1]);
		this.gameBalls 	 = this.generateBalls(gameBallsCnt);
		for(let i=0; i < this.gameBalls.length; ++i){
			this.gameBalls[i].ballId = i;
			this.gameBalls[i].mass *= 3;
		}
		
		this.murderedBalls = [];
		
		let gateCount = this.getGateCount();
		for(let i=0; i < this.gameBalls.length; ++i){
			let gateId = i % gateCount;
			this.gameBalls[i].gateId = gateId;
			this.gameBalls[i].color  = this.court.getGateColor(gateId);
		}
		
		this.genObstacles();
		this.genGateObstacles();
		
		this.revalidateAllBalls();
	}
	
	genGateObstacles(){
		let gates = this.court.getGates();
		for(let i=0; i < gates.length; ++i){
			let gateBalls = this.genObstaclesForGate(gates[i]);
			this.obstacles.push(gateBalls[0], gateBalls[1]);
		}
	}
	
	genObstaclesForGate(gate){
		let minX = gate[0];
		let maxX = gate[1];
		let minY = gate[2];
		let maxY = gate[3];
		
		let rad = this.court.borderWidth * 1.5;
		let rad2 = rad * 0.5;
		let mass = Infinity;
		let col = [1,1,1];
		
		let centX1, centX2, centY1, centY2;
		
		if(Math.abs(maxX-minX) > Math.abs(maxY-minY)){
			centX1 = minX - rad2;
			centX2 = maxX + rad2;
			centY1 = minY + (maxY-minY) * 0.5;
			centY2 = centY1;
		}else{
			centY1 = minY - rad2;
			centY2 = maxY + rad2;
			centX1 = minX + (maxX - minX) * 0.5;
			centX2 = centX1;
		}
		
		return [
			new Ball(rad, mass, col, [centX1, centY1, 0]),
			new Ball(rad, mass, col, [centX2, centY2, 0]),
		];
	}
	
	genObstacles(){		
		let obsCnt = Math.min( Math.floor(this.level / this.levelCycles), 4 );
		
		this.obstRadius = 2.0;
		
		this.obstacles = this.generateBalls(obsCnt);
		
		for(let i=0; i < obsCnt; ++i){
			let obstcl = this.obstacles[i];
			obstcl.radius = this.obstRadius;
			obstcl.mass = Infinity;
			obstcl.vel = [0,0,0];
			obstcl.color = [0.3, 1.0, 1.0, 1.0];
		}
		this.setObstaclePositions();
	}
	setObstaclePositions(){
		for(let i=0; i < this.obstacles.length; ++i){
			this.setObstaclePosition(i);
		}
	}
	setObstaclePosition(id){
		let cs = this.courtSize;
		let gc = this.gameCenter;
		
		let lvl = Math.min( Math.floor(this.level / this.levelCycles), 4);
		
		let obs = this.obstacles[id];
		
		let offsFctr = 0.4;
		
		let w2 = cs.width  * 0.5 * offsFctr;
		let h2 = cs.height * 0.5 * offsFctr;
		
		switch(id){
			case 0:
				switch (lvl){
					case 1:
						obs.center = gc.slice();
						break;
					case 2:
						obs.center = [gc[0] + w2, gc[1], gc[2]];
						break;
					case 3:
						obs.center = [gc[0], gc[1] + h2, gc[2]];
						break;
					case 4:
						obs.center = [gc[0] + w2, gc[1] + h2, gc[2]];
						break;
				}
				break;
			case 1:
				switch (lvl){
					case 2:
						obs.center = [gc[0] - w2, gc[1], gc[2]];
						break;
					case 3:
						obs.center = [gc[0] - w2, gc[1] - h2, gc[2]];
						break;
					case 4:
						obs.center = [gc[0] - w2, gc[1] - h2, gc[2]];
						break;
				}
				break;
			case 2:
				switch (lvl){
					case 3:
						obs.center = [gc[0] + w2, gc[1] - h2, gc[2]];
						break;
					case 4:
						obs.center = [gc[0] + w2, gc[1] - h2, gc[2]];
						break;
				}
				break;
			case 3:
				obs.center = [gc[0] - w2, gc[1] + h2, gc[2]];
				break;
		}
	}
	
	moveMagnetRight(){
		this.magnet.increaseAngle(this.magnetAngleIncrement);
	}
	moveMagnetLeft(){
		this.magnet.decreaseAngle(this.magnetAngleIncrement);
	}
	
	setMousePos(pos, canvasBounds){
		this.magnet.setMousePos(pos, canvasBounds);
	}
	setRelMousePos(dx, dy){
		this.magnet.setRelMousePos(dx, dy);
	}
	
	getMinMax(){
		let minX = this.gameCenter[0] - (this.courtSize.width  * 0.5);
		let minY = this.gameCenter[1] - (this.courtSize.height * 0.5);
		let minZ = this.gameCenter[2] - (this.courtSize.depth  * 0.5);
		return {
			minX,
			maxX: minX + this.courtSize.width,
			minY,
			maxY: minY + this.courtSize.height,
			minZ,
			maxZ: minZ + this.courtSize.depth,
		};
	}
	
	generateBalls(ballCount, color = [0, 0, 1, 1], radius = 1, mass = 10){
		let balls = [];
		let paddingX = this.courtSize.width  * 0.05;
		let paddingY = this.courtSize.height * 0.05;
		for(let i=0; i < ballCount; ++i){
			let minMax = this.getMinMax();
			minMax.minX + radius + paddingX;
			minMax.maxX - radius - paddingX;
			minMax.minY + radius + paddingY;
			minMax.maxY - radius - paddingY;
			let pos = [MathBD.rndNumbGen(minMax.minX, minMax.maxX), 
				   	   MathBD.rndNumbGen(minMax.minY, minMax.maxY),
				   	   this.zVal];
				   
			let minVel = 1;
			let vel = [MathBD.rndNumbGen(-minVel, minVel),
				   	   MathBD.rndNumbGen(-minVel, minVel),
				   	   0];//MathBD.rndNumbGen(-minVel, minVel)];
				   
			let b = new Ball(radius, mass, color, pos, vel);
			balls.push( b );
		}
		return balls;
	}
	
	nextRound(dt){
		dt *= 0.1;
		
		if(this.allGameBallsInGates){
			document.getElementById('UserInfo').style.opacity = '1';
			setTimeout(()=>{
				document.getElementById('UserInfo').style.opacity = '0';
			}, 2000);
			this.allGameBallsInGates = false;
			this.nextLevel();
		}

		// checkIfBallIsInsideCourtAndCorrectIfNot muss leider in einer lambda uebergeben werden, denn 
		// wenn nur this.court.checkIfBallIsInsideCourtAndCorrectIfNot uebergeben und dann auferufen wird,
		// ruft javascript die methode auf die Klasse auf, sprich statisch, und nicht auf das object this.magnet.
		// Die Folge: innerhalb von this.magnet.checkIfBallIsInsideCourtAndCorrectIfNot gilt: this===undefined:
		for(let i=0; i < this.magnetBalls.length; ++i){
			this.magnetBalls[i].move(dt, this.maxSpeed, this.minSpeed,
								  	 (ball)=>{this.court.checkIfBallIsInsideCourtAndCorrectIfNot(ball);},
								  	 this.magnet.getAngle(), this.magnet.force);
		}
		
		let allGameBallsInGates = true;
		for(let i=0; i < this.gameBalls.length; ++i){
			let gb = this.gameBalls[i];
			if( !gb.isInGate ){
				let checkedBounds = false;
				gb.move(dt, this.maxSpeed, this.minSpeed,
									   (ball)=>{
									   		checkedBounds = this.court.checkIfBallIsInsideCourtAndCorrectIfNot(ball);
									   });
				let isInGate = this.court.checkIfIsInGate( gb );
				if(isInGate && gb.touchCount > 0){
					gb.Goooal();
				}else if(checkedBounds && gb.isTouched){
			   		gb.decrementTouchCount();
			   	}
			   	
			   	if( !gb.isInGate ){
			   		allGameBallsInGates = false;
			   	}
			}else if (gb.stillParticlesLeft()){
				gb.moveParticles(dt);
			}
		}
		this.allGameBallsInGates = allGameBallsInGates;
		
		if( !this.rigidObstacles ){
			for(let i=0; i < this.obstacles.length; ++i){
				this.obstacles[i].move(dt, this.maxObstclSpeed, this.minObstclSpeed,
									   (ball)=>{this.court.checkIfBallIsInsideCourtAndCorrectIfNot(ball, 0.65);});
			}
		}
		for(let i=0; i < this.obstacles.length; ++i){
			for(let j=0; j < this.magnetBalls.length; ++j){
				this.obstacles[i].calcCollission(this.magnetBalls[j]);
			}
			for(let j=0; j < this.gameBalls.length; ++j){
				this.obstacles[i].calcCollission(this.gameBalls[j]);
			}
			for(let j=i+1; j < this.obstacles.length; ++j){
				this.obstacles[i].mass = 1;
				this.obstacles[j].mass = 1;
				this.obstacles[i].calcCollission(this.obstacles[j]);
				this.obstacles[i].mass = Infinity;
				this.obstacles[j].mass = Infinity;
			}
		}
		for(let i=0; i < this.magnetBalls.length; ++i){
			for(let j=0; j < this.gameBalls.length; ++j){
				let collided = this.magnetBalls[i].calcCollission(this.gameBalls[j]);
				if(collided){
					this.gameBalls[j].gotTouched();
				}
			}
			for(let j=i+1; j < this.magnetBalls.length; ++j){
				this.magnetBalls[i].calcCollission(this.magnetBalls[j]);
			}
		}
		
		for(let i=0; i < this.gameBalls.length; ++i){
			for(let j=i+1; j < this.gameBalls.length; ++j){
				this.gameBalls[i].calcCollission(this.gameBalls[j]);
			}
		}
		
		this.tidyUpInfrontOfGates();
		this.deathwatch(dt);
	}
	
	paintGame(glMeta){	
		this.court.paint(glMeta);
		
		this.magnet.paint(glMeta);
		
		this.paintBalls(glMeta);
	}
	
	paintBalls(glMeta){
		Ball.paintBalls(glMeta, this.allBalls);//, glMeta.gl.LINE_LOOP);
		this.paintParticles(glMeta);
	}
	
	paintParticles(glMeta){
		let triangles = []
		
		for(let i=0; i < this.gameBalls.length; ++i){
			
			let curPartcls = this.gameBalls[i].getParticles();
			
			for(let j=0; j < curPartcls.length; ++j){
				let p = curPartcls[j];
				
				let transformation = MathBD.genTransformationInfo();
				transformation.translate = p.pos;
				transformation.scale 	= [p.radius, p.radius, p.radius];
				
				let color = p.color;
				
				triangles.push( {transformation, color,} );
			}
		}
		
		Triangle.paintTriangles(glMeta, triangles);
	}
}

export{Ballin};