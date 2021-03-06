import './gl-matrix.js';
import {m4,v4, v3, MathBD, genTransformationInfo} from "./MathBD.js";
import {GLSL_Functions} from "./GLSL_Functions.js";
import {ShaderFactory} from './ShaderCreator.js';
import {StringParserBD} from "./StringParserBD.js";
import {LightningCodeGenrator} from "./LightningCode.js";

var shaders = {
	getVertexShaderSource: function(lightningMeta, customUniforms, instancingMeta){
		
		let lightningOn = lightningMeta.lightningOn;

		let vertShaderTemplate = `#version 300 es
			precision mediump float;
			
			layout (location = 0) in vec3 aPos;
			
			uniform mat4 uModel;
			uniform mat4 uView;
			uniform mat4 uProj;
			
			{x} // lightningInputVariables
			
			{x} // customUniforms.VS_BefMain
			{x} // instancingMeta.VS_BefMain
			
			
			void main() {
				mat4 model = uModel; // damit spaeterer code model manip. darf
				
				vec3 pos = vec3(aPos);
				
				// folgender dynamisch erzeugter code MUSS mit 'pos' arbeiten, und nicht mit 'aPos'!!!!
				{x} // customUniforms.VS_Main_BefTrans
				{x} // instancingMeta.VS_Main_BefTrans
				
				vec4 transformedPos = uProj * uView * model * vec4(pos, 1.0);
				
				// folgender dynamisch erzeugter code MUSS mit 'transformedPos' arbeiten:
				{x} // customUniforms.VS_Main_AftTrans
				{x} // instancingMeta.VS_Main_AftTrans
				
				gl_Position = transformedPos;

				{x} // lightningReturnVariables
			}
		`;
		let l_VS_bm = lightningOn ? lightningMeta.VS_BefMain	   : ``;
		let l_VS_m  = lightningOn ? lightningMeta.VS_Main_BefTrans : ``;
		
		let u_VS_bm   = "",
			u_VS_m_bt = "",
			u_VS_m_at = "";
		
		if( !!customUniforms ){
			u_VS_bm   = customUniforms.VS_BefMain;
			u_VS_m_bt = customUniforms.VS_Main_BefTrans;
			u_VS_m_at = customUniforms.VS_Main_AftTrans;
		}
		
		let i_VS_bm   = "",
			i_VS_m_bt = "",
			i_VS_m_at = "";
		
		if( !!instancingMeta ){
			i_VS_bm   = instancingMeta.VS_BefMain;
			i_VS_m_bt = instancingMeta.VS_Main_BefTrans;
			i_VS_m_at = instancingMeta.VS_Main_AftTrans;
		}
		
		
		vertShaderTemplate = GLSL_Functions.StrReplacer(vertShaderTemplate,
														l_VS_bm,
														
														u_VS_bm,
														i_VS_bm,
														
														u_VS_m_bt,
														i_VS_m_bt,
														
														u_VS_m_at,
														i_VS_m_at,
														
														l_VS_m);
		return vertShaderTemplate;
	},
	getFragmentShaderSource: function(lightningMeta, customUniforms, instancingMeta){
		let lightningOn = lightningMeta.lightningOn;
		
		let fragmentShaderTemplate = 
`#version 300 es
	precision mediump float;
	
	uniform vec4 objCol;
	
	out vec4 FragColor;

	{x} // lightning_FS_BefMain
	
	{x} // customUniforms.FS_BefMain
	{x} // instancingMeta.FS_BefMain
	
	void main() {
		vec4 colBefLight = objCol; // mit colBefLight koennen dann externe klassen arbeiten um die fragmentfarbe
								   // zu berechnen, mit der dann anschliessend die licht-berechnungen angestellt werden.
							
		// mit colBefLight arbeiten!!!:			 
		{x} // customUniforms.FS_Main_BefLight
		{x} // instancingMeta.FS_Main_BefLight
		
		vec4 colAftLight = {x} // lightning_FS_Main: OBACHT: ';' muss NOCH gesetzt werden!!
		
		// mit colAftLight arbeiten!!!:	
		{x} // customUniforms.FS_Main_AftLight
		{x} // instancingMeta.FS_Main_AftLight
		
		// fettiiiig, jetzt geht die finale color raus:
		FragColor = colAftLight;
	}
`;
		let l_FS_bm = lightningOn ? lightningMeta.FS_BefMain 	   : ``;
		let l_FS_m  = lightningOn ? lightningMeta.FS_Main_BefLight : `colBefLight;`;
		
		let u_FS_bm   = "",
			u_FS_m_bl = "",
			u_FS_m_al = "";
		if( !!customUniforms ){
			u_FS_bm   = customUniforms.FS_BefMain;
			u_FS_m_bl = customUniforms.FS_Main_BefLight;
			u_FS_m_al = customUniforms.FS_Main_AftLight;
		}
		
		let i_FS_bm   = "",
			i_FS_m_bl = "",
			i_FS_m_al = "";
		if( !!instancingMeta ){
			i_FS_bm   = instancingMeta.FS_BefMain;
			i_FS_m_bl = instancingMeta.FS_Main_BefLight;
			i_FS_m_al = instancingMeta.FS_Main_AftLight;
		}
		
		fragmentShaderTemplate = GLSL_Functions.StrReplacer(fragmentShaderTemplate,
															l_FS_bm,
															u_FS_bm,
															i_FS_bm,
															
															u_FS_m_bl,
															i_FS_m_bl,
															
															l_FS_m,
															
															u_FS_m_al,
															i_FS_m_al); 

		return fragmentShaderTemplate;
	},
};

