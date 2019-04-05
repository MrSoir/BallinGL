"use strict";

var curVAOs = [];
let curVBOs = [];

var ShaderFactory = {
	
	//	-------------------------------------------------------------------------------------------
	
	tidyUp: function(gl){
		this.deleteActiveBuffers(gl);
	},
	deleteActiveBuffers: function(gl){
		for(let i=0; i < curVAOs.length; ++i){
			gl.deleteVertexArray(curVAOs[i]);
		}
		curVAOs = [];
		
		for(let i=0; i < curVAOs.length; ++i){
		    gl.deleteBuffer(curVBOs[i]);
		}
		curVBOs = [];
	},
	
	// setAttribute_Named() wird derzeit nicht gebraucht und ich verzichte moeglichst besser auch zukuenftig darauf,
	// denn bei named-attributes:  gl.getAttribLocation(shaderProgram, attributeName);
	// ist das problem, dass die layoutLocation nicht mehr beeinflussbar ist,
	// was es unmoeglich macht, VS und FS dynamisch zu programmieren:
	setAttribute_Named: function(gl, shaderProgram, 
								 attributeNames, 
								 dataVector,
								 dataSizes = [3], // dataSize: anz. vertices pro polygon, i.d.R. also in 3D immer 3
								  ){
		
		if( attributeNames.length === undefined ||
		    attributeNames.length === 0 ){
			console.error('in ShaderCreator.setAttribute_fv: attributeNames.length === ' + attributeNames.length + '!!!!!');
			return;
		}
		
		if( vao.length === 0 ){
			let vao = gl.createVertexArray();
	  		gl.bindVertexArray(vao);
	  		curVAOs.push(vao);
	  	}
	  	
	  	let stride = 0;
	  	for(let i=0; i < dataSizes.length; ++i){
	  		stride += dataSizes[i];
	  	}
	  	
	  	let vbo = gl.createBuffer();
	  	gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
	  	curVBOs.push(vbo);
  		
  		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(dataVector), gl.STATIC_DRAW);
  		
  		let offset = 0;
  		for(let i=0; i < attributeNames.length; ++i){
			let attributeLocation = gl.getAttribLocation(shaderProgram, attributeNames[i]);
			gl.enableVertexAttribArray(attributeLocation);
		   	gl.vertexAttribPointer(attributeLocation, dataSizes[i], gl.FLOAT, false, stride * 4, offset * 4);
		   	
		   	offset += dataSizes[i];
		}
	},
	
	setAttributeHelper: function(gl, data, dataSizes, layoutLocation = 0, instanced = false){
		if( curVAOs.length === 0 ){
			let vao = gl.createVertexArray();
	  		gl.bindVertexArray(vao);
	  		curVAOs.push(vao);
	  	}
	  	
		let vbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
        curVBOs.push(vbo);
        
        let stride = 0;
        for(let i=0; i < dataSizes.length; ++i){
        	stride += dataSizes[i];
        }
		
		let offset = 0;
		for(let i=0; i < dataSizes.length; ++i){
			gl.enableVertexAttribArray(layoutLocation + i);
	        gl.vertexAttribPointer(layoutLocation + i, dataSizes[i], gl.FLOAT, false, stride * 4, offset * 4);
	        if(instanced)
	        	gl.vertexAttribDivisor(layoutLocation + i, 1);
	        	
	        offset += dataSizes[i];
	    }
	    return layoutLocation + dataSizes.length;
	},
	
	// matrices - plain vanilla:
	setAttribute_Matrix4f: function(gl, data, layoutLocation = 0, instanced = false){
		return this.setAttributeHelper(gl, data, [4,4,4,4], layoutLocation, instanced);
	},
	setAttribute_Matrix3f: function(gl, data, layoutLocation = 0, instanced = false){
		return this.setAttributeHelper(gl, data, [3,3,3], layoutLocation, instanced);
	},
	setAttribute_Matrix2f: function(gl, data, layoutLocation = 0, instanced = false){
		return this.setAttributeHelper(gl, data, [2,2], layoutLocation, instanced);
	},
	// matrices - instanced:
	setAttribute_Matrix4f_instanced: function(gl, data, layoutLocation = 0){
		return this.setAttribute_Matrix4f(gl, data, layoutLocation, true);
	},
	setAttribute_Matrix3f_instanced: function(gl, data, layoutLocation = 0){
		return this.setAttribute_Matrix3f(gl, data, layoutLocation, true);
	},
	setAttribute_Matrix2f_instanced: function(gl, data, layoutLocation = 0){
		return this.setAttribute_Matrix2f(gl, data, layoutLocation, true);
	},
	
	// vetrocs - plain vanilla:
	setAttribute_1f: function(gl, data, layoutLocation = 0, instanced = false){
		return this.setAttributeHelper(gl, data, [1], layoutLocation, instanced);
	},
	setAttribute_2f: function(gl, data, layoutLocation = 0, instanced = false){
		return this.setAttributeHelper(gl, data, [2], layoutLocation, instanced);
	},
	setAttribute_3f: function(gl, data, layoutLocation = 0, instanced = false){
		return this.setAttributeHelper(gl, data, [3], layoutLocation, instanced);
	},
	setAttribute_4f: function(gl, data, layoutLocation = 0, instanced = false){
		return this.setAttributeHelper(gl, data, [4], layoutLocation, instanced);
	},
	// vectors - instanced:
	setAttribute_1f_instanced: function(gl, data, layoutLocation = 0){
		return this.setAttribute_1f(gl, data, layoutLocation, true);
	},
	setAttribute_2f_instanced: function(gl, data, layoutLocation = 0){
		return this.setAttribute_2f(gl, data, layoutLocation, true);
	},
	setAttribute_3f_instanced: function(gl, data, layoutLocation = 0){
		return this.setAttribute_3f(gl, data, layoutLocation, true);
	},
	setAttribute_4f_instanced: function(gl, data, layoutLocation = 0){
		return this.setAttribute_4f(gl, data, layoutLocation, true);
	},
	
	// von aussen muessen NUR UND AUSSCHLIESSLICH setAttribute() und setAttribute_Instanced() aufgerufen werden!!!
	//  alle anderen Methoden wie setAttribute_3f_instanced() und die ganzen anderen sind nur helfer.
	// EINZIGE AUSNAHME: wenn ein mat2 erzeugt werden soll. mat2 hat eine data.length von 4,
	// und ist somit nicht von einem vec4 zu unterscheiden. diese methode nimmt
	// bei einer data.length == 4 an, dass ein vec4 erstellt werden soll
	// (was in den allermeisten faellen auch das erwuenschte verhalten ist):
	
	// GAAANZ WICHTIG: diese Methode bekommt eine layoutLocation uebergeben und gibt
	// die layoutLocation zurueck, die als nachestes wieder frei ist und mit weiteren
	// daten gefuettert werden kann. 
	// Z.B: wenn layoutLocation == 0 reinkommt und data.length == 16 -> return layoutLocation == 4
	// 		Erklaerung: bei data.length wird ein mat4 erzeugt, bestehend aus 4 vec4. also werden die
	// layout locations 0,1,2,3 belegt -> die naechste belegbare layoutLocation ist dann die 4
	setAttribute: function(gl, data, dataSizes, layoutLocation = 0, instancing = false){
		if( !data || !dataSizes ){
			console.error('in ShaderCreator.setAttribute: data is INVALID!: data: ', data, '	dataSizes: ', dataSizes);
			console.trace();
		}
		return this.setAttributeHelper(gl, data, dataSizes, layoutLocation, instancing);
	},
	
	// setAttribute_Instanced benoetigt dataLength: damit weiss es, ob es
	// z.B. ein mat4 erzeugen soll. das ist nur anhand des data-arrays nicht
	// erkennbar, denn beim instancing wird z.B. fuer den fall einer mat4
	// das vielfache von 16 als array uebergeben: sollen 10 instanzen 
	// erzeugt werden -> data.length == 10 * 16 == 160
	
	// wie man sieht nutzt setAttribute_Instanced die normale setAttribute
	// daher ist setAttribute_Instanced lediglich dazu da, um beim aufrufen im code
	// klarzustellen, dass man das attribut als instanced verwenden will.
	setAttribute_Instanced: function(gl, data, dataLength, layoutLocation = 0){
		switch (dataLength){
			case 16:
				return this.setAttribute(gl, data, [4,4,4,4], layoutLocation, true);
//				return this.setAttribute_Matrix4f(gl, data, layoutLocation, true);
				break;
			case 9:
				return this.setAttribute(gl, data, [3,3,3], layoutLocation, true);
//				return this.setAttribute_Matrix3f(gl, data, layoutLocation, true);
				break;
			case 4:
				return this.setAttribute(gl, data, [4], layoutLocation, true);
//				return this.setAttribute_4f(gl, data, layoutLocation, true);
				break;
			case 3:
				return this.setAttribute(gl, data, [3], layoutLocation, true);
//				return this.setAttribute_3f(gl, data, layoutLocation, true);
				break;
			case 2:
				return this.setAttribute(gl, data, [2], layoutLocation, true);
//				return this.setAttribute_2f(gl, data, layoutLocation, true);
				break;
			case 1:
				return this.setAttribute(gl, data, [1], layoutLocation, true);
//				return this.setAttribute_1f(gl, data, layoutLocation, true);
				break;
			default:
				console.error('in ShaderCreator.setAttribute: data is INVALID!: ', data);
				console.trace();
		}
	},
	
//	-------------------------------------------------------------------------------------------
	
	// setUniform ist die allgemeine funktion, die die uniforms setzt und dafuer die daten zur entsprechenden spezifischen funktion weiterleitet
	// z.B. wenn data = [0,0,0] ist (also ein 3-elemente-array), dann wird es an setUniform3fv weitergeleitet.
	// WICHTIG: es werden AUSSCHLIESSLICH floats verwendet, da es kaum machbar ist, in JavaScript zwischen float und int zu unterscheiden
	// -> 1. let x = 1.0 ~> wird zu 1 umgewandelt und kann dann mit keiner Methode der Welt mehr gecheckt werden obs urspruenglich ein float war
	// -> 2. data MUSS ZWINGEND EIN ARRAY SEIN!!! AUSSER wenn als uniform ein einfacher float gesetzt werden will, dann darfs auch ein
	// typeof data == 'Number' sein!:
	setUniform: function(gl, shaderProgram, uniform){
		let uniformName = uniform.name;
		let data 		= uniform.data;
		let offset		= uniform.offset;
		let asVector 	= !!uniform.asVector;
		if( !uniformName ){
			console.error('in ShaderCreator.setUniform: uniformName is Invalid: uniformName: ' + uniformName + '	data: ' + data);
			console.trace();
		}
		if(typeof data == 'Number'){
			return this.setUniform1fv(gl, shaderProgram, uniformName, [data]);
		}
		if( !data || data.length === 0){
			console.error('in ShaderCreator.setUniform: data is Invalid: data: ' + data + '	uniformName: ', uniformName);
			console.trace();
		}
		let dataOffset = !!offset ? offset : data.length;
		switch(dataOffset){
			case 1:
				this.setUniform1fv(gl, shaderProgram, uniformName, data, asVector);
				break;
			case 2:
				this.setUniform2fv(gl, shaderProgram, uniformName, data, asVector);
				break;
			case 3:
				this.setUniform3fv(gl, shaderProgram, uniformName, data, asVector);
				break;
			case 4:
				this.setUniform4fv(gl, shaderProgram, uniformName, data, asVector);
				break;
			case 9:
				this.setUniformMatrix3fv(gl, shaderProgram, uniformName, data, asVector);
				break;
			case 16:
				this.setUniformMatrix4fv(gl, shaderProgram, uniformName, data, asVector);
				break;
			default:
				console.error('in ShaderCreator.setUniform: uniformName: ' + uniformName + '	data: ' + data);
				console.trace();
		}
	},
	// setUniforms: setzt gleich ein ganzes array an uniforms, indem es setUniform (ohne s) jeweils aufruft:
	setUniforms: function(gl, shaderProgram, uniforms){
		for(let i=0; i < uniforms.length; ++i){			
			// ShaderFactory.setUniform checkt selbst, ob uniformName und uniformData valide sind, muss hier also nicht getan werden:
			this.setUniform(gl, shaderProgram, uniforms[i]);
		}
	},
//	-------------------------------------------------------------------------------------------

	setModel: function(gl, shaderProgram, modelMatrix, name='model'){
		ShaderFactory.setUniformMatrix4fv(gl, shaderProgram, name, modelMatrix);
	},
	setView: function(gl, shaderProgram, viewMatrix, name='view'){
		ShaderFactory.setUniformMatrix4fv(gl, shaderProgram, name, viewMatrix);
	},
	setProjection: function(gl, shaderProgram, projectionMatrix, name='proj'){
		ShaderFactory.setUniformMatrix4fv(gl, shaderProgram, name, projectionMatrix);
	},

//	-------------------------------------------------------------------------------------------

	setUniformMatrix4fv: function(gl, shaderProgram, uniformName, dataMatrix, asVector = false){
//		this.checkDataArrayLength(dataMatrix, 16, 'setUniformMatrix4fv');
		
		var uniformLocation = gl.getUniformLocation(shaderProgram, uniformName);
		gl.uniformMatrix4fv (uniformLocation, false, new Float32Array(dataMatrix));
	},
	setUniformMatrix3fv: function(gl, shaderProgram, uniformName, dataMatrix, asVector = false){
//		this.checkDataArrayLength(dataMatrix, 9, 'setUniformMatrix3fv');
		
		var uniformLocation = gl.getUniformLocation(shaderProgram, uniformName);
		gl.uniformMatrix3fv(uniformLocation, false, new Float32Array(dataMatrix));
	},
	
//	-------------------------------------------------------------------------------------------

	setUniform4fv: function(gl, shaderProgram, uniformName, dataVector, asVector = false){
//		this.checkDataArrayLength(dataVector, 4, 'setUniform4fv');
		
		var uniformLocation = gl.getUniformLocation(shaderProgram, uniformName);
		gl.uniform4fv(uniformLocation, new Float32Array(dataVector));
	},
	setUniform3fv: function(gl, shaderProgram, uniformName, dataVector, asVector = false){
//		this.checkDataArrayLength(dataVector, 3, 'setUniform3fv');
		
		var uniformLocation = gl.getUniformLocation(shaderProgram, uniformName);
		
		gl.uniform3fv(uniformLocation, new Float32Array(dataVector));		
	},
	setUniform2fv: function(gl, shaderProgram, uniformName, dataVector, asVector = false){
//		this.checkDataArrayLength(dataVector, 2, 'setUniform2fv');
			
		var uniformLocation = gl.getUniformLocation(shaderProgram, uniformName);
		gl.uniform2fv(uniformLocation, new Float32Array(dataVector));
	},
	setUniform1fv: function(gl, shaderProgram, uniformName, dataVector, asVector = false){
//		this.checkDataArrayLength(dataVector, 1, 'setUniform1fv');
			
		var uniformLocation = gl.getUniformLocation(shaderProgram, uniformName);
		gl.uniform1fv(uniformLocation, new Float32Array(dataVector));
	},
	
	checkDataArrayLength: function(data, requiredLength, functionName){
		if(!data || data.length !== requiredLength){
			console.error('in ShaderCreator.' + functionName + ': data.length !== ' + requiredLength + '	data:' + data);
			console.trace();
		}
			
	},
	
//	-------------------------------------------------------------------------------------------
	
	createShaderProgram: function(gl, vertexShaderSource, fragmentShaderSource){
		let vertexShader 	 = this.createShader(gl, gl.VERTEX_SHADER  , vertexShaderSource);
		let fragmentShader   = this.createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
		
		if( !vertexShader ){
			console.error('in ShaderCreator.createShaderProgram: vertexShader is : ' 
						  + vertexShader + '	-> vertexShaderSource: ' + vertexShaderSource);
			return;
		}
		
		if( !fragmentShader ){
			console.error('in ShaderCreator.createShaderProgram: fragmentShader is : '
						  + fragmentShader + '	-> fragmentShaderSource: ' + fragmentShaderSource);
			return;
		}		
		
		let program = this.createProgram(gl, vertexShader, fragmentShader);
		
		return {
			vertexShader,
			fragmentShader,
			program,
		};
	},
	
	createShader: function(gl, type, source) {
	  	var shader = gl.createShader(type);
	  	gl.shaderSource(shader, source);
	  	gl.compileShader(shader);
	  	var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
	  	if (success) {
			return shader;
		}

  		console.error(gl.getShaderInfoLog(shader));  // eslint-disable-line
  		console.trace();
  		gl.deleteShader(shader);
  		return undefined;
	},

	createProgram: function(gl, vertexShader, fragmentShader) {
	  	var program = gl.createProgram();
	  	gl.attachShader(program, vertexShader);
	  	gl.attachShader(program, fragmentShader);
	  	gl.linkProgram(program);
	  	var success = gl.getProgramParameter(program, gl.LINK_STATUS);
	  	if (success) {
	    	return program;
	  	}
	
	  	console.error(gl.getProgramInfoLog(program));  // eslint-disable-line
	  	console.trace();
	  	
	  	gl.deleteProgram(program);
	  	return undefined;
	},
}

export { ShaderFactory };

