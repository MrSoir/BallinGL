import './gl-matrix.js';
import {m4,v4, v3, v2, MathBD, genTransformationInfo} from "./MathBD.js";
import {Sphere} from './Sphere.js';
import {Particle} from './Particle.js';

class Ball{
	constructor(radius = 1.0, mass = 10, color = [1,0,0,1], center = [0,0,0], vel = [1,0,0], gateId = 0, ballId = 0){
   		this.center = center;
    	this.vel = vel;
    	
    	this.radius = radius; // wird fuer scaleX, scaleY, scaleZ verwendet, logisch...
    	this.mass = mass;
    	
    	this.color = color;
    	
    	this.ballId = ballId;
    	
    	this.rotate = [0,0,0];
    	
    	this.gateId = gateId;
    	this.isInGate = false;
    	
    	this.particles = [];
    	this.isTouched = false;
    	this.touchCount = 0;
    	this.maxBorderHits = 3;
    	
    	this.isDead = false;
    	this.murdered = false;
    	
    	Ball.particleFctr = 1;
	}
	
	gotMurdered(){return this.murdered;}
	murder(){
		this.gotMurdered = true;
		this.timeTillDead = 1000;
		this.timeSinceMurder = 0;
		this.deadInitColor = this.color.slice();
	}
	
	killABitMore(dt){
		if(this.isDead)
			return;
		
		this.timeSinceMurder += dt;
		if(this.timeSinceMurder >= this.timeTillDead){
			this.isDead = true;
		}else{
			let murderProgress = this.timeSinceMurder/this.timeTillDead;
			let r = this.deadInitColor[0] * (1 - murderProgress);
			let g = this.deadInitColor[1] * (1 - murderProgress);
			let b = this.deadInitColor[2] * (1 - murderProgress);
			let a = this.deadInitColor[3] !== undefined ? this.deadInitColor[3] : 1.0;
			a *= (1 - murderProgress);
			this.color = [r,g,b, a];
		}
	}
	
	gotTouched(){
		this.isTouched  = true;
		this.touchCount = this.maxBorderHits;
	}
	decrementTouchCount(){
		--this.touchCount;
		if(this.touchCount === 0)
			this.isTouched = false;
	}
	
	paint(glMeta){
	  	let sphere = new Sphere(glMeta, this.getTransformationData(), this.color);
	  	sphere.lightningMeta.ambientFctr = 0.5;
	  	sphere.paint(glMeta);
	}
	stillParticlesLeft(){
		return this.particles.length > 0;
	}
	moveParticles(dt){
		let i=0;
		while(i < this.particles.length){
			this.particles[i].move(dt);
			if(this.particles[i].isDead()){
				this.particles.splice(i, 1);
			}else{
				++i;
			}
		}
	}
	getParticles(){
		return this.particles;
	}
	
	genNewParticles(dt){
		let partCnt = dt * Ball.particleFctr;

		for(let i=0; i < partCnt; ++i){
			this.particles.push( this.genParticle() );
		}
	}
	
	
	genParticle(){
		let [minSpeed, maxSpeed] = [-20, 20];
		let vel = [MathBD.rndNumbGen(minSpeed, maxSpeed), MathBD.rndNumbGen(minSpeed, maxSpeed), MathBD.rndNumbGen(minSpeed, maxSpeed)];
		let part = new Particle(this.center.slice(), vel, this.color.slice());
		return part;
	}
	
	Goooal(){
		this.isInGate = true;
		this.vel 	  = [0,0,0];
		this.mass 	  = Infinity;
		let goalColFctr = 0.6;
		this.color = [this.color[0] * goalColFctr,
					  this.color[1] * goalColFctr,
					  this.color[2] * goalColFctr,
					  this.color[3]];
	}
	
	setRotation(dt){
		let offs = 0.1 * dt;
		let max = Math.PI * 2;
		let rotateX = (this.rotate[0] + offs) % max;
		let rotateY = (this.rotate[1] + offs) % max;
		this.rotate = [rotateX, rotateY, 0];
	}
	
	getMinMax(){
		let minX = this.center[0]-this.radius;
		let maxX = minX + 2*this.radius;
		
		let minY = this.center[1]-this.radius;
		let maxY = minY + 2*this.radius;
		
		let minZ = this.center[2] - this.radius;
		let maxZ = minZ + 2*this.radius;
		return {minX, maxX,
				minY, maxY,
				minZ, maxZ};
	}
	getCenter(){
		return this.center.slice();
	}
	setCenter(center){
		if(this.isInGate)
			return;
		this.center = center.slice();
	}
	getVelocity(){
		if(this.isInGate)
			return;
		return this.vel.slice();
	}
	setVelocity(vel){
		this.vel = vel.slice();
	}
	