class GL_Shape{
	constructor(glMeta, lightningMeta, customUniforms, instancingMeta, initShadersImmediately = true){
		
		this.DRAW_STYLE = glMeta.gl.TRIANGLES;
		
		this.transformationData = genTransformationInfo();
		
		this.instancingMeta = instancingMeta;
		
		this.customUniforms = customUniforms;
		
		if(lightningMeta === undefined){
			lightningMeta = GL_Shape.genLightningMeta();
		}
		this.lightningMeta = lightningMeta;
		
		// fuegt dem lightningMeta die VS_BefMain etc hinzu:
		LightningCodeGenrator(lightningMeta);
		
		this.color = [0,1,0, 1]; // per default haben alle objekte die farbe lime
		
		// wird fuer ShaderFactory.setAttribute_fv gebraucht:
		// wenn z.B. noch normalen bei einem wuerfel mit in den vertices stecken, muss stride auf 6*4 gesetzt werden! 
		// (interessanterweise bleibt dann dataSize dennoch bei 3! soweit ich DERZEIT weiss wird dataSize IMMER auf 3 gesetzt)
		if( lightningMeta.lightningOn ){
			this.shaderAttibMeta = {
				dataSizes: [3,3],
				stride: 6,
			};
		}else{
			this.shaderAttibMeta = {
				dataSizes: [3],
				stride: 3,
			};
		}
		
		if(initShadersImmediately)
			this.initShaders(glMeta);
	}
	
	initShaders(glMeta){
		// processInstancingCode MUSS noch vor getVertexShaderSource & getFragmentShaderSource aufgerufen werden, damit die
		// layout-locations korrekt zugewiesen werden koennen:
		this.processInstancingCode(2); // 2 == firstAvailableLayoutId: 'layout (location = x)...': 0 und 1 sind reserviert: 0 -> aPos | 1 -> aNormal
		this.processCustomUnifroms();
		
		this.vertexShaderSource   = shaders.getVertexShaderSource  (this.lightningMeta, this.customUniforms, this.instancingMeta);
		this.fragmentShaderSource = shaders.getFragmentShaderSource(this.lightningMeta, this.customUniforms, this.instancingMeta);
		
		this.initShaderProgram(glMeta.gl);
	}
	
	resetInstancingData(instancingData){
		let attributes = this.instancingMeta.attributes;
		let updtdAttributes = instancingData.attributes;
		
		for(let i=0; i < attributes.length; ++i){
			for(let j=0; j < updtdAttributes.length; ++j){
				if(attributes[i].name === updtdAttributes[j].name){
					attributes[i].data = updtdAttributes[j].data;
					break;
				}
			}
		}
		
		this.instancingMeta.count = instancingData.count;
	}
	
	resetCustomUniformData(customUniformData){
		this.customUniforms.uniforms = customUniformData;
	}
	
