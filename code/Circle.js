import {GL_Shape} from "/code/GL_Shape.js";
import {m4,v4, v3, MathBD, genTransformationInfo} from "/code/MathBD.js";
import {CircleFactory} from "/code/CircleFactory.js";

class Circle extends GL_Shape{
	constructor(glMeta, pos, radius, color = [1,0,0]){
		super(glMeta, {lightningOn: false,});
				
		this.pos = pos;
		this.radius = radius;
		
		this.color = color;
		
		this.transformationData = genTransformationInfo();
		this.transformationData.translate = pos.slice();
		this.transformationData.scale = [radius,radius,radius];
		
		this.shaderAttibMeta = {
			dataSizes: [3],
			stride: 3,
		};
	}
	getVertices(){
		let vertices = Circle.circleFactory.getVertices();//WithNormals();
		return vertices;
	}
}

Circle.circleFactory = new CircleFactory();

export {Circle};