	isColliding(b){
		let sub = v3.sub(this.center, b.center); // kann negativen vekotr ergeben -> ist aber egal, da lengthSQRD berechnet wird
		let distSqrd = v3.lengthSqrd(sub);
		let radiusseSqrd = (this.radius+b.radius) * (this.radius+b.radius);
		return distSqrd <= radiusseSqrd;
	}
	
	ia(arr){
		for(let i=0; i < arr.length; ++i){
			if(arr[i] === 0 || isNaN(arr[i]))
				return true;
		}
		return false;
	}
	calcCollission(b){				
		// 3D-Kollissionsberechnungen (wesentlich komplexer als 2D und damit langsamer):
/*		let collission = this.isColliding(b);
		if( !collission )
			return false;
		let m1 = this.mass;
		let m2 = b.mass;
		
		let v1 = this.vel;
		let v2 = b.vel;
		let x1 = this.center;
		let x2 = b.center;
		
		let x1_x2 = v3.sub(x1, x2);
		let x2_x1 = v3.sub(x2, x1); // == x1_x2 * -1
		
		let v1_v2 = v3.sub(v1, v2);
		let v2_v1 = v3.sub(v2, v1); // == v1_v2 * -1
		
		let x1_x2_length = v3.length(x1_x2);
		let x2_x1_length = v3.length(x2_x1);
		
		let a_vel_new = v3.sub(v1, (v3.mul(x1_x2, (2*m2/(m1+m2)) * v3.dot(v1_v2, x1_x2) / (x1_x2_length * x1_x2_length))));
		let b_vel_new = v3.sub(v2, (v3.mul(x2_x1, (2*m1/(m1+m2)) * v3.dot(v2_v1, x2_x1) / (x2_x1_length * x2_x1_length))));
		
		this.vel = a_vel_new;
		b.vel    = b_vel_new;*/
		
		
		return v2.calcCollision(this, b);
		
		
		
		/*// 2D-Kollissionsberechnungen:
		
		let sub = v3.sub(this.center, b.center); // kann negativen vekotr ergeben -> ist aber egal, da lengthSQRD berechnet wird
		let distSqrd = v3.lengthSqrd(sub);
		let radiiSqrd = (this.radius+b.radius) * (this.radius+b.radius);
		
		if(distSqrd > radiiSqrd)
			return false;
		
		let tcenter2D = [this.center[0], this.center[1]];
		let bcenter2D = [   b.center[0],    b.center[1]];
		
		let tvel2D = [this.vel[0], this.vel[1]];
		let bvel2D = [   b.vel[0],    b.vel[1]];
		
		let radius1 = this.radius;
		let radius2 =    b.radius;
		
		let delta = v2.sub(tcenter2D, bcenter2D); // kann negativen vekotr ergeben -> ist aber egal, da lengthSQRD berechnet wird
		let d = v2.length(delta);
		
		if(d === 0){
			return false;
		}

	    let mtd = v2.mul(delta, ((radius1 + radius2)-d)/d); 
	    
	    let im1 = 1.0 / this.mass; 
	    let im2 = 1.0 / b.mass;
	    
	    let im1_im2 = im1 + im2;
	    
	    if(im1_im2 === 0){
	    	im1_im2 = 0.001;
	    }
	    
	    tcenter2D = v2.add(tcenter2D, v2.mul(mtd, im1 / im1_im2));
	    bcenter2D = v2.sub(bcenter2D, v2.mul(mtd, im2 / im1_im2));
	    
	    let v  = v2.sub(tvel2D, bvel2D);
	    let vn = v2.dot(v, v2.normalize(mtd));
	    
	    if (vn > 0)
	    	return false;
	    
	    let restitution = 0;
	    let i = (-(1 + restitution) * vn) / im1_im2;
	    let impulse = v2.mul(mtd, i);
	    
	    tvel2D = v2.add(tvel2D, v2.mul(impulse, im1));
	    bvel2D = v2.sub(bvel2D, v2.mul(impulse, im2));
	    
	    this.setCenter([tcenter2D[0], tcenter2D[1], this.center[2]]);
	    b.setCenter([bcenter2D[0], bcenter2D[1],    b.center[2]]);
	    
	    this.setVelocity([tvel2D[0], tvel2D[1], this.vel[2]]);
	    b.setVelocity([bvel2D[0], bvel2D[1],    b.vel[2]]);
		
		return true;*/
	}
	
	setTargetSpeed(targetSpeed){
		if(this.vel[1] === 0){ // wuedre zu 0-division fuehren:
			let multplctr = this.vel[0] >= 0 ? 1 : -1
			this.vel = [multplctr * targetSpeed, 0, this.vel[2]]; // ball bewegt sich jetzt horizontal in x-richtung (ob negativ oder positiv haengt von der bisherigen vel ab)
			return;
		}else if (this.vel[0] === 0){ // ist nicht zwingend notwendig, aber schneller
			let multplctr = this.vel[1] >= 0 ? 1 : -1;
			this.vel = [0, multplctr * targetSpeed, this.vel[2]];
			return;
		}
		// vel so setzen, dass this.vel.length === targetSpeed ergibt und dabei als
		// nebenbedingung das verhaeltnis vel.x / vel.y bewahren:
		let velRatio = this.vel[0] / this.vel[1];
		let tarY = Math.sqrt((targetSpeed*targetSpeed) / ((velRatio*velRatio) + 1));
		tarY *= MathBD.vorz(this.vel[1]); // beim quadrieren geht das vorzeichen verloren. das muss wiederhergestellt werden!
		let tarX = velRatio * tarY;

		this.vel = [tarX, tarY, this.vel[2]];
	}
	
	move(dt, maxSpeed, minSpeed,
		 courtBoundaryCheck,
		 magnetAngle=0, magnetForce=0){ // dt == elapsed time since last movement
		 
		 if(this.isInGate)
		 	return;
		 	
		 if( this.stillParticlesLeft() ){
		 	this.moveParticles(dt);
		 }
		 if( this.isTouched ){
			this.genNewParticles(dt);
			this.setRotation(dt);
		 }
		
		let moveSnsvty = 0.01;
		let oldCenter = this.center;
		let vel    = this.vel;
		
		if(magnetForce > 0){
			let cos = Math.cos(MathBD.toRadians(magnetAngle));
			let sin = Math.sin(MathBD.toRadians(magnetAngle));
			let velForce = [magnetForce * Math.cos(MathBD.toRadians(magnetAngle)),
						    magnetForce * Math.sin(MathBD.toRadians(magnetAngle))];	
			vel[0] += velForce[0];
			vel[1] += velForce[1];
		}
		
		// erstmal schauen, ob die derzeitige geschwindigkeit zu groß oder zu klein ist:
		let curSpeedSqrd = v3.lengthSqrd(vel);
		let maxSpeedSqrd = maxSpeed * maxSpeed;
		let minSpeedSqrd = minSpeed * minSpeed;
		
		if(curSpeedSqrd > maxSpeedSqrd){
			this.setTargetSpeed(maxSpeed);
		}else if (curSpeedSqrd < minSpeedSqrd){
			this.setTargetSpeed(minSpeed);
		}
		
		// jetzt die eigentliche bewegung:
		let newCenter = v3.add(oldCenter, v3.mul(vel, dt*moveSnsvty));
		this.center = newCenter;
		
		// die spielfeldgrenze soll selbst checken, ob der ball ausserhalb des feldes ist und ihn ggfs. wieder
		// hoeflich zurueckbitten:
		if( !!courtBoundaryCheck ){
			courtBoundaryCheck(this);
		}
	}
	
	getTransformationData(){
		let trnsformation = MathBD.genTransformationInfo();
		trnsformation.translate = this.center;
		trnsformation.scale 	= [this.radius, this.radius, this.radius];
		trnsformation.rotate	= this.rotate;
		return trnsformation;
	}
}

Ball.paintBalls = function(glMeta, balls, drawStyle){ // drawStyle: gl.TRIANGLES oder gl.LINE_LOOP etc.
	
	if(balls.length == 0){
		console.log('Ball.paintBallS: nothing to paint...');
		return;
	}
	
	if( drawStyle === undefined )
		drawStyle = glMeta.gl.TRIANGLES;
	
	let models = [];
	let colors = [];
	
	for(let i=0; i < balls.length; ++i){
		// 1. die transformationen zusammensuchen:
		let trnsfrm = balls[i].getTransformationData();
		let mdl = MathBD.genTransformationMatrix(trnsfrm);
		models.push.apply(models, mdl);//.push(mdl);
		
		// nun die BallFarben: hier sicherstellen, dass die farbe ein 4-elemente-Array ist -> im FragmentShader wird gefordert: '... vec4 objCol;':
		let col = balls[i].color.slice();
		if(col[3] === undefined || col[3] === null){
			col[3] = 1;
		}
		colors.push( col[0], col[1], col[2], col[3] );
	}
	if( Ball.instancingPrototype === undefined ){
		console.log('creating instanced Sphere');
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
			count: balls.length,
		};
			
		let sphere = new Sphere(glMeta, 
							/*transformationData:*/ undefined, 
							/*color:*/ undefined, 
							/*lightningMeta:*/ undefined,
							/*customUniforms:*/ undefined,
							/*instancingMeta:*/ instancingMeta);
		Ball.instancingPrototype = sphere;
	}else{
		Ball.instancingPrototype.resetInstancingData({attributes: [{name: 'iModel'		, data: models},
													  			   {name: 'aInstObjCol' , data: colors}],
													  count: balls.length});
	}
	
	Ball.instancingPrototype.DRAW_STYLE = drawStyle;
	Ball.instancingPrototype.paint(glMeta);
};

export {Ball};