	processInstancingCode( firstAvailableLayoutId ){
		let id = firstAvailableLayoutId;
		
		let instancingMeta = this.instancingMeta;
		
		if( !!instancingMeta ){
			
			// erstmal dafuer sorgen, dass alle benoetigten code-strings vorhanden sind:
			// VS:
			instancingMeta.VS_BefMain 		= StringParserBD.getValidStr( instancingMeta.VS_BefMain );
			instancingMeta.VS_Main_BefTrans = StringParserBD.getValidStr( instancingMeta.VS_Main_BefTrans );
			instancingMeta.VS_Main_AftTrans = StringParserBD.getValidStr( instancingMeta.VS_Main_AftTrans );
			
			// FS:
			instancingMeta.FS_BefMain 		= StringParserBD.getValidStr( instancingMeta.FS_BefMain );
			instancingMeta.FS_Main_BefLight = StringParserBD.getValidStr( instancingMeta.FS_Main_BefLight );
			instancingMeta.FS_Main_AftLight = StringParserBD.getValidStr( instancingMeta.FS_Main_AftLight );
			
			let attributes = instancingMeta.attributes;
			
			if( !attributes ){
				console.error('in GL_Shape.processInstancingCode: instancintMeta.attributes is INVALID: ', instancingMeta);
				console.trace();
			}
			
			let varInitCode = '';
			
			for(let i=0; i < attributes.length; ++i){
				let attrib = attributes[i];
				
				varInitCode += '\nlayout (location = ' + id + ') in ' + attrib.dataType + ' ' + attrib.name +';';
				attrib.layoutId = id;
				
				this.processInstancingCode_Helper(attrib);
				
				id += attrib.dataSizes.length;
			}
			
			// reihenfolge wichtig: erst die variablen initialisierden/definieren,
			// erst danach der weitere code:
			instancingMeta.VS_BefMain = varInitCode + '\n' + instancingMeta.VS_BefMain;
		}
	}
	processInstancingCode_Helper(meta){
		// VS_InVars wird von GL_Shape definiert. der rest muss von dem instancingMeta-objekt
		// selbst definiert sein:
		
		let instancingMeta = this.instancingMeta;
		
		// VertexShader:
		instancingMeta.VS_BefMain 		+= StringParserBD.getValidStr( meta.VS_BefMain );
		instancingMeta.VS_Main_BefTrans += StringParserBD.getValidStr( meta.VS_Main_BefTrans );
		instancingMeta.VS_Main_AftTrans += StringParserBD.getValidStr( meta.VS_Main_AftTrans );
		
		// FragemntShader:
		instancingMeta.FS_BefMain 		+= StringParserBD.getValidStr( meta.FS_BefMain );
		instancingMeta.FS_Main_BefLight += StringParserBD.getValidStr( meta.FS_Main_BefLight );
		instancingMeta.FS_Main_AftLight += StringParserBD.getValidStr( meta.FS_Main_AftLight );
	}
	processCustomUnifroms(){
		let customUniforms = this.customUniforms;
		
		if( !customUniforms )
			return;
		
		// dafuer sorgen, dass alle benoetigten code-strings vorhanden sind:
		// VS:
		customUniforms.VS_BefMain 		= StringParserBD.getValidStr( customUniforms.VS_BefMain );
		customUniforms.VS_Main_BefTrans = StringParserBD.getValidStr( customUniforms.VS_Main_BefTrans );
		customUniforms.VS_Main_AftTrans = StringParserBD.getValidStr( customUniforms.VS_Main_AftTrans );
		
		// FS:
		customUniforms.FS_BefMain 		= StringParserBD.getValidStr( customUniforms.FS_BefMain );
		customUniforms.FS_Main_BefLight = StringParserBD.getValidStr( customUniforms.FS_Main_BefLight );
		customUniforms.FS_Main_AftLight = StringParserBD.getValidStr( customUniforms.FS_Main_AftLight );
	}
	
	getVertices(){
		let triOffs = 0.5;
		var positions = [
		   	-triOffs, -triOffs, 8.0,	1.0, 0.0, 0.0,
		   	 triOffs, -triOffs, 8.0,    0.0, 1.0, 0.0,
    	    	 0.0,  triOffs, 8.0,	0.0, 0.0, 1.0,
	  	];
		return positions;
	}
	
	initShaderProgram(gl){
		let shaders = ShaderFactory.createShaderProgram(gl, this.vertexShaderSource, this.fragmentShaderSource);
	  	
	  	this.vertexShader   = shaders.vertexShader;
	  	this.fragmentShader = shaders.fragmentShader;
		
	  	this.shaderProgram = shaders.program;
	}
	
	setShaderVariables(glMeta){//gl, view, projection, cameraPos, lightPos, lightCol){
		let vertices = this.getVertices();
		
		let model = MathBD.genTransformationMatrix( this.transformationData );
		
		let gl 			= glMeta.gl;
		let view 		= glMeta.view;
		let projection 	= glMeta.projection;
		let cameraPos 	= glMeta.cameraPos;
		let lightPos 	= glMeta.lightPos;
		let lightCol 	= glMeta.lightCol;
		
		let instancingMeta = this.instancingMeta;
		
		gl.useProgram(this.shaderProgram);
		
		let layoutLocation = 0;
		
		layoutLocation = ShaderFactory.setAttribute(gl, vertices, this.shaderAttibMeta.dataSizes, layoutLocation);
		
		ShaderFactory.setUniform3fv(gl, this.shaderProgram, 'cameraPos', cameraPos);
		
		ShaderFactory.setUniform3fv(gl, this.shaderProgram, 'lightPos', lightPos);
		ShaderFactory.setUniform3fv(gl, this.shaderProgram, 'lightCol', lightCol);
		
		let objColor = this.color.length === 3 ? [this.color[0], this.color[1], this.color[2], 1] : this.color;
		ShaderFactory.setUniform4fv(gl, this.shaderProgram, 'objCol', objColor);
		
		// check if derived class has set custom uniforms:
		if( !!this.customUniforms ){
			let uniforms = this.customUniforms.uniforms;
			if( !uniforms ){
				console.error('in GL_Shape.setShaderVariables: customUniforms is INVALID - no customUniforms.uniforms: ', this.customUniforms);
				console.trace();
			}
			
			
			ShaderFactory.setUniforms(gl, this.shaderProgram, uniforms);
		}

	   	// setting transformation-matrixes:
		ShaderFactory.setModel(gl, this.shaderProgram, model, 'uModel');
	   	ShaderFactory.setView(	    gl, this.shaderProgram, view, 'uView');
	   	ShaderFactory.setProjection(gl, this.shaderProgram, projection, 'uProj');
	   	
	   	if( !!instancingMeta ){
	   		let attributes = instancingMeta.attributes;
	   		if( !attributes ){
	   			console.error('in GL_Shape.setShaderVariables: instancing.attributes is INVALID: ', instancingMeta);
	   		}
	   		for(let i=0; i < attributes.length; ++i){
	   			
	   			this.validateInstancingObj(attributes[i]);
	   			
	   			layoutLocation = ShaderFactory.setAttribute(gl, attributes[i].data, attributes[i].dataSizes, attributes[i].layoutId, true);
	   		}
	   	}
	}
	
	validateInstancingObj(inst, i){
		if(	inst.layoutId === undefined ||
   			inst.layoutId === null){
   			console.error('in GL_Shape.setShaderVariables: attrib[', i, '].layoutId is INVALID!: ', inst);
   			console.trace();
   		}
   		if( !inst.data ){
   			console.error('in GL_Shape.setShaderVariables: attrib[', i, '].data is INVALID!: ', inst);
   			console.trace();
   		}
   		if( !inst.dataSizes ){
   			console.error('in GL_Shape.setShaderVariables: attrib[', i, '].data is INVALID!: ', inst);
   			console.trace();
   		}
	}
	
	paintVertices(glMeta){
		let gl = glMeta.gl;
		
		gl.useProgram(this.shaderProgram);
		
		let vertices = this.getVertices();
		
		if(vertices.length === 0){
			console.error('in GL_Shape.paint -> vertices.length === 0 -> no data set to draw (derived class of GL_Shape MUST override getVertices()-Function!');
			console.trace();
			return;
		}
		
		let count = vertices.length / this.shaderAttibMeta.stride;
		if( !!this.instancingMeta ){
			gl.drawArraysInstanced(this.DRAW_STYLE, /*offset:*/0, /*verticesPerOjbect:*/ count, /*elementsToRender*/this.instancingMeta.count);
		}else{
			gl.drawArrays(this.DRAW_STYLE, /*offset:*/ 0, /*verticesPerOjbect:*/ count);
		}
	}
	tidyUp(glMeta){
		ShaderFactory.tidyUp(glMeta.gl);
	}
	
	paint(glMeta){
		// sicherstellen, dass der vordermann keinen muell hinterlassen hat
		ShaderFactory.tidyUp(glMeta.gl);
		
		// das eigentliche zeichnen:
		this.setShaderVariables(glMeta);
		this.paintVertices(glMeta);
		
		// ein vorbildlicher nachbar sein und den eigenen muell beseitigen:
		this.tidyUp(glMeta);
	}
}

GL_Shape.genLightningMeta = function(){
	return {
		lightningOn: true,
		specularPower: 16,
		ambientFctr: 0.3,
	};
};

export {GL_Shape};

