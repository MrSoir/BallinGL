import {GLSL_Functions} from "./GLSL_Functions.js";


function LightningCodeGenrator(lightningMeta){
		
//-------------------------------------------------------------------
	// VS:
	
	lightningMeta.VS_BefMain =
`
	layout (location = 1) in vec3 aNormal;
	out vec3 Normal;
	out vec3 FragPos;
`;

	lightningMeta.VS_Main_BefTrans =
`
	FragPos = vec3(model * vec4(pos, 1.0));
	Normal  = vec3(transpose(inverse(model)) * vec4(aNormal, 1.0));
`;

//------------------------------------------------------------
	// FS:
	
	lightningMeta.FS_BefMain =
`
	in vec3 FragPos;
	in vec3 Normal;
	uniform vec3 lightPos;
	uniform vec3 lightCol;
	uniform vec3 cameraPos;
	` + GLSL_Functions.getAmbientDiffuseSpecularGLSLFunction(lightningMeta.ambientFctr,
														 	 lightningMeta.specularPower);

	lightningMeta.FS_Main_BefLight = 
`
	ambientDiffuseSpecular(FragPos, Normal, 
					       lightPos, lightCol, 
						   cameraPos, 
						   colBefLight);
`;
};

export {LightningCodeGenrator};


