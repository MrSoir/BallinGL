import './gl-matrix.js';
import {m4,v4, v3, v2, MathBD} from "./MathBD.js";
import {ShaderFactory} from './ShaderCreator.js';




// InstancedTriangle diente nur dazu, das Instancing zu testen
// -> das klappt nun wunderbar, InstancedTriangle hat brav seine Dienste
// getan und darf nun in seine wohlverdiente Rente







let VS = `#version 300 es
precision mediump float;
layout (location = 0) in vec3 aPos;
layout (location = 1) in vec3 aOffset;
layout (location = 2) in mat4 aModel;
layout (location = 6) in mat3 aColorMat;
layout (location = 9) in float aAlpha;

uniform mat4 model;
uniform mat4 proj;
uniform mat4 view;

flat out vec3 color;
flat out float alpha;

void main()
{
	vec3 pos = vec3(aPos.x + aOffset.x, aPos.y + aOffset.y, aPos.z + aOffset.z);
	gl_Position = proj * view * aModel * vec4(pos, 1.0f);
	
	color = aColorMat[0];
	alpha = aAlpha;
}`;

let FS = `#version 300 es
precision mediump float;

out vec4 FragColor;

flat in vec3 color;
flat in float alpha;

void main()
{
	vec3 col = color * alpha;
    FragColor = vec4(col, alpha);
}
`;


class InstancedTriangle{
	constructor(glMeta){
		this.layoutLocationCntr = 0;
		
		let triOffs = 0.5;
		this.vertices = [
			   	-triOffs, -triOffs, 0.0,
			   	 triOffs, -triOffs, 0.0,
	    	     0.0,  triOffs, 0.0
	  	];
	  	
	  	this.strideCounter = 4;
	  	
	  	this.generateRandomTransformations();
	  	
	  	this.createShaderProgram(glMeta);
	}
	
	generateRandomTransformations(){
		let steps = 10;
		let step = 360 / steps;
		
		this.modelCount = steps;
		
		this.models		= [];
		this.offsets	= [];
		this.colors		= [];
		this.alphas		= [];
		
		for(let i=0; i < steps; ++i){
			let x = Math.cos(MathBD.toRadians(step * i));
			let y = Math.sin(MathBD.toRadians(step * i));
			let z = i * 5;
			
			let trans = MathBD.genTransformationInfo();
			trans.scale = [1+i, 1+i,1];
			trans.rotate = [0, 0, i*0.5];
			let model = MathBD.genTransformationMatrix(trans);
			
			this.models.push.apply(this.models, model);
			this.offsets.push(x*4, 0, 0);
			
			let colorId = i % 3;
			let r = colorId == 0 ? 1 : 0;
			let g = colorId == 1 ? 1 : 0;
			let b = colorId == 2 ? 1 : 0;
			let colorMat = mat3.create();
			colorMat[0] = r;
			colorMat[1] = g;
			colorMat[2] = b;
			this.colors.push.apply(this.colors, colorMat);
			
			this.alphas.push(i * 0.1 % 1);
		}
		
		let trans = MathBD.genTransformationInfo();
		trans.scale = [3,3,1];
		let model = MathBD.genTransformationMatrix(trans);
		this.uniformModel = model;
	}
	
	createShaderProgram(glMeta){
		let gl = glMeta.gl;
		let program = ShaderFactory.createShaderProgram(gl, VS, FS).program;
		this.shaderProgram = program;
		gl.useProgram(this.shaderProgram);
	}
	
	
	
	setGL_Buffers(glMeta){
		this.layoutLocationCntr = 0;
		
		let gl = glMeta.gl;
		let view = glMeta.view;
		let projection = glMeta.projection;
		
		gl.useProgram(this.shaderProgram);
		
		ShaderFactory.setModel(		gl, this.shaderProgram, this.uniformModel);
		ShaderFactory.setView( 		gl, this.shaderProgram, view);
	   	ShaderFactory.setProjection(gl, this.shaderProgram, projection);
		
		let vao = gl.createVertexArray();
	  	gl.bindVertexArray(vao);
	    
	    this.layoutLocationCntr = ShaderFactory.setAttribute(gl, this.vertices, [3], this.layoutLocationCntr);
	    
		this.layoutLocationCntr = ShaderFactory.setAttribute_Instanced(gl, this.offsets,   3,	this.layoutLocationCntr);
		this.layoutLocationCntr = ShaderFactory.setAttribute_Instanced(gl, this.models,	  16,	this.layoutLocationCntr);
		
		this.layoutLocationCntr = ShaderFactory.setAttribute_Instanced(gl, this.colors,	   9, 	this.layoutLocationCntr);
		this.layoutLocationCntr = ShaderFactory.setAttribute_Instanced(gl, this.alphas,	   1, 	this.layoutLocationCntr);
	}
	
	drawArrays(glMeta){
		let gl = glMeta.gl;
		
  		gl.drawArraysInstanced(gl.TRIANGLES, 0, 3, this.modelCount);
	}
	
	paint(glMeta){
		ShaderFactory.tidyUp(glMeta.gl);
		this.setGL_Buffers(glMeta);
		this.drawArrays(glMeta);
		ShaderFactory.tidyUp(glMeta.gl);
	}

}

export {InstancedTriangle};

