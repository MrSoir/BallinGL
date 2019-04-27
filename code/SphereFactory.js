import {MathBD, m4, v4,v3, genTransformationInfo} from './MathBD.js';
import {Polygon} from './Polygon.js';
import {bindDataToBuffer} from './BufferCreator.js';

class SphereFactory{
	constructor(radius = 1, m = 20, n = 20){
		this.radius = radius;
		this.m = m;
		this.n = n;
		
//		console.log('radius: ', radius, 'm: ', m, 'n: ', n);
		
		this.polygons = [];
		this.vecs = [];
		this.polygonVertices = [];
		this.polygonVerticesWithNormals = [];
		
		this.initSphere();
	}
	
	getVertices(){
		return this.polygonVertices.slice();
	}
	getNormalVertices(){
		return this.polygonVerticesWithNormals.slice();
	}
	
	initSphere(){
		this.initVecs();
		this.initPolygons();
		
		for(let i=0; i < this.polygons.length; ++i){
			this.polygons[i].appendToArray( this.polygonVertices );
		}
		
		let center = [0,0,0];
		for(let i=0; i < this.polygonVertices.length; i+=3){
			let vertex = [this.polygonVertices[i], this.polygonVertices[i+1], this.polygonVertices[i+2]];
			let normal = this.getNormal(vertex, center);
			this.polygonVerticesWithNormals.push(vertex[0], vertex[1], vertex[2],
												 normal[0], normal[1], normal[2]);
		}
	}
	getNormal(vertex, center){
		return v3.sub(vertex, center);
	}
	
	initVecs(){
		let radius = this.radius;
		let m      = this.m;
		let n 	   = this.n;
		
		let heightAngle = 90.0 / m;
		
		for(let i=0; i < m-1; ++i){
			let curRow = [];
			
			let y = Math.sin(MathBD.toRadians(heightAngle * i)) * radius;
			let angleDeg = MathBD.toDegrees(Math.asin(y/radius));
		   let latitudeRadius = Math.cos(MathBD.toRadians(angleDeg)) * radius;
			
		   let sliceAngle = 360.0 / n;
		   
			for(let j=0; j < n; ++j){
		      let curSliceAngle = sliceAngle * j;
		      let x = this.getX(curSliceAngle, latitudeRadius);
		      let z = this.getZ(curSliceAngle, latitudeRadius);
		             
		      let vec = [x, y, z];

		   	  curRow.push(vec);
		   }
		   this.vecs.push(curRow);
		}
		
	   let pole = [0.0, radius, 0.0];
	   let poleVecs = [];
	   for(let i=0; i < n; ++i)
	   		poleVecs.push(pole);
	   this.vecs.push(poleVecs);
	}
	
	initPolygons(){
		let cntr = 0;
	  
		for(let a=0; a < 2; ++a){    
		   	for(let i=0; i < this.vecs.length-1; ++i){
		      	let rowSuccessor = i+1;
		      
		      	for(let j=0; j < this.vecs[i].length; ++j){
	        		let colSuccessor = j==this.vecs[i].length-1 ? 0 : j+1;
	        
	        		let vec1 = this.vecs[i][j].slice();
	        		let vec2 = this.vecs[i][colSuccessor].slice();
	        		
	        		let vec3 = this.vecs[rowSuccessor][j].slice();
	        		let vec4 = this.vecs[rowSuccessor][colSuccessor].slice();
	        		
	        		let poly1, poly2;
	        		
	        		if(a == 0){
	        			// untere kugelhaelfte:
		          		vec1 = this.flipVectorY(vec1);
		          		vec2 = this.flipVectorY(vec2);
		          		vec3 = this.flipVectorY(vec3);
		          		vec4 = this.flipVectorY(vec4);
		          		
		          		poly1 = new Polygon(vec1, vec4, vec2);
	        			poly2 = new Polygon(vec1, vec3, vec4);
	        		}else{
	        			// obere kugelhaelfte:
	        			poly1 = new Polygon(vec1, vec2, vec4);
	        			poly2 = new Polygon(vec1, vec4, vec3);
	        		}
	       		 
	        		this.polygons.push( poly1 );
	        		this.polygons.push( poly2 );
		      	}	
	    	}
	  	}
	  	
	}
	
	flipVectorY(vec)
	{
	  return [vec[0],
	          vec[1] * -1.0,
	          vec[2]];
	}
	
	getX(angle, latitudeRadius)
	{
	  let x = Math.sin(MathBD.toRadians(angle)) * latitudeRadius;
	  return x;
	}
	getZ(angle, latitudeRadius)
	{
	  let z = Math.cos(MathBD.toRadians(angle)) * latitudeRadius;
	  return z;
	}
}

export {SphereFactory};