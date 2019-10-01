let Heron = {};
listVideoInputs();


ipcRenderer.on('loading', function(){
	addLoadingIcon('loadingIcon_Stream');
});

ipcRenderer.on('frame:written', function(e, data){
	Heron.project = data.project;
	
		const canvas = document.createElement('canvas');
		const id = document.createAttribute('id');
		id.value = 'tempCanvas';
		canvas.setAttributeNode(id);
	
		const ctx = canvas.getContext('2d');
		var image = new Image();
	console.log(image.src);
		image.src = data.imageData;
	console.log(image.src);
	console.log(image);
		image.onload = function(){
			ctx.drawImage(image, 0, 0);
		};
	
		let imageDataUrl = canvas.toDataURL('image/jpeg', 1.0);
		imageDataUrl = imageDataUrl.substr(23,imageDataUrl.length);
//	console.log(imageDataUrl);
	
//	Heron.camera.addToHistory('newFrame', data.frameNumber, imageDataUrl);
	Heron.camera.addFrameToTimeline(data.frameNumber, data.imageData);
});

ipcRenderer.on('frame:deleted', function(e, data){
	Heron.project = data.project;
	const deletedFrame = data.deletedFrame;
	const deletedFrameElement = document.getElementById('frame_'+deletedFrame);
	deletedFrameElement.parentNode.removeChild(deletedFrameElement);
	
	const deletedFrameNumberElement = document.getElementById('number_'+deletedFrame);
	deletedFrameNumberElement.parentNode.removeChild(deletedFrameNumberElement);
	for(i=deletedFrame+1;i<=Heron.project.shots[Heron.project.activeShot].takes[Heron.project.activeTake].frameCount+1;i++){
		Heron.camera.renameFrame(i, false);
	}
	
	document.getElementById('frameCount').innerHTML = Heron.project.shots[Heron.project.activeShot].takes[Heron.project.activeTake].frameCount;
});

ipcRenderer.on('take:load', function(e, project){
	const showStream = document.getElementById('show_stream');
	const timeline = document.getElementById('timeline');
	Heron.camera.playing = false;
	document.getElementById('frameCount').innerHTML = 0;
	Heron.project = project;
	timeline.innerHTML='';
	timeline.appendChild(showStream);
	changeFramerate(Heron.project.shots[Heron.project.activeShot].takes[Heron.project.activeTake].framerate);
	
	// Enable the play button if more than 2 frames
//	const frames = Heron.project.shots[Heron.project.activeShot].takes[Heron.project.activeTake].frames;
//	const frameCount = Object.keys(frames).length;
	document.getElementById('play').disabled = false;
	document.getElementById('take_pictures').disabled = false;
    Heron.camera.showStream();
});
ipcRenderer.on('frame:load', function(e, frame){
	Heron.camera.loadFrame(frame);
});


function openExportWindow() {
	ipcRenderer.send('window:export');
}

function openSettingsWindow() {
	let settings = {shortPlayDuration:Heron.camera.shortPlayDuration};
	
	console.log(settings);
	ipcRenderer.send('window:settings',settings);
}

function toggleDifferenceMode(){
	if(document.getElementById('difference').classList.contains('disabled')==true) {
		document.getElementById('difference').classList.remove('disabled');
		Heron.camera.differenceMode=true;
	} 
	else {
		document.getElementById('difference').classList.add('disabled');
		Heron.camera.differenceMode=false;
	}
	Heron.camera.changeOnion();
}

function toggleLoop(){
	if(document.getElementById('loop').classList.contains('disabled')==true) {
		document.getElementById('loop').classList.remove('disabled');
		Heron.camera.loop=true;
	} 
	else {
		document.getElementById('loop').classList.add('disabled');
		Heron.camera.loop=false;
	}
}

function toggleShortPlay(){
	if(document.getElementById('shortPlay').classList.contains('disabled')==true) {
		document.getElementById('shortPlay').classList.remove('disabled');
		Heron.camera.shortPlay=true;
	} 
	else {
		document.getElementById('shortPlay').classList.add('disabled');
		Heron.camera.shortPlay=false;
	}
}

function toggleReadLiveView(){
	
	console.log('heho'+Heron.camera.readLiveView);
	if(Heron.camera.readLiveView==true) {
		Heron.camera.readLiveView=false;
		document.getElementById('show_stream').style = 'color:var(--main-text-color);';
	}
	else {
		Heron.camera.readLiveView=true;
		document.getElementById('show_stream').style = 'color:transparent;';
	};
}


// OVERLAYS FUNCTIONS
function toggleOverlaysPopup() {	if(document.getElementById('overlaysMenu').style.display == 'none' || document.getElementById('overlaysMenu').style.display == '') {
		document.getElementById('overlaysMenu').style.display = 'block';
		document.getElementById('buttonOverlays').style.border = '3px var(--button-color) solid;';
	}
	else {
		document.getElementById('overlaysMenu').style.display = 'none';document.getElementById('buttonOverlays').style.border = 'none';
	}
}

function toggleThirds(){
	if(document.getElementById('buttonThirds').classList.contains('active')==true) {
		document.getElementById('buttonThirds').classList.remove('active');
		Heron.camera.overlays.thirds=false;
		document.getElementById('overlayThirdsSettings').style.display = 'none';
	} 
	else {
		document.getElementById('buttonThirds').classList.add('active');
		Heron.camera.overlays.thirds=true;
		document.getElementById('overlayThirdsSettings').style.display = 'block';	}
	Heron.camera.drawOverlays();
}
function toggleCenter(){
	if(document.getElementById('buttonCenter').classList.contains('active')==true) {
		document.getElementById('buttonCenter').classList.remove('active');
		Heron.camera.overlays.center=false;
	} 
	else {
		document.getElementById('buttonCenter').classList.add('active');
		Heron.camera.overlays.center=true;
	}
	Heron.camera.drawOverlays();
}
function toggleMargins(){
	if(document.getElementById('buttonMargins').classList.contains('active')==true) {
		document.getElementById('buttonMargins').classList.remove('active');
		Heron.camera.overlays.margins=false;
	} 
	else {
		document.getElementById('buttonMargins').classList.add('active');
		Heron.camera.overlays.margins=true;
	}
	Heron.camera.drawOverlays();
}
function toggleLetterbox(){
	if(document.getElementById('buttonLetterbox').classList.contains('active')==true) {
		document.getElementById('buttonLetterbox').classList.remove('active');
		Heron.camera.overlays.letterbox=false;
		document.getElementById('overlayLetterboxSettings').style.display = 'none';
	} 
	else {
		document.getElementById('buttonLetterbox').classList.add('active');
		Heron.camera.overlays.letterbox=true;
		document.getElementById('overlayLetterboxSettings').style.display = 'block';	}
	Heron.camera.drawOverlays();
}
function changeOverlaysOpacity() {
	Heron.camera.overlays.opacity = parseFloat(document.getElementById('overlayOpacity').value);
	Heron.camera.drawOverlays();
}
function changeOverlaysThirds() {
	Heron.camera.overlays.lines = parseInt(document.getElementById('overlayLines').value);
	Heron.camera.overlays.columns = parseInt(document.getElementById('overlayColumns').value);
	Heron.camera.drawOverlays();
}
function changeOverlaysRatio(select) {
	let value;
	if(select==true) {
		document.getElementById('overlayCustomRatio').style.display = 'none';
	}
	console.log(document.getElementById('overlayCustomRatio').style.display);
	if(document.getElementById('overlayCustomRatio').style.display == 'block') {
		value = document.getElementById('customRatio').value;
	}
	else {
		value = document.getElementById('overlayLetterboxRatio').value;
		
	}
	console.log(value);
	if(value == 'other') {
		document.getElementById('overlayCustomRatio').style.display = 'block';
	}
	else {
		
		Heron.camera.overlays.ratio = parseFloat(value);
	}
	Heron.camera.drawOverlays();
}



function changeFramerate(framerate) {
	if(framerate==undefined){ // Change via select
		framerate = document.getElementById('framerateSelection').value;
		ipcRenderer.send('project:framerate', framerate);
	}
	else { // Change received from main.js
		if(framerate!= 8 && framerate!= 12 && framerate!= 15 && framerate!= 17 && framerate!= 24 && framerate!= 25 && framerate!= 30) {// If not one of the default choices
			const framerateSelectionElement = document.getElementById('framerateSelection');
			
			// Remove if already existing
			if(document.getElementById('addedOption')!=null) {
				var element =document.getElementById('addedOption')
				element.parentElement.removeChild(element);
			}
			
			// Adds the option selection
			let newOption = document.createElement('option');
			newOption.value = framerate;
			newOption.id = 'addedOption';

			framerateSelectionElement.append(newOption);

			newOption.innerHTML = framerate;
			document.getElementById('framerateSelection').value = framerate;
		}
		else {
			document.getElementById('framerateSelection').value = framerate;
		}

//		Heron.project.frameRate = framerate;
		Heron.project.shots[Heron.project.activeShot].takes[Heron.project.activeTake].framerate = framerate;
	}
}
ipcRenderer.on('project:framerate', function(e, framerate){
	changeFramerate(framerate);
});
ipcRenderer.on('camera:setShortPlayValue', function(e, shortPlayValue){
	Heron.camera.shortPlayDuration = parseInt(shortPlayValue);
});

win.on('resize', function(){
	let bounds = win.getBounds();
	scaleViewer();
});

document.getElementById("buttonOverlays").addEventListener("click", toggleOverlaysPopup); 
//document.getElementById("overlaysMenu").addEventListener("mouseleave", toggleOverlaysPopup); 

document.getElementById("toolbar").addEventListener("keypress", function(e) {
    if(e.keyCode === 13){
       e.preventDefault();
   }
});

/* SHORTCUTS */
Mousetrap.bind('enter', function() {
	Heron.camera.take();
	return false;
}, 'keyup');
Mousetrap.bind(['space', '0'], function() {
	Heron.camera.play();
	return false;
});
Mousetrap.bind('8', function() {
	toggleLoop()
	return false;
});
Mousetrap.bind('7', function() {
	console.log('heho');
	toggleReadLiveView();
	return false;
});
Mousetrap.bind('6', function() {
	toggleShortPlay();
	return false;
});
Mousetrap.bind(['del','backspace'], function() {
	Heron.camera.deleteFrame();
	return false;
});
Mousetrap.bind('+', function() { // Increments onion skin value
	let onionValue = parseFloat(document.getElementById('onionBlending').value);
	
	if(onionValue<=0.9) {
		console.log('+0.1');
		document.getElementById('onionBlending').value=onionValue+0.1;
	}
	else {
		console.log('=>1');
		document.getElementById('onionBlending').value=1;
	}
	Heron.camera.changeOnion();
	return false;
});
Mousetrap.bind('-', function() { // Decrements onion skin value
	let onionValue = parseFloat(document.getElementById('onionBlending').value);
	
	if(onionValue>=0.1) {
		document.getElementById('onionBlending').value=onionValue-0.1;
	}
	else {
		document.getElementById('onionBlending').value=0;
	}
	Heron.camera.changeOnion();
	return false;
});

Mousetrap.bind(['left','1'], function() {
	const selectedImage = document.getElementsByClassName('selected');
	
	if(selectedImage!=undefined && selectedImage.length!=0){
		let selectedImageId = selectedImage[0].id;
		
		selectedImageId = parseInt(selectedImageId.substring(6, selectedImageId.length));
		console.log(selectedImageId);
		if(selectedImageId>1){
			Heron.camera.viewFrame(selectedImageId-1);
		}
	}
	else {
		Heron.camera.viewFrame(Heron.project.shots[Heron.project.activeShot].takes[Heron.project.activeTake].frameCount);
	}
});
Mousetrap.bind(['right','2'], function() {
	const selectedImage = document.getElementsByClassName('selected');
	
	if(selectedImage!=undefined && selectedImage.length!=0){
		let selectedImageId = selectedImage[0].id;
		
		selectedImageId = parseInt(parseInt(selectedImageId.substring(6, selectedImageId.length)));
		
		console.log(selectedImageId);
		if(selectedImageId<Heron.project.shots[Heron.project.activeShot].takes[Heron.project.activeTake].frameCount){
			Heron.camera.viewFrame(selectedImageId+1);
		}
		else {
			Heron.camera.showStream();
		}
	}
});
// Undo
//Mousetrap.bind(['command+z', 'ctrl+z'], function() {
//	console.log(Heron.camera.history);
//	if(Heron.camera.history.length>0){
//		let i=Heron.camera.history.length-1;
//		let lastAction = undefined;
//		while(i>=0 && lastAction==undefined){
//			if(Heron.camera.history[i].undone==false){
//				lastAction = Heron.camera.history[i];
//			}
//			else {
//				i--;
//			}
//		}
//		if(lastAction!=undefined) {
//			if(lastAction.action=='newFrame'){
//				Heron.camera.deleteFrame(lastAction.id);
//				Heron.camera.history[i].undone=true;
//			}
//			else if(lastAction.action=='deleteFrame'){
//				console.log('laid'+lastAction.id);
//				let data = {imageData:lastAction.data, position:lastAction.id, undelete:true}
//				ipcRenderer.send('camera:newFrame', data);
//				Heron.camera.history[i].undone=true;
//			}
//		}
//	}
//	return false;
//});
//// Redo
//Mousetrap.bind(['command+shift+z', 'ctrl+shift+z'], function() {
//	console.log(Heron.camera.history);
//	if(Heron.camera.history.length>0){
//		let i=0;
//		let undone = false;
//		let actionToRedo=undefined;
//		while(i<=Heron.camera.history.length-1 && undone==false){
//			undone = Heron.camera.history[i].undone;
//			if(undone==true){
//				actionToRedo = Heron.camera.history[i];
//			}
//			else {
//				i++;
//			}
//		}
//		if(actionToRedo!=undefined) {
//			if(actionToRedo.action=='newFrame'){
//				let data = {imageData:actionToRedo.data}
//				ipcRenderer.send('camera:newFrame', actionToRedo.data);
////				Heron.camera.addFrameToTimeline(actionToRedo.id,actionToRedo.data);
//				Heron.camera.history[i].undone=false;
//			}
//		}
//	}
//	return false;
//});

Mousetrap.bind(['command+e', 'ctrl+e','command+m', 'ctrl+m'], function() {
	ipcRenderer.send('window:export');
	return false;
});
Mousetrap.bind(['command+n', 'ctrl+n'], function() {
	ipcRenderer.send('project:createWindow');
	return false;
});
Mousetrap.bind(['shift+s', 'shift+s'], function() {
	ipcRenderer.send('project:shotWindow');
	return false;
});
Mousetrap.bind(['command+q', 'ctrl+q'], function() {
	app.quit();
	return false;
});
if(process.env.NODE_ENV !== 'production'){
	Mousetrap.bind(['command+i', 'ctrl+i'], function() {
		win.toggleDevTools();
		return false;
	});
}

window.onkeydown = function(e) {if(e.keyCode==16) {Heron.camera.shift = true;}}
window.onkeyup = function(e) {Heron.camera.shift = false; }