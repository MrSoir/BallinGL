import {xxx} from '/script2.js';

function setTag(id, val=1){
	let tag = document.getElementById(id);
  tag.innerHTML = id + ': ' + val;
}

function main(){
	console.log('hallo welt');
  
	//setTag('alpha');
	//setTag('beta',2);
	//setTag('gamma',3);
  
	window.addEventListener('deviceorientation', (e)=>{
		//setTag('alpha', e.alpha);
	  	//setTag('beta', e.beta);
	  	//setTag('gamma', e.gamma);
	  	
	  	let offs = 100;
  	
		let dx = e.beta  / 90 * offs;
		let dy = e.gamma / 90 * offs;
		
		let x = offs - dx;
		let y = offs - dy;
		
		let ball = document.getElementById('ball');
		ball.style.background = 'blue';
		ball.style.left = x + 'px';
		ball.style.top = y + 'px';

        xxx.f('alpha', e.alpha);
        //xxx.f('beta', e.beta);
        //xxx.f('gamma', e.gamma);
  	});
}

main();
