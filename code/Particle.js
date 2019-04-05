import '/code/gl-matrix.js';
import {m4,v4, v3, v2, MathBD, genTransformationInfo} from "/code/MathBD.js";

import {GL_Shape} from "/code/GL_Shape.js";

class Particle{
	constructor(pos, vel, color, maturity =  MathBD.rndNumbGen(50, 200)){
		this.pos = pos;
		this.vel = vel;
		
		this.initColor = color.slice();
		this.color = color;
		
		this.initMaturity = maturity;
		this.maturity = maturity;
		
		this.dead = false;
		
		this.radius = 0.1;
		
		this.cntr = 0;
	}
	move(dt){
		let speedSnsvty = 0.001;

		if(this.dead)
			return;
		
		this.pos = v3.add(this.pos, v3.mul(this.vel, dt*speedSnsvty));
		this.maturity -= dt;
		
		this.color = v4.mul(this.initColor, this.maturity / this.initMaturity);
		
		if(this.maturity <= 0 || this.isTooDark()){
			this.dead = true;
		}
	}
	isTooDark(){
		let limit = 0.1;
		return this.color[0] < limit &&
			   this.color[1] < limit &&
			   this.color[2] < limit;
	}
	getPos(){return this.pos.slice()}
	isDead(){return this.dead;}
}

export {Particle};
