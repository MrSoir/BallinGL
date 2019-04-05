

var STL_Parser = {
	parse: function(meshStr){
		let vertices = [];
		let normals = [];
		let verticesWithNormals = [];
		let lines = meshStr.split('\n');
		
		lines.forEach((line)=>{
			let words = line.split(' ');
			if(words.length >= 4){
				if(words[0] === 'vertex'){
					vertices.push( Number(words[1]), Number(words[2]), Number(words[3]) );
				}else if (words[0] === 'facet'){
					normals.push( Number(words[2]), Number(words[4]), Number(words[3]) );
				}
			}
		});
		
		verticesWithNormals = STL_Parser.combineVerticesWithNormals(vertices, normals);
		
		return {
			vertices,
			normals,
			verticesWithNormals,
		};
	},
	
	parsePLY: function(meshStr){
		let verticesUo = [];
		let normalsUo = [];
		let vertices = [];
		let normals = [];
		
		let verticesWithNormals = [];
		let lines = meshStr.split('\n');
		
		let addVertices = false;
		let orderVertices = false;
		
		lines.forEach((line)=>{
			let words = line.split(' ');
			
			if(addVertices){
				if(words.length === 6){
					verticesUo.push( [Number(words[0]), Number(words[1]), Number(words[2])] );
					normalsUo .push( [Number(words[3]), Number(words[4]), Number(words[5])] );
				}else{
					addVertices = false;
					orderVertices = true;
				}
			}
			
			if(orderVertices && words.length === 4){
				let id1 = Number(words[1]);
				let id2 = Number(words[2]);
				let id3 = Number(words[3]);
				
/*				console.log('verticesUo: ', verticesUo);
				console.log('normalsUo: ', normalsUo);
				
				console.log('id1: ', id1);
				console.log('id2: ', id2);
				console.log('id3: ', id3);*/
				
				vertices.push( verticesUo[id1][0], verticesUo[id2][1], verticesUo[id3][2] );
				normals.push(   normalsUo[id1][0],  normalsUo[id2][1],  normalsUo[id3][2] );
				
				verticesWithNormals.push( verticesUo[id1][0], verticesUo[id2][1], verticesUo[id3][2],
										   normalsUo[id1][0],  normalsUo[id2][1],  normalsUo[id3][2] );
			}
			
			
			if(words.length > 0){
				if(words[0] === 'end_header')
					addVertices = true;
			}
		});
		
//		verticesWithNormals = STL_Parser.combineVerticesWithNormals(vertices, normals);
		
		return {
			vertices,
			normals,
			verticesWithNormals,
		};
	},
	
	parseOBJ: function(meshStr, print = false){
		// WICHTIG: KONVENTIO: in Blender: Forward: -Z | UP: Y
		let verticesUo = [];
		let normalsUo = [];
		let vertices = [];
		let normals = [];
		let verticesWithNormals = [];
		
		let lines = meshStr.split('\n');
		
		lines.forEach((line)=>{
			let words = line.split(' ');
			
			if(words.length >= 4){
				if(words[0] === 'v'){
					verticesUo.push( [Number(words[1]), Number(words[2]), Number(words[3])] );
				}else if(words[0] === 'vn') { 
					 normalsUo.push( [Number(words[1]), Number(words[2]), Number(words[3])] );
				}else if(words[0] === 'f') {
					
					let addVertices = (vs, ns)=>{
						for(let j=0; j < 3; ++j){
							vertices.push( vs[j][0], vs[j][1], vs[j][2] );
							 normals.push( ns[j][0], ns[j][1], ns[j][2] );
							verticesWithNormals.push( vs[j][0], vs[j][1], vs[j][2],
													  ns[j][0], ns[j][1], ns[j][2] );
						}
					};
					
					let getVecNormPairIds = (i)=>{
						let pair = words[i];
						let pairs = pair.split('/');
						let vId = Number(pairs[0]) -1; // blender indexiert obj auf 1, nicht auf 0!!!
						let nId = Number(pairs[pairs.length-1]) -1;
						return [vId, nId];
					};
					
					let [v1Id,n1Id] = getVecNormPairIds(1);
					let [v2Id,n2Id] = getVecNormPairIds(2);
					let [v3Id,n3Id] = getVecNormPairIds(3);
					
					let v1 = verticesUo[v1Id];
					let v2 = verticesUo[v2Id];
					let v3 = verticesUo[v3Id];
					
					let n1 = normalsUo[n1Id];
					let n2 = normalsUo[n2Id];
					let n3 = normalsUo[n3Id];
					
					addVertices([v1,v2,v3], [n1,n2,n3]);
					
/*					for(let i=2; i < words.length-1; ++i){
						let [viId, niId] = getVecNormPairIds(i);
						let [vjId, njId] = getVecNormPairIds(i+1);
						
						let vi = verticesUo[viId];
						let ni = normalsUo[niId];
						
						let vj = verticesUo[vjId];
						let nj = normalsUo[njId];
						
						addVertices([v1,vi,vj], [n1,ni,nj]);
					}
					*/
					
					
/*					if(words.length > 4){
						let [v4Id,n4Id] = getVecNormPairIds(4);
						
						let v4 = verticesUo[v4Id];
						let n4 = normalsUo [n4Id];
						
						addVertices([v1,v3,v4], [n1,n3,n4]);
					}*/
				}
			}
		});
		
		if(print){
			console.log('vertices: ', vertices);
			console.log('normals: ', normals);
			console.log('verticesWithNormals: ', verticesWithNormals);
		}
		
		return {
			vertices,
			normals,
			verticesWithNormals,
		};
	},
	
	combineVerticesWithNormals: function(vertices, normals){
		let verticesWithNormals = [];
		if(vertices.length > 0){
			let cntr = 0;
			for(let i=0; i < vertices.length; i+=3){
				verticesWithNormals.push( vertices[i], vertices[i+1], vertices[i+2],
										  normals[cntr], normals[cntr+1], normals[cntr+2] );
				cntr += 3;
			}
		}
		return verticesWithNormals;
	},
};

export {STL_Parser};