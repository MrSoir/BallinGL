import './gl-matrix.js';
import {m4,v4, v3, MathBD} from "./MathBD.js";

import {StringParserBD} from './StringParserBD.js';

var GLSL_Functions = {
	getAmbientDiffuseSpecularGLSLFunction: function(ambientFctr = 0.3, specularPower = 32.0){
		let lightningCode = 
`
	vec4 ambientDiffuseSpecular(vec3 FragPos, vec3 Normal, 
						   		vec3 lightPos, vec3 lightCol, 
						   		vec3 cameraPos, 
						   		vec4 objCol){
		vec3 objCol_3 = vec3(objCol.xyz);
		vec3 ligthDir = normalize(lightPos - FragPos);
		
		// ambient:
		float ambientFctr = {x};
	  	vec3 ambient = ambientFctr * lightCol;
	  	
	  	// diffuse:
	  	float diffuseFctrMinimizer = 0.5;
	  	vec3 norm = normalize(Normal);
		vec3 lightDir = normalize(lightPos - FragPos);
		float diffuseFctr = max( dot(norm, ligthDir), 0.0 ) * diffuseFctrMinimizer;
		vec3 diffuse = diffuseFctr * lightCol;
		
		// specular:
		float specularStrength = 0.5;
		vec3 viewDir = normalize(cameraPos - FragPos);
		vec3 reflectDir = reflect(-lightDir, norm); 
		float spec = pow(max(dot(viewDir, reflectDir), 0.0), {x}); // specular-power wird hier gesetz!
		vec3 specular = specularStrength * spec * lightCol;
		
		vec3 targetCol = (ambient + diffuse) * objCol_3 + specular;// + specular * lightCol;
		return vec4(targetCol, objCol.a);
	    
/*	    // specular
	    float specularStrength = 0.5;
	    vec3 viewDir = normalize(cameraPos - FragPos);
	    vec3 reflectDir = reflect(-lightDir, norm);  
	    float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32);
	    vec3 specular = specularStrength * spec * lightColor;  
	        
	    vec3 result = (ambient + diffuse + specular) * objectColor;
	    FragColor = vec4(result, 1.0);*/
	}
`;
		lightningCode = GLSL_Functions.StrReplacer(lightningCode, 
												   StringParserBD.numberToFloatStr(ambientFctr),
												   StringParserBD.numberToFloatStr(specularPower));
		return lightningCode;
	},
	
	// StrReplacer: man uebergibt ihm einen glsl-code (source->string) und in diesem code werden 
	// die teile '{x}' ersetzt durch die replacements (strings):
	StrReplacer: function(source,...replacements){
	  let reg = '{x}';
	  let cntr = 0;
	  let replSize = replacements.length;
	  while(source.indexOf(reg) > -1 &&
	        cntr < replSize){
	    source = source.replace(reg, replacements[cntr]);
	    cntr++;
	  }
	  return source;
	},
}

export {GLSL_Functions};