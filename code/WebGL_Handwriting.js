"use strict";

/*
damit das hier laeuft:
	mit Python3:
	1. local server einrichten/starten: 'python3 -m http.server'
	2. im Browser folgende 'seite' aufrufen: 'http://localhost:8000/index.html'
	
	mit nodejs:
	1. local server einrichten/starten:
		1.1 zum ordner /home/bigdaddy/workspace_bluefish/BallinGL navigieren und im Terminal eingeben:
			'node /home/bigdaddy/workspace_bluefish/node_modules/http-server/bin/http-server'
	2. im Browser folgende 'seite' aufrufen: 'http://localhost:8080/'
		-> wichtig: bei chrome immer nach jeder code-veraenderung den cache leeren:
			2.1: '...' -> 'more tools...' -> 'clear browing data' -> 'cached images and files' loeschen, alles andere kann bleiben
				 am besten den reiter geoeffnet halten. zum loeschen einfach nur zum reiter gehen 
				 und 2 mal schnell auf enter drucken -> cache geleert!
*/

// da das programm derzeit auf dem localserver gestartet wird, muessen die imports mit den (fast vollstaendigen)
// dateipfaden angegeben werden:
import './gl-matrix.js';
import {MathBD,
		  m4, v4, v3,
		  genTransformationInfo} from './MathBD.js';
import {Camera} from './Camera.js';
import {Ball} from "./Ball.js";
import {Ballin} from './Ballin.js';
import {BallinHelper} from './WebGL2Test.js';

var ballinMeta = {};
var ballinHelper;

function xBarChanged(val){
//	console.log(val);
	document.getElementById('xRangeTxt').value = this.value;
}

function sliderHandler(sliderId, outputId, callback){
	let slider = document.getElementById(sliderId);
	let output = document.getElementById(outputId);
	
	output.value = slider.value; // set default slider value
	
	slider.oninput = function() {
	    output.value = this.value;
	    callback(this.value);
	}
}

function setCameraX(val){
	ballinHelper.setCameraX(val);
}
function setCameraY(val){
	ballinHelper.setCameraY(val);
}
function setCameraZ(val){
	ballinHelper.setCameraZ(val);
}

function setCameraTargetX(val){
	ballinHelper.setCameraTargetX(val);
}
function setCameraTargetY(val){
	ballinHelper.setCameraTargetY(val);
}
function setCameraTargetZ(val){
	ballinHelper.setCameraTargetZ(val);
}

function createSlider(prnt, lblTxt, callback, initVal=0, min=-100, max=100, step=1){	
/*	<input type="text" value="x:" id="xRangeLblTxt" class="rangeTxt" align="bottom">
	<input type="range" min="-100" max="100" value="0" class="slider" id="xRange"></input>
	<input type="text" value="1" id="xRangeTxt" class="rangeTxt"><br>*/
	
	let sldr = document.createElement('input');
	sldr.type = 'range';
	sldr.min = min.toString();
	sldr.max = max.toString();
	sldr.step = step;
	sldr.value = initVal.toString();
	sldr.className = 'slider';
	
	let lbl = document.createElement('input');
	lbl.type = 'text';
	lbl.value = lblTxt;
	lbl.className = 'rangeTxt';
	
	let valLbl = document.createElement('input');
	valLbl.type = 'text';
	valLbl.value = initVal.toString();
	valLbl.className = 'rangeTxt';
	
	sldr.oninput = function() {
		valLbl.value = this.value;
	   if(callback !== undefined)
			callback(this.value);
	}

	prnt.appendChild(lbl);
	prnt.appendChild(sldr);
	prnt.appendChild(valLbl);
	prnt.appendChild(document.createElement('br'));
	return sldr;
}
function createSliders(){
	let sldrContr = document.getElementById('slidercontainer');
/*	createSlider(sldrContr, 'x:', (val)=>{setCameraX(Number(val));});
	createSlider(sldrContr, 'y:', (val)=>{setCameraY(Number(val));});
	createSlider(sldrContr, 'z:', (val)=>{setCameraZ(Number(val));});
	
	createSlider(sldrContr, 'tarX:', (val)=>{setCameraTargetX(Number(val));});
	createSlider(sldrContr, 'tarY:', (val)=>{setCameraTargetY(Number(val));});
	createSlider(sldrContr, 'tarZ:', (val)=>{setCameraTargetZ(Number(val));});*/
	
	createSlider(sldrContr, 'lightX:', (val)=>{ballinHelper.setLightX(Number(val));},  10, -100, 100);
	createSlider(sldrContr, 'lightY:', (val)=>{ballinHelper.setLightY(Number(val));},   0, -100, 100);
	createSlider(sldrContr, 'lightZ:', (val)=>{ballinHelper.setLightZ(Number(val));}, -10, -100, 100);
	
	createSlider(sldrContr, 'lightRed:'  , (val)=>{ballinHelper.setLightRed  (Number(val));},  1, 0, 1, 0.01);
	createSlider(sldrContr, 'lightGreen:', (val)=>{ballinHelper.setLightGreen(Number(val));},  1, 0, 1, 0.01);
	createSlider(sldrContr, 'lightBlue:' , (val)=>{ballinHelper.setLightBlue (Number(val));},  1, 0, 1, 0.01);
	
	createSlider(sldrContr, 'moveSnsty:' , (val)=>{ballinHelper.setMoveSensitivity(Number(val));},  ballinHelper.getMoveSensitivity(), 0.01, 2, 0.01);
	createSlider(sldrContr, 'lookSnsty:' , (val)=>{ballinHelper.setLookSensitivity(Number(val));},  ballinHelper.getLookSensitivity(), 0.0001, 0.004, 0.0001);

}

function setKeyListeners(){
	document.addEventListener('keydown', (event) => {
		const keyName = event.key;
	
		if (keyName === 'Control') {
			// do not alert when only Control key is pressed.
			return;
		}
	
		if (event.ctrlKey) {
			// Even though event.key is not 'Control' (e.g., 'a' is pressed),
			// event.ctrlKey may be true if Ctrl key is pressed at the same time.
//			console.log(`Combination of ctrlKey + ${keyName}`);
		} else {
			switch(keyName){
				case 'w':
					ballinHelper.moveForward();
					break;
				case 'ArrowUp':
					ballinHelper.lookUp();
					break;
				case 'ArrowDown':
					ballinHelper.lookDown();
					break;
				case 'e':
					ballinHelper.moveUp();
					break;
				case 'q':
					ballinHelper.moveDown();
					break;
				case 's':
					ballinHelper.moveBackward();
					break;
				case 'a':
					ballinHelper.moveLeft();
					break;
				case 'ArrowLeft':
					ballinHelper.turnLeft();
					break;
				case 'd':
					ballinHelper.moveRight();
					break;
				case 'ArrowRight':
					ballinHelper.turnRight();
					break;
					
				case 'j':
					ballinHelper.lightLeft();
					break;
				case 'l':
					ballinHelper.lightRight();
					break;
				case 'k':
					ballinHelper.lightBackward();
					break;
				case 'i':
					ballinHelper.lightForward();
					break;
				case 'u':
					ballinHelper.lightUp();
					break;
				case 'o':
					ballinHelper.lightDown();
					break;
				case 'x':
					ballinHelper.moveMagnetLeft();
					break;
				case 'y':
					ballinHelper.moveMagnetRight();
					break;
				case 'p':
					pauseOrResumeGame();
					break;
				case 'c':
					ballinHelper.setCameraAutoRotation();
					break;
/*				default:
					console.log(`Key pressed ${keyName}`);*/
			}
		}
	}, false);
}

let ballinMouseMoveLstnr;

function setMouseMoveBallin(){
	let lastPos;
	let cnvs = document.getElementById('canvas');
	
	let lastMoveTime = window.performance.now();
	
	let enoughTimeElapsedForRevaluation = () => {
		
		let curTime = window.performance.now();
		
		let diff = curTime - lastMoveTime;
		
		if(diff > 30){
			lastMoveTime = curTime;
			return true;
		}
		return false;
	};
	
	let ballinPosHndlr = (x, y) => {		
		if( enoughTimeElapsedForRevaluation() ){
		
			let canvasBounds = cnvs.getBoundingClientRect();
			
			if( !!lastPos ){			
				let xOffset = x - lastPos.x;
				let yOffset = y - lastPos.y;
				
				ballinHelper.setMousePos({x,y}, canvasBounds);
			}
		}
		lastPos = {x,y};
	};
	
	let ballinMouseMoveLstnr = (evnt) => {
			let x = evnt.clientX;
			let y = evnt.clientY;
			
			ballinPosHndlr(x,y);
	};

	let ballinTouchHndlr = (evnt) => {
		let x = evnt.touches[0].clientX;
		let y = evnt.touches[0].clientY;
		ballinPosHndlr(x,y);
	}
	let ballinTouchedHndlr = (evnt) => {
		let x = evnt.changedTouches[0].clientX;
		let y = evnt.changedTouches[0].clientY;
		ballinPosHndlr(x,y);
	}
	
	document.onmousemove  = ballinMouseMoveLstnr;
	document.ontouchstart = ballinTouchHndlr;
	document.ontouchmove  = ballinTouchedHndlr;
	
	// on mobile devices: controll balls via device rotation:
	if( window.DeviceMotionEvent ){
		let deviceOrientationHandler = (evnt) => {
			let dx = evnt.beta;
			let dy = -evnt.gamma;
	
			if( enoughTimeElapsedForRevaluation() && !!dx && !!dy ){
				ballinHelper.setRelMousePos(dx, dy);
			}
		}
		window.ondeviceorientation = deviceOrientationHandler;
	}
}

function setMouseTracker(){
	let mt = document.getElementById('canvas');
	
	let getMousePos = function(obj, mouseEvent){
		let rect = obj.getBoundingClientRect();
		return {
			x: mouseEvent.clientX - rect.left,
			y: mouseEvent.clientY - rect.top,
		};
	};
	mt.addEventListener('mousedown', (evnt)=>{
		let lastPos = {x: evnt.clientX,
					   y: evnt.clientY};
		
		document.onmousemove = (evnt) => {
			let x = evnt.clientX;
			let y = evnt.clientY;
			
			let xOffset = x - lastPos.x;
			let yOffset = y - lastPos.y;
			
			lastPos.x = x;
			lastPos.y = y;
			
			ballinHelper.setViewOffset({x: xOffset, 
										y: yOffset});
		}
		document.onmouseup = () => {
			document.onmouseup = null;
			document.onmousemove = null;
			
			setMouseMoveBallin();
		};
	}, false);
}

function updateLevel(level){	
	document.getElementById('levelRng').value = level+1;
	document.getElementById('levelRngOut').value = level+1;
}

function setInputTagBehaviour(){
	let levelRng = document.getElementById('levelRng');
	levelRng.oninput = ()=>{document.getElementById('levelRng')
		document.getElementById('levelRngOut').value = levelRng.value;
		ballinHelper.setLevel(Number(levelRng.value) - 1); // -1, da auf 0 indexiert wird, der slider aber auf 1 indexiert
	};
	
	let speedRng = document.getElementById('speedRng');
	speedRng.oninput = ()=>{
		ballinHelper.setSpeed(Number(speedRng.value));
	};
	
	let particleRng = document.getElementById('particleRng');
	particleRng.value = Ball.particleFctr;//ballinHelper.getParticleFactor();
	particleRng.oninput = ()=>{
		Ball.particleFctr = Number(particleRng.value);
//		ballinHelper.setParticleFactor(Number(particleRng.value));
	};

	let pauseBtn = document.getElementById('pauseTglBtn');
	pauseBtn.onclick = (val)=>{
		if(pauseBtn.checked){
			pauseGame();
		}else{
			proceedGame();
		}
	};
}

window.onresize = function(event) {
	if( !!ballinHelper ){
		ballinHelper.resize();
	}
};
function main() {
	console.log('in main!');	

	ballinHelper = new BallinHelper();
	ballinHelper.setLevelUpdater( updateLevel );
	
	setKeyListeners();
	setMouseTracker();
	setMouseMoveBallin();
	
//	createSliders();

	setInputTagBehaviour();
	
	startGameLoop();
}
/*function updateTime(){
	let curTime = window.performance.now();
	let dt = curTime - lastTime;
	
	console.log('dt: ', dt);
	console.log('typeof dt: ', typeof dt);
	console.log('curTime:  ', curTime);
	console.log('lastTime: ', lastTime);
	
	lastTime = curTime;
}*/

	let lastRenderTime = undefined;
	let lastMoveTime = undefined;
	let gameLoopInterrupted = false;
	let gamePaused = false;

function startGameLoop(){
	lastRenderTime = window.performance.now();
	lastMoveTime = lastRenderTime;
	
	gameLoop();
}

function gameLoop(curTime){
	
	if( !gameLoopInterrupted )
		ballinHelper.stopMain = window.requestAnimationFrame( gameLoop );
	
	let dt_render = curTime - lastRenderTime;
	let dt_move   = curTime - lastMoveTime;
	
	if(dt_render > 16){
		
		if( !gamePaused ){
			ballinHelper.moveGame(dt_render, true);
		}else{
			ballinHelper.justRender(dt_render, true);
		}

		lastRenderTime = curTime;
	}
	lastMoveTime = curTime;
}

function proceedGame(){
	gamePaused = false;
}
function pauseGame(){
	gamePaused = true;
}
function pauseOrResumeGame(){
	gamePaused = !gamePaused;
	document.getElementById('pauseTglBtn').checked = gamePaused;
}

function interruptGameLoop(){
	if( gameLoopInterrupted ){
		proceed();
	}else{
		pause();
	}
}


//------------------------------------------------------------------

//main();

document.addEventListener('DOMContentLoaded', function() {
	console.log('document loaded -> starting main loop!');
   main();
}, false);

