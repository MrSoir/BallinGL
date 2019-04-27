import './gl-matrix.js';

var MathBD = {
	toRadians: function(x){
	  return x * Math.PI / 180.0;
	},
	toDegrees: function(x){
	  return x * 180.0 / Math.PI;
	},
	
	vorz: function(x){
		return x >= 0 ? 1 : -1;
	},
	
	rndNumbGen: function(min, max){
		return min + (max-min)* Math.random();
	},
	
	generateRandomVector: function(min, max){
		return [MathBD.rndNumbGen(min,max),
				MathBD.rndNumbGen(min,max),
				MathBD.rndNumbGen(min,max)];
	},
	
	getTan: function(x,y){
		let tan;
			
		if(x === 0){
			if(y > 0){
				tan = 90;
			}else{
				tan = 270;
			}
		}else{
			tan = Math.atan( y / x );
		}
	
		// tan: 0° -> 90°:			0 -> Math.PI/2
		//			+90° -> 180°:	 -Math.PI/2 -> 0
		//			180° -> 270°:	 0 -> Math.PI/2
		//			270° -> 360°:	 -Math.PI/2 -> 0
		// um den tan zwischen 0 und 2*Math.PI zu bekommen (also zwischen 0° und 360°),
		// muessen fallunterscheidungen getroffen werden:
		let rad;
		if(tan > 0){
			if (y > 0){
				rad = tan;
			}else{
				rad = Math.PI + tan;
			}
		}else{
			if(y > 0){
				rad = Math.PI + tan;
			}else{
				rad = 2*Math.PI + tan;
			}
		}
		return rad % (Math.PI * 2.0); // wenn tan==0:y>0 und tan==-90:y<0 ist, ist rad==360.
	},
	getTanDegr: function(x,y){
		return MathBD.toDegrees(MathBD.getTan(x,y));
	},
	
	genTransformationInfo: function(){
		// OBACHT - nicht stolpern: folgender aufruf zu genTransformationMatrix zielt auf die hier GLOBAL in MathBD
		// definierte funktion ab!!!:
		return genTransformationInfo();
	},
	genTransformationMatrix: function(transformationData){
		// OBACHT - nicht stolpern: folgender aufruf zu genTransformationMatrix zielt auf die hier GLOBAL in MathBD
		// definierte funktion ab!!!:
		return genTransformationMatrix(transformationData);
	},
};

function genTransformationInfo(){
	return {
	  	rotate: [0,0,0],
	  	translate: [0,0,0],
	  	scale: [1,1,1],
	}
}

function genTransformationMatrix(transformationData){
	return m4.generateTransformationMatrix( transformationData );
}

var m4 = {
	mat: function(val = 1){
		return [val,   0,   0,   0,
				    0, val,   0,   0,
				    0,   0, val,   0,
				    0,   0,   0,   1];
	},
	transpose: function(mat){
		let trnspd = m4.mat();
		for(let i=0; i < 4; ++i){
			for(let j=0; j < 4; ++j){
				trnspd[j*4 + i] = mat[i*4 + j];
			}
		}	
		return trnspd;
	},
	perspective: function(fieldOfViewInRadians, near, far, aspect) {
    	var f = Math.tan(Math.PI * 0.5 - 0.5 * MathBD.toRadians(fieldOfViewInRadians));
    	var rangeInv = 1.0 / (near - far);

    	return [
     		f / aspect, 0, 0, 0,
      	0, f, 0, 0,
      	0, 0, (near + far) * rangeInv, -1,
      	0, 0, near * far * rangeInv * 2, 0,
    	];
  },
  projection: function(angle, near, far, aspectRatio){
  		let f  = 1.0 / Math.tan(MathBD.toRadians(angle)/2.0);
		let nf = 1.0 / (near-far);  	
		
		return [
       f / aspectRatio,            0,                 0,             0,
                     0,            f,                 0,             0,
                     0,            0,     (far+near)*nf,            -1,
                     0,            0,     2*far*near*nf,             0,
    	];	
  },

	mul: function(a,b){
		// wenn spaeter multiply endlich die argumenten-multiplikation vertauscht wird,
		// MUSS GETESTET WERDEN AUF b.length UND NICHT WIE JETZT NOCH a.length!!!!!!!
		if(b.length == 4){
			return this.multiplyVec(a,b);
		}else if (b.length == 16){
			return this.multiply(a,b);
		}else{
			throw 'in MathBD.m4.mul: matrix a multiplied with b: b.length === ' + b.length + '	-> dimension missmatch!!!';
		}
	},
	multiplyVec: function(mat, vec){
		let v0 = vec[0];
		let v1 = vec[1];
		let v2 = vec[2];
		let v3 = vec[3];
		return [mat[0 * 4 + 0] * v0 +
				  mat[0 * 4 + 1] * v1 +
				  mat[0 * 4 + 2] * v2 +
				  mat[0 * 4 + 3] * v3,
				  
				  mat[1 * 4 + 0] * v0 +
				  mat[1 * 4 + 1] * v1 +
				  mat[1 * 4 + 2] * v2 +
				  mat[1 * 4 + 3] * v3,
				  
				  mat[2 * 4 + 0] * v0 +
				  mat[2 * 4 + 1] * v1 +
				  mat[2 * 4 + 2] * v2 +
				  mat[2 * 4 + 3] * v3,
				  
				  mat[3 * 4 + 0] * v0 +
				  mat[3 * 4 + 1] * v1 +
				  mat[3 * 4 + 2] * v2 +
				  mat[3 * 4 + 3] * v3];
	},
   multiply: function(a, b) {
    var a00 = a[0 * 4 + 0];
    var a01 = a[0 * 4 + 1];
    var a02 = a[0 * 4 + 2];
    var a03 = a[0 * 4 + 3];
    var a10 = a[1 * 4 + 0];
    var a11 = a[1 * 4 + 1];
    var a12 = a[1 * 4 + 2];
    var a13 = a[1 * 4 + 3];
    var a20 = a[2 * 4 + 0];
    var a21 = a[2 * 4 + 1];
    var a22 = a[2 * 4 + 2];
    var a23 = a[2 * 4 + 3];
    var a30 = a[3 * 4 + 0];
    var a31 = a[3 * 4 + 1];
    var a32 = a[3 * 4 + 2];
    var a33 = a[3 * 4 + 3];
    
    var b00 = b[0 * 4 + 0];
    var b01 = b[0 * 4 + 1];
    var b02 = b[0 * 4 + 2];
    var b03 = b[0 * 4 + 3];
    var b10 = b[1 * 4 + 0];
    var b11 = b[1 * 4 + 1];
    var b12 = b[1 * 4 + 2];
    var b13 = b[1 * 4 + 3];
    var b20 = b[2 * 4 + 0];
    var b21 = b[2 * 4 + 1];
    var b22 = b[2 * 4 + 2];
    var b23 = b[2 * 4 + 3];
    var b30 = b[3 * 4 + 0];
    var b31 = b[3 * 4 + 1];
    var b32 = b[3 * 4 + 2];
    var b33 = b[3 * 4 + 3];
    return [
      a00 * b00 + a01 * b10 + a02 * b20 + a03 * b30,
      a00 * b01 + a01 * b11 + a02 * b21 + a03 * b31,
      a00 * b02 + a01 * b12 + a02 * b22 + a03 * b32,
      a00 * b03 + a01 * b13 + a02 * b23 + a03 * b33,
      a10 * b00 + a11 * b10 + a12 * b20 + a13 * b30,
      a10 * b01 + a11 * b11 + a12 * b21 + a13 * b31,
      a10 * b02 + a11 * b12 + a12 * b22 + a13 * b32,
      a10 * b03 + a11 * b13 + a12 * b23 + a13 * b33,
      a20 * b00 + a21 * b10 + a22 * b20 + a23 * b30,
      a20 * b01 + a21 * b11 + a22 * b21 + a23 * b31,
      a20 * b02 + a21 * b12 + a22 * b22 + a23 * b32,
      a20 * b03 + a21 * b13 + a22 * b23 + a23 * b33,
      a30 * b00 + a31 * b10 + a32 * b20 + a33 * b30,
      a30 * b01 + a31 * b11 + a32 * b21 + a33 * b31,
      a30 * b02 + a31 * b12 + a32 * b22 + a33 * b32,
      a30 * b03 + a31 * b13 + a32 * b23 + a33 * b33,
    ];
  },

  translation: function(tx, ty, tz) {
    return [
       1,  0,  0,  0,
       0,  1,  0,  0,
       0,  0,  1,  0,
       tx, ty, tz, 1,
    ];
  },

  xRotation: function(angleInRadians) {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);

    return [
      1, 0, 0, 0,
      0, c, s, 0,
      0, -s, c, 0,
      0, 0, 0, 1,
    ];
  },

  yRotation: function(angleInRadians) {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);

    return [
      c, 0, -s, 0,
      0, 1, 0, 0,
      s, 0, c, 0,
      0, 0, 0, 1,
    ];
  },

  zRotation: function(angleInRadians) {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);

    return [
       c, s, 0, 0,
      -s, c, 0, 0,
       0, 0, 1, 0,
       0, 0, 0, 1,
    ];
  },

  scaling: function(sx, sy, sz) {
    return [
      sx, 0,  0,  0,
      0, sy,  0,  0,
      0,  0, sz,  0,
      0,  0,  0,  1,
    ];
  },

  translate: function(m, tr) {
    return m4.multiply(m4.translation(tr[0], tr[1], tr[2]), m);
  },

  rotateX: function(m, angleInRadians) {
    return m4.multiply(m4.xRotation(angleInRadians), m);
  },

  rotateY: function(m, angleInRadians) {
    return m4.multiply(m4.yRotation(angleInRadians), m);
  },

  rotateZ: function(m, angleInRadians) {
    return m4.multiply(m4.zRotation(angleInRadians), m);
  },
  rotate: function(m, rotationVec){
  		if(rotationVec[0] != 0){
			m = m4.rotateX(m, rotationVec[0]);
		}
		if(rotationVec[1] != 0){
			m = m4.rotateY(m, rotationVec[1]);
		}
		if(rotationVec[2] != 0){
			m = m4.rotateZ(m, rotationVec[2]);
		}
		return m;
  },

  scale: function(m, sc) {
    return m4.multiply(m4.scaling(sc[0], sc[1], sc[2]), m);
  },
  
  	generateTransformationMatrix: function(transInfos){
  		
		let m = [1,0,0,0,
			     0,1,0,0,
			     0,0,1,0,
			     0,0,0,1];
		
		mat4.fromScaling(m, transInfos.scale);
		
		if( !m4.isZerosVector(transInfos.rotate) ){
			m = m4.rotate(m, transInfos.rotate);
		}
/*		if(transInfos.rotate[0] != 0){
			mat4.rotateX(m, m, transInfos.rotate[0]);
		}
		if(transInfos.rotate[1] != 0){
			mat4.rotateY(m, m, transInfos.rotate[1]);
		}
		if(transInfos.rotate[2] != 0){
			mat4.rotateZ(m, m, transInfos.rotate[2]);
		}*/
		
		
		
		if( !m4.isZerosVector(transInfos.translate) ){
			m[12] = transInfos.translate[0];
			m[13] = transInfos.translate[1];
			m[14] = transInfos.translate[2];
		}
		
		return m;
		
/*		console.log('transInfos.scale: ', transInfos.scale);
  		console.log('transInfos.rotate: ', transInfos.rotate);
  		console.log('transInfos.translate: ', transInfos.translate);*/
		
		/*if( !m4.isOnesVector(transInfos.scale) )
			mat = m4.scale(mat, transInfos.scale);
			
		mat = m4.rotate(mat, transInfos.rotate);
		
		if( !m4.isZerosVector(transInfos.translate) ){
			mat = m4.translate(mat, transInfos.translate);
		}
		
		return mat;*/
	},
	
	isOnesVector: function(v){
		return v[0]===1 && v[1]===1 && v[2]===1;
	},
	isZerosVector: function(v){
		return v[0]===0 && v[1]===0 && v[2]===0;
	},

	matToFloatArray: function(mat){
		return new Float32Array(mat);
	},
};

var v4 = {
	dot: function(a,b){
		return v3.dot(a,b);
	},
	cross: function(a,b){
		return v3.cross(a,b);
	},
	length: function(a){
		// kann mir beim besten willen nicht vorstellen, weshalb man die laenge eines v4-vectors messen sollte, 
		// daher wird hier v3.length zurueckgegriffen:
		return v3.length(a);
		
/*		return Math.sqrt(a[0]*a[0] + 
							  a[1]*a[1] + 
							  a[2]*a[2] + 
							  a[3]*a[3]);*/
	},
	lengthSqrd: function(a){
		// kann mir beim besten willen nicht vorstellen, weshalb man die laenge eines v4-vectors messen sollte, 
		// daher wird hier v3.length zurueckgegriffen:
		return v3.lengthSqrd(a);
		
/*		return a[0]*a[0] + 
				 a[1]*a[1] + 
				 a[2]*a[2] + 
				 a[3]*a[3];*/
	},
	normalize: function(a){
		// kann mir beim besten willen nicht vorstellen, weshalb man die laenge eines v4-vectors messen sollte, 
		// daher wird hier v3.length zurueckgegriffen:
		return v3.normalize(a);
		
/*		let lngthSqr = v4.lengthSqrd(a);
		if(lngthSqr === 1){
			return a.slice();		
		}
		let lngth = Math.sqrt(lngthSqr);
		return [a[0]/lngth,
				  a[1]/lngth,
				  a[2]/lngth,
				  a[3]/lngth];*/
	},
	
	vecToFloatArray: function(vec){
		return v3.vecToFloatArray(vec); // aufgrund der einfachen funktionsweise klappt v3.vecToFloatArray auch auf v4-vektoren!
	},
	
	add: function(a,b){
		let bt = typeof b;
		if(bt === 'number'){
			return [a[0]+b,
				    a[1]+b,
				    a[2]+b,
				    a[3]+b]
		}
		return [a[0]+b[0],
				a[1]+b[1],
				a[2]+b[2],
				a[3]+b[3]];
	},
	sub: function(a,b){
		let bt = typeof b;
		if(bt === 'number'){
			return [a[0]-b,
				    a[1]-b,
				    a[2]-b,
				    a[3]-b]
		}
		return [a[0]-b[0],
				a[1]-b[1],
				a[2]-b[2],
				a[3]-b[3]];
	},
	mul: function(a,b){
		let bt = typeof b;
		if(bt === 'number'){
			return [a[0]*b,
				    a[1]*b,
				    a[2]*b,
				    a[3]*b]
		}
		return [a[0]*b[0],
			    a[1]*b[1],
			    a[2]*b[2],
			    a[3]*b[3]];
	},
	div: function(a,b){
		let bt = typeof b;
		if(bt === 'number'){
			return [a[0]/b,
				    a[1]/b,
				    a[2]/b,
				    a[3]/b]
		}
		return [a[0]/b[0],
			    a[1]/b[1],
				a[2]/b[2],
				a[3]/b[3]];
	},
};

var v3 = {
	vec: function(val = 1.0){
		return [val,val,val];
	},
	dot: function(a,b){
		return a[0]*b[0] + 
			   a[1]*b[1] + 
			   a[2]*b[2];
	},
	cross: function(a,b){
		return [a[1]*b[2] - a[2]*b[1],
				a[2]*b[0] - a[0]*b[2],
				a[0]*b[1] - a[1]*b[0]];
	},
	length: function(a){
		return Math.sqrt(a[0]*a[0] + 
					     a[1]*a[1] + 
					     a[2]*a[2]);
	},
	lengthSqrd: function(a){
		return a[0]*a[0] + 
			   a[1]*a[1] + 
			   a[2]*a[2];
	},
	normalize: function(a){
		let lngthSqr = v3.lengthSqrd(a);
		if(lngthSqr === 1 ||
		   lngthSqr === 0){
			return a.slice();		
		}
		let lngth = Math.sqrt(lngthSqr);
		return [a[0]/lngth,
				a[1]/lngth,
				a[2]/lngth];
	},
	add: function(a,b){
		let bt = typeof b;
		if(bt === 'number'){
			return [a[0]+b,
				    a[1]+b,
				    a[2]+b]
		}
		return [a[0]+b[0],
				a[1]+b[1],
				a[2]+b[2]];
	},
	sub: function(a,b){
		let bt = typeof b;
		if(bt === 'number'){
			return [a[0]-b,
				    a[1]-b,
				    a[2]-b]
		}
		return [a[0]-b[0],
				a[1]-b[1],
				a[2]-b[2]];
	},
	mul: function(a,b){
		let bt = typeof b;
		if(bt === 'number'){
			return [a[0]*b,
				    a[1]*b,
				    a[2]*b]
		}
		return [a[0]*b[0],
			    a[1]*b[1],
			    a[2]*b[2]];
	},
	div: function(a,b){
		let bt = typeof b;
		if(bt === 'number'){
			return [a[0]/b,
				    a[1]/b,
				    a[2]/b]
		}
		return [a[0]/b[0],
			    a[1]/b[1],
				a[2]/b[2]];
	},
	
	vecToFloatArray: function(vec){
		return new FloatArray(vec);
	},
};

var v2 = {
	vec: function(val = 1.0){
		return [val,val];
	},
	dot: function(a,b){
		return a[0]*b[0] + 
			   a[1]*b[1];
	},

	length: function(a){
		return Math.sqrt(a[0]*a[0] + 
						 a[1]*a[1]);
	},
	lengthSqrd: function(a){
		return a[0]*a[0] + 
			   a[1]*a[1];
	},
	normalize: function(a){
		let lngthSqr = v2.lengthSqrd(a);
		if(lngthSqr === 1 || // bereits normalized
		   lngthSqr === 0){  // [0,0]-vector: normalization fuehrt zu division durch 0, also wird wieder der [0,0] - vector zurueckgegeben
			return a.slice();		
		}
		let lngth = Math.sqrt(lngthSqr);
		return [a[0]/lngth,
			    a[1]/lngth];
	},
	add: function(a,b){
		let bt = typeof b;
		if(bt === 'number'){
			return [a[0]+b,
				    a[1]+b]
		}
		return [a[0]+b[0],
			    a[1]+b[1]];
	},
	sub: function(a,b){
		let bt = typeof b;
		if(bt === 'number'){
			return [a[0]-b,
				    a[1]-b]
		}
		return [a[0]-b[0],
				a[1]-b[1]];
	},
	mul: function(a,b){
		let bt = typeof b;
		if(bt === 'number'){
			return [a[0]*b,
				    a[1]*b]
		}
		return [a[0]*b[0],
				a[1]*b[1]];
	},
	div: function(a,b){
		let bt = typeof b;
		if(bt === 'number'){
			return [a[0]/b,
				    a[1]/b];
		}
		return [a[0]/b[0],
				a[1]/b[1]];
	},
	
	angleRadInGlobalSpace: function(a){
		a = v2.normalize(a);
		
		let b = [1,0]; // refVector
		
		let cosine = v2.dot(a,b);
		let angle = Math.acos(cosine);
		
		if( a[1] < 0 )
			angle = Math.PI * 2.0 - angle;
		
		 return angle;
	},
	angleDegInGlobalSpace: function(a){
		return MathBD.toDegrees(v2.angleRadInGlobalSpace(a));
	},
	
	calcCollision: function(ball1, ball2){
		
		let rad1 = ball1.radius;
		let rad2 = ball2.radius;
        let vel1 = [ball1.vel[0], ball1.vel[1]];
        let vel2 = [ball2.vel[0], ball2.vel[1]];
        let m1 = ball1.mass;
        let m2 = ball2.mass;
        let cent1 = [ball1.center[0], ball1.center[1]];
        let cent2 = [ball2.center[0], ball2.center[1]];
        
        let distSqrd = v2.lengthSqrd( v2.sub(cent1, cent2) );
        let doubleRadius = rad1 + rad2;
        
        // no contact, too far away from each other:
        if(distSqrd > doubleRadius * doubleRadius)
        	return false;
        
        let dist = Math.sqrt(distSqrd);
        
/*        let d = v2.sub(cent2, cent1);
        let v = v2.sub(vel2, vel1);
        
        // balls are moveing away from each other:
//        let approachingDot = v2.dot(d, v);
        if(approachingDot > 0)
        	return false;*/
        	
        let div1 = v2.length(v2.sub(cent1, cent2));
        let div2 = v2.length(v2.sub(cent2, cent1));
        div1 *= div1;
        div2 *= div2;
        
        let nvm1 = v2.sub(cent1, cent2);
        let nvm2 = v2.sub(cent2, cent1);
        
        let dot1 = v2.dot( v2.sub(vel1, vel2), v2.sub(cent1, cent2) );
        let dot2 = v2.dot( v2.sub(vel2, vel1), v2.sub(cent2, cent1) );
        
        let frctn1,
        	frctn2;
        
        let prsrvVel1 = false;
        let prsrvVel2 = false;
        let infVel1 = false;
        let infVel2 = false;
        
        if(m1 === Infinity){
        	m1 = 9999999999999999999999;
        	infVel1 = true;
        	prsrvVel1 = true;
        }
        if(m2 === Infinity){
        	m2 = 9999999999999999999999;
        	infVel2 = true;
        	prsrvVel2 = true;
        }
        
        frctn1 = m2 / (m1 + m2);
        frctn2 = m1 / (m1 + m2);
        
/*        if( m1 === Infinity && m1 === Infinity){
        	frctn1 = 1;
        	frctn2 = 1;
        	infVel1 = true;
        	infVel2 = true;
        }else if (m1 === Infinity){
        	frctn1 = 0;
        	frctn2 = 1;
        	prsrvVel2 = true;
        	infVel1 = true;
        }else if (m2 === Infinity){
        	frctn1 = 1;
        	frctn2 = 0;
        	prsrvVel1 = true;
        	infVel2 = true;
        }else{
        	frctn1 = m2 / (m1 + m2);
        	frctn2 = m1 / (m1 + m2);
        }*/
        
        let sclr1 = 2 * frctn1 * dot1 / div1;
        let sclr2 = 2 * frctn2 * dot2 / div2;
        
        let v1_ = v2.sub(vel1, v2.mul(nvm1, sclr1));
        let v2_ = v2.sub(vel2, v2.mul(nvm2, sclr2));
        
        if(prsrvVel1){
        	let s1 = v2.length(vel1); // speed of v1
        	v2.setTargetSpeed(vel1, s1);
        }else if(prsrvVel2){
	  		let s2 = v2.length(vel2); // speed of v2
        	v2.setTargetSpeed(vel2, s2);
        }
        
      	if(isNaN(v1_[0]))
	   		v1_[0] = 0;
	   	if(isNaN(v1_[1]))
	   		v1_[1] = 0;
	   	if(isNaN(v2_[0]))
	   		v2_[0] = 0;
	   	if(isNaN(v2_[1]))
	   		v2_[1] = 0;
	   	
	   	
	   	if(!infVel1)
	   		ball1.vel = [v1_[0], v1_[1], 0];
	   	if(!infVel2)
	   		ball2.vel = [v2_[0], v2_[1], 0];
	   		
	   	if(dist < doubleRadius){
	   		let offsVec = v2.mul(v2.normalize(v2.sub(cent2, cent1)), doubleRadius);
	   		if(infVel1){
		   		let newBallCent2 = v2.add(cent1, offsVec);
		   		ball2.center[0] = newBallCent2[0];
		   		ball2.center[1] = newBallCent2[1];
	   		}else{// betrifft: infVel2 && (!infVel1 && !infVel2)
	   			let newBallCent1 = v2.sub(cent2, offsVec);
		   		ball1.center[0] = newBallCent1[0];
		   		ball1.center[1] = newBallCent1[1];
	   		}
	   	}
	   	
	   	return true;
        
        
/*	  	let s1 = v2.length(vel1); // speed of v1
	  	let s2 = v2.length(vel2); // speed of v2
	    
	   	let thet1 = v2.angleRadInGlobalSpace(vel1); // absolute angle of v1 in global space
	   	let thet2 = v2.angleRadInGlobalSpace(vel2); // absolute angle of v1 in global space
	   	
	   	let phi = v2.angleRadInGlobalSpace( v2.sub(cent2, cent1) );
	   	
	   	let cos_thet1_phi = Math.cos(thet1 - phi);
	   	let cos_thet2_phi = Math.cos(thet2 - phi);
	   	let sin_thet1_phi = Math.sin(thet1 - phi);
	   	let sin_thet2_phi = Math.sin(thet2 - phi);
	   	let cosPhi = Math.cos(phi);
	   	let sinPhi = Math.sin(phi);
	   	let m1_m2 = m1 - m2;
	   	let m2_m1 = m1_m2 * -1.0;
	   	
	   	let v1x_ = s1 * cos_thet1_phi * m1_m2 + 2 * m2 * s2 * cos_thet2_phi / (m1 + m2) 
	  		          * cosPhi + s1 * sin_thet1_phi * sinPhi;    
	                 
	   	let v2x_ = s2 * cos_thet2_phi * m2_m1 + 2 * m1 * s1 * cos_thet1_phi / (m2 + m1) 
	   	              * cosPhi + s2 * sin_thet2_phi * sinPhi;
	                 
	   	let v1y_ = s1 * cos_thet1_phi * m1_m2 + 2 * m2 * s2 * cos_thet2_phi / (m1 + m2) 
	   	              * sinPhi + s1 * sin_thet1_phi * cosPhi;
	   	              
	   	let v2y_ = s2 * cos_thet2_phi * m2_m1 + 2 * m1 * s1 * cos_thet1_phi / (m2 + m1) 
	   	              * sinPhi + s2 * sin_thet2_phi * cosPhi;
	   	
	   	if(isNaN(v1x_))
	   		v1x_ = 0;
	   	if(isNaN(v2x_))
	   		v2x_ = 0;
	   	if(isNaN(v1y_))
	   		v1y_ = 0;
	   	if(isNaN(v2y_))
	   		v2y_ = 0;
	   	
	   	
	   	ball1.vel = [v1x_, v1y_, 0];
	   	ball2.vel = [v2x_, v2y_, 0];
	   	
	   	console.log('vel1: ', ball1.vel);
	   	console.log('vel2: ', ball2.vel);
	   	   	
	   	return true;*/
	},
	
	setTargetSpeed: function(vel, targetSpeed){
		if(vel[1] === 0){ // wuedre zu 0-division fuehren:
			let multplctr = vel[0] >= 0 ? 1 : -1
			vel = [multplctr * targetSpeed, 0]; // ball bewegt sich jetzt horizontal in x-richtung (ob negativ oder positiv haengt von der bisherigen vel ab)
			return;
		}else if (vel[0] === 0){ // ist nicht zwingend notwendig, aber schneller
			let multplctr = vel[1] >= 0 ? 1 : -1;
			vel = [0, multplctr * targetSpeed];
			return;
		}
		// vel so setzen, dass vel.length === targetSpeed ergibt und dabei als
		// nebenbedingung das verhaeltnis vel.x / vel.y bewahren:
		let velRatio = vel[0] / vel[1];
		let tarY = Math.sqrt((targetSpeed*targetSpeed) / ((velRatio*velRatio) + 1));
		tarY *= MathBD.vorz(vel[1]); // beim quadrieren geht das vorzeichen verloren. das muss wiederhergestellt werden!
		let tarX = velRatio * tarY;

		vel = [tarX, tarY];
	},
};


export {MathBD,
		  m4, v4, v3, v2,
		  genTransformationInfo,
		  };