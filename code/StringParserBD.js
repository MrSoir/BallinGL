
let StringParserBD = {
	numberToFloatStr: function(x){
	  	let fltStr = x.toString();
	  	if( !fltStr.includes('.') ){
	    	fltStr = fltStr + '.0';
	  	}
	 	return fltStr;
	},
	
	// getValidStr geht davon aus, dass ein string angeliefert wird,
	// korrigiert nur, falls dieser undefined oder null ist:
	getValidStr: function(str){
		return !!str ? str : '';
	},
};

export {StringParserBD};