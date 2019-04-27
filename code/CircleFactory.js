import {MathBD, m4, v4, v3} from './MathBD.js';
import {Polygon} from './Polygon.js';

class CircleFactory{
	constructor(radius=1, steps=20, normal = [0,0,-1]){
		this.radius = radius;
		this.steps = steps;
		
		this.polygons = [];
		
		this.vecs = [];
		this.vecsWithNormals = [];
		
		this.normal = normal;
		
		this.genPolygons();
	}
	getVertices(){
		return this.vecs.slice();
	}
	getVerticesWithNormals(){
		return this.vecsWithNormals.slice();
	}
	genPolygons(){
		let lastVec = [1,0,0];
  		let stepSize = (360.0 / this.steps);
  		let zeroVec = [0,0,0];
  		
  		let radius = this.radius;
  		
		for(let a=0; a <= this.steps; ++a){
    		let radians = MathBD.toRadians(a * stepSize);
    		let curVec  = [ Math.cos(radians) * radius, 
    						Math.sin(radians) * radius, 
    						0 ];
    		
    		radians += 0.01;
    		let curVec_offs = [ Math.cos(radians) * radius,
    							Math.sin(radians) * radius, 
    							0 ];
    							 
    		this.polygons.push( new Polygon(lastVec, curVec_offs, zeroVec) );
    		
   			lastVec = curVec;
  		}
  		
  		for(let i=0; i < this.polygons.length; ++i){
			this.polygons[i].appendToArray( this.vecs );
		}

		let normal = this.normal;
		for(let i=0; i < this.vecs.length; i+=3){
			let vertex = [this.vecs[i], this.vecs[i+1], this.vecs[i+2]];

			this.vecsWithNormals.push(vertex[0], vertex[1], vertex[2],
									  normal[0], normal[1], normal[2]);
		}
		
		// zum schauen, wieviele vertices das ding produziert (fuer performance-aspekte):
/*		console.log('vecs.length: ', this.vecs.length);
		console.log('vecsWithNormals.length: ', this.vecsWithNormals.length);*/
	}
}

export { CircleFactory };

