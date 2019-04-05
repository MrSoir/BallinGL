function createBuffer(gl, positions) {

	console.log("in createBuffer");
	// Create a buffer for the square's positions.

	const buffer = gl.createBuffer();

	// Select the positionBuffer as the one to apply buffer
	// operations to from here out.

	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

	// Now pass the list of positions into WebGL to build the
	// shape. We do this by creating a Float32Array from the
	// JavaScript array, then use it to fill the current buffer.

	gl.bufferData(gl.ARRAY_BUFFER,
					  new Float32Array(positions),
					  gl.STATIC_DRAW);

	return buffer;
}
function bindDataToBuffer(gl, data)
{
	gl.enableVertexAttribArray(data.vertexPosition);
	
	let buffer = createBuffer(gl, data.vertexArr);
	
/*	console.log('vertexPosition: ', data.vertexPosition);
	console.log('numComponents: ', data.numComponents);
	console.log('normalize: ', data.normalize);
	console.log('stride: ', data.stride);
	console.log('offset: ', data.offset);*/
	
	const type = gl.FLOAT;		// the data in the buffer is 32bit floats
	
	gl.vertexAttribPointer(
			data.vertexPosition,
			data.numComponents,
			type,
			data.normalize,
			data.stride, // 0 = use type and numComponents above
			data.offset);

}

export {createBuffer, bindDataToBuffer};