class Camera {
	constructor (label, deviceId, width, height) {
		this.label = label;
		this.deviceId = deviceId;
		this.width = width;
		this.height = height;
		this.ratio = width / height;
		this.loop = false;
		this.readLiveView = true;
		this.shortPlay = false;
		this.shortPlayDuration = 6;
		this.playing = false;
		this.differenceMode = false;
		this.history = [];
		this.shift = false;
		this.overlays = {
			opacity : 1,
			thirds : false,
			columns : 3,
			lines : 3,
			center : false,
			margins : false,
			letterbox : false,
			ratio : 1.78
		}
	}
	
	play(){
		if (this.playing == false && Heron.project.shots[Heron.project.activeShot].takes[Heron.project.activeTake].frameCount>0){ // If not playing : play ; se ne leganta : legu
			const frames = Heron.project.shots[Heron.project.activeShot].takes[Heron.project.activeTake].frames;
			const frameCount = Object.keys(frames).length;

			let frame=1; // Starting frame ; ekan bildon

			
			if(Heron.camera.shortPlay==true) frame = frameCount-this.shortPlayDuration;
			
			
			this.playing = true;
			document.getElementById("play").classList.add("playing");
			this.playFrame(frame, frameCount);
		}
		else { // If already playing : stop ; Se jam leganta : cxesu
			this.playing = false;
			document.getElementById("play").classList.remove("playing");
		}
	}
	
	playFrame(frame, frameCount) {
		if(this.playing == true) { // If not paused : Se ne cxesigita
			setTimeout(function () {
				if(frame<=frameCount){
					Heron.camera.viewFrame(frame);
				} else if(frame==frameCount+1 && Heron.camera.readLiveView==true) {
					Heron.camera.showStream();
				}
				frame++;
				if((frame<=frameCount+1  && Heron.camera.readLiveView==true) || (frame<=frameCount && Heron.camera.readLiveView==false)){
					Heron.camera.playFrame(frame, frameCount);
				}
				else if((frame==frameCount+2 && Heron.camera.loop==true && Heron.camera.readLiveView==true) || (frame==frameCount+1 && Heron.camera.loop==true && Heron.camera.readLiveView==false)) {
					// If loop : loop
					let frame=1; // Starting frame
					if(Heron.camera.shortPlay==true) frame = frameCount-Heron.camera.shortPlayDuration;

					Heron.camera.playFrame(frame, frameCount);
					
				}
				else {
					Heron.camera.playing = false;
					document.getElementById('play').classList.remove('playing');
				}

			}, 1000 / Heron.project.shots[Heron.project.activeShot].takes[Heron.project.activeTake].framerate);
		}
	}
	
	take(){
		const viewer = document.getElementById('viewerCanvas');
		const canvasContext = viewer.getContext('2d');
		const videoElement = document.getElementById('videoStream');
		
		const frameNumber = Heron.project.shots[Heron.project.activeShot].takes[Heron.project.activeTake].frameCount+1;

		// Animates the button ; animacias la butonon
		document.getElementById('take_pictures').classList.add('pictureTakenAnimation');
		setTimeout(function(){document.getElementById('take_pictures').classList.remove('pictureTakenAnimation');},500);

		//Draws the capture frame to the canvas ; Desegnas la bildo
		canvasContext.drawImage(videoElement, 0, 0, this.width, this.height);
		
		// Get the image data and sends it to the main script ; akiras la datumojn de la bildo kaj sendas gxin al la cxefa skripto
		let imageData = document.getElementById('viewerCanvas').toDataURL('image/jpeg', 1.0);
		imageData = imageData.substr(23,imageData.length);
		let data = {imageData:imageData};
		ipcRenderer.send('camera:newFrame', data);
		
//		this.addToHistory('newFrame', frameNumber, imageData);
	}
	
	drawOverlays() {
		// Draws the overlays on top of the viewer ; Desegnas la superajxoj
		const overlaysCanvas = document.getElementById('overlaysCanvas');
		const ctx = overlaysCanvas.getContext('2d');
		
		overlaysCanvas.style.opacity = this.overlays.opacity;
		ctx.clearRect(0, 0, overlaysCanvas.width, overlaysCanvas.height);
		
		ctx.fillStyle = "#ffffff";
		
		let strokeWidth=2;
		
		let bounds = win.getBounds();		
		if(bounds.height<=600){strokeWidth=5;}
		
		if (this.overlays.thirds==true) {
			for(i=1;i<=this.overlays.columns;i++){
				ctx.fillRect((this.width/this.overlays.columns)*i, 0, strokeWidth, this.height);
			}
			
			for(i=1;i<=this.overlays.lines;i++){
				ctx.fillRect(0, (this.height/this.overlays.lines)*i, this.width, strokeWidth);
			}
		}
		
		if (this.overlays.center==true) {
			ctx.fillRect((this.width/2)-5, this.height/2, 12, strokeWidth);
			ctx.fillRect(this.width/2, (this.height/2)-5, strokeWidth, 12);
		}
		
		if (this.overlays.margins==true) {
			const safeTitleMargin = 0.1/2;
			ctx.fillRect(this.width*safeTitleMargin, this.height*safeTitleMargin, this.width*(1-safeTitleMargin*2), 1);
			ctx.fillRect(this.width*safeTitleMargin, this.height*safeTitleMargin, 1, this.height*(1-safeTitleMargin*2));
			ctx.fillRect(this.width*(1-safeTitleMargin), this.height*safeTitleMargin, 1, this.height*(1-safeTitleMargin*2));
			ctx.fillRect(this.width*safeTitleMargin, this.height*(1-safeTitleMargin), this.width*(1-safeTitleMargin*2), 1);
			
			const safeActionMargin = 0.07/2;
			ctx.fillRect(this.width*safeActionMargin, this.height*safeActionMargin, this.width*(1-safeActionMargin*2), 1);
			ctx.fillRect(this.width*safeActionMargin, this.height*safeActionMargin, 1, this.height*(1-safeActionMargin*2));
			ctx.fillRect(this.width*(1-safeActionMargin), this.height*safeActionMargin, 1, this.height*(1-safeActionMargin*2));
			ctx.fillRect(this.width*safeActionMargin, this.height*(1-safeActionMargin), this.width*(1-safeActionMargin*2), 1);
		}
		
		if (this.overlays.letterbox==true) {
			let desiredWidth = this.width;
			let desiredHeight = this.height;
			const cameraRatio = Math.round((this.width / this.height)*100)/100;
			const desiredRatio = this.overlays.ratio;
			
			ctx.fillStyle = "#000000";
			
			
			
			if(desiredRatio>cameraRatio) {
				desiredHeight = desiredWidth / desiredRatio;
				
				const margin = Math.round((this.height-desiredHeight)/2);
				ctx.fillRect(0, 0, this.width, margin);
				ctx.fillRect(0, this.height-margin, this.width, margin);
				
			}
			else if (desiredRatio<cameraRatio) {
				desiredWidth = desiredHeight * desiredRatio;
				
				const margin = Math.round((this.width-desiredWidth)/2);
				ctx.fillRect(0, 0, margin, this.height);
				ctx.fillRect(this.width-margin, 0, margin, this.height);
			}
		}
		
	}
	
	drawFrame(id) {
		//Draws the selected frame to the canvas ; Desegnas la elektita bildo
		const viewer = document.getElementById('viewerCanvas');
		const canvasContext = viewer.getContext('2d');
		const frame = document.getElementById('frame_'+id);

		const frameName = this.getFrameName(id)+'?'+(Math.random()*100);
		
		
		if(id>0){
			
			var imageToDraw = new Image();
			imageToDraw.src = path.join(Heron.project.activeTakePath,frameName);
			imageToDraw.onload = function(){

				// If the image and the camera are not of the same ratio (what the hell are you doing anyway?)
				const imageRatio = this.width/this.height;
				const cameraRatio = Heron.camera.width/Heron.camera.height;
				let margin = 0;
				if(imageRatio!=cameraRatio){
					const displayedWidth = Heron.camera.height*imageRatio;
					margin = (Heron.camera.width-displayedWidth)/2;
				}

			  canvasContext.drawImage(imageToDraw, margin, 0, Heron.camera.height*imageRatio,  Heron.camera.height);
			};
		}
		else {
			canvasContext.fillStyle = "#000000";
			canvasContext.fillRect(0, 0, this.width, this.height);
		}
	}
	
	viewFrame(id) {
		document.getElementById('videoStream').style.opacity = 0;
		
		const notSelectedAnymore = document.getElementsByClassName('selected');
		if(notSelectedAnymore.length!=0 && notSelectedAnymore[0]!=undefined && notSelectedAnymore[0]!=NaN){
			while(notSelectedAnymore.length!=0){
				if(notSelectedAnymore[0]!=undefined){
					notSelectedAnymore[0].classList.remove('selected');
				}
			}
		}
		const frame = document.getElementById('frame_'+id);
		const currentFrame = document.getElementById('currentFrame');
		
		if(frame!=null) {
			frame.classList.add('selected');
			currentFrame.innerHTML = id;
			currentFrame.style = "color:var(--main-text-color);"
		}
		
		this.drawFrame(id);
	}
	
	selectFrame(id){
		if(Heron.camera.shift==false) {
			Heron.camera.viewFrame(id);
		}
		else {
			const alreadySelected = document.getElementsByClassName('selected');
			if(alreadySelected[0]!=undefined && alreadySelected[0]!=NaN){
				// If another image was selected, select multiple
				let previousId = alreadySelected[0].id;
				previousId =parseInt( previousId.substr(6));
				
				if(previousId>id){
					for(i=id;i<previousId;i++){
						document.getElementById('frame_'+i).classList.add('selected');
					}
				}
				else if(previousId<id){
					for(i=previousId;i<=id;i++){
						document.getElementById('frame_'+i).classList.add('selected');
					}
				}
			}
			else { // If no other image was selected, select the one clicked on
				Heron.camera.viewFrame(id);
			}
		}
	}
	
	showStream() {
		this.viewFrame(Heron.project.shots[Heron.project.activeShot].takes[Heron.project.activeTake].frameCount);
		let currentFrame = document.getElementById('currentFrame');
		currentFrame.innerHTML = Heron.strings['ui_live'];
		currentFrame.style = 'color:#E25353;';
		
		const videoStreamElement = document.getElementById('videoStream');
		
		videoStreamElement.style.opacity = 1-parseFloat(document.getElementById('onionBlending').value);
		
        console.log(1-parseFloat(document.getElementById('onionBlending').value));
        
		if(Heron.camera.differenceMode==true){
			videoStreamElement.classList.add('difference');
			videoStreamElement.style.opacity=1;
		}
		else {
			videoStreamElement.classList.remove('difference');
		}
		
		const  notSelectedAnymore = document.getElementsByClassName('selected');
		if(notSelectedAnymore[0]!=undefined && notSelectedAnymore[0]!=NaN){
			notSelectedAnymore[0].classList.remove('selected');
		}
		
	}
	
	addFrameToTimeline(frameNumber, frameData) {
	   //Updates the project object ; gxisdatigas la projektan objekton
		let frameCount = parseInt(document.getElementById('frameCount').innerHTML);
		frameCount++;
		document.getElementById('frameCount').innerHTML = frameCount;
		
		
		
		
		

		// Creates the canvas element and sets its attributes
		let frameThumbnailCanvas = document.createElement('canvas');
		const id = document.createAttribute('id');
		id.value = 'frame_'+frameNumber;
		frameThumbnailCanvas.setAttributeNode(id);
		const draggable = document.createAttribute('draggable');
		draggable.value = true;
		frameThumbnailCanvas.setAttributeNode(draggable);

		let frameNumberElement = document.createElement('span');
		const idNumber = document.createAttribute('id');
		idNumber.value = 'number_'+frameNumber;
		frameNumberElement.setAttributeNode(idNumber);
		const classNumber = document.createAttribute('class');
		classNumber.value = 'timelineNumber';
		frameNumberElement.setAttributeNode(classNumber);
		
		
		const onclick = document.createAttribute('onclick');
		onclick.value = 'Heron.camera.selectFrame('+frameNumber+')';
		frameThumbnailCanvas.setAttributeNode(onclick);
		
		if(frameNumber!=frameCount) {
			// Frame not added at the end
			
			for(i=frameCount-1;i>=frameNumber;i--){
				Heron.camera.renameFrame(i, true);
			}
//			console.log('adding frame '+frameNumber+' before '+(frameNumber+1));
			document.getElementById('timeline').insertBefore(frameThumbnailCanvas, document.getElementById('number_'+(frameNumber+1)));
		}
		else {
			document.getElementById('timeline').insertBefore(frameThumbnailCanvas, document.getElementById('show_stream'));
		}
		
		document.getElementById('timeline').insertBefore(frameNumberElement, document.getElementById('frame_'+frameNumber));
		
		document.getElementById('number_'+frameNumber).innerHTML=frameNumber;

		frameThumbnailCanvas = document.getElementById('frame_'+frameNumber);
		frameThumbnailCanvas.ondragover = 'allowDropFrame(event)';
		frameThumbnailCanvas.ondrop = 'moveFrame(event)';
		frameThumbnailCanvas.ondragstart = 'drag(event)';
		frameThumbnailCanvas.width = (frameThumbnailCanvas.clientHeight*this.ratio);

		
		const frameCtx = frameThumbnailCanvas.getContext('2d');
		const viewer = document.getElementById('viewerCanvas');
		const viewerCtx = viewer.getContext('2d');

		var image = new Image();
		image.src = frameData;
		image.onload = function(){
		  frameCtx.drawImage(image, 0, 0, frameThumbnailCanvas.width, frameThumbnailCanvas.height);
		};
		
		document.getElementById('buttonSave').disabled = false;
	}
	
	loadFrame(frame) {
		this.addFrameToTimeline(frame.frameNumber, frame.frameData);
	}
	renameFrame(frameId,forward){
		if(forward==false){
			const attr = document.createAttribute('onclick');
			attr.value = 'Heron.camera.viewFrame('+(frameId-1)+')';
			document.getElementById('frame_'+frameId).setAttributeNode(attr);
			
			document.getElementById('frame_'+frameId).id = 'frame_'+(frameId-1);
			
			document.getElementById('number_'+frameId).innerHTML = (frameId-1);
			document.getElementById('number_'+frameId).id = 'number_'+(frameId-1);
			Heron.camera.viewFrame((frameId-1));
		}
		else {
			if(document.getElementById('frame_'+frameId)!=null){
				const attr = document.createAttribute('onclick');
				attr.value = 'Heron.camera.selectFrame('+(frameId+1)+')';
				document.getElementById('frame_'+frameId).setAttributeNode(attr);
				document.getElementById('frame_'+frameId).id = 'frame_'+(frameId+1);

				document.getElementById('number_'+frameId).innerHTML = (frameId+1);
				document.getElementById('number_'+frameId).id = 'number_'+(frameId+1);
				Heron.camera.viewFrame((frameId+1));
			}
			else {
				console.error('frame_'+frameId+' does not exist')
			}
		}
	}
	
	getFrameName(id) {
		let shotNumberDisplay;
		let takeNumberDisplay;
		let frameNumberDisplay;
		// Shot and take number for the file ; Numero de la filmero kaj provo de la dosiero
		if(Heron.project.activeShot<10) shotNumberDisplay = '000'+Heron.project.activeShot;
		else if(Heron.project.activeShot<100) shotNumberDisplay = '00'+Heron.project.activeShot;
		else if(Heron.project.activeShot<1000) shotNumberDisplay = '0'+Heron.project.activeShot;
		else shotNumberDisplay = Heron.project.activeShot;
		if(Heron.project.activeTake<10) takeNumberDisplay = '000'+Heron.project.activeTake;
		else if(Heron.project.activeTake<100) takeNumberDisplay = '00'+Heron.project.activeTake;
		else if(Heron.project.activeTake<1000) takeNumberDisplay = '0'+Heron.project.activeTake;
		else takeNumberDisplay = Heron.project.activeTake;
		if(id<10) frameNumberDisplay = '000'+id;
		else if(id<100) frameNumberDisplay = '00'+id;
		else if(id<1000) frameNumberDisplay = '0'+id;
		else frameNumberDisplay = id;
		
		const frameName = Heron.project.projectName+'_'+shotNumberDisplay+'_'+takeNumberDisplay+'_'+frameNumberDisplay+'.jpg';
		return frameName;
	}
	
	deleteFrame(id, uniqueId){
		if(id==undefined){
			const selectedImage = document.getElementsByClassName('selected');
			let selectedImageId;
			if(selectedImage!=undefined && selectedImage.length!=0){
				
				let selectedImageId = selectedImage[0].id;
				selectedImageId = parseInt(selectedImageId.substring(6, selectedImageId.length));
				let imageData={};
				for(i=0;i<=selectedImage.length-1;i++){
                    
					imageData[i] = {};
					imageData[i].uniqueId = i+"_"+Math.random()*100000000000000000;
                    
					let imageDataRaw = selectedImage[i].toDataURL('image/jpeg', 1.0);
					imageData[i].data = imageDataRaw.substr(23,imageDataRaw.length);
					console.log(imageData[i].data.substr(160,20));
				}
				console.log(imageData);
				i=0;
				while(selectedImage.length!=0){
										
					console.log('deleting ', selectedImageId);
					
	//				ipcRenderer.send('camera:deleteFrame',selectedImageId);
//					let imageData = document.getElementById('frame_'+selectedImageId).toDataURL('image/jpeg', 1.0);
//					imageData = imageData.substr(23,imageData.length);

					//this.addToHistory('deleteFrame', selectedImageId, {data:imageData[i].data,uniqueId:imageData[i].uniqueId});
					
					selectedImage[0].classList.remove('selected');
					Heron.camera.deleteFrame(selectedImageId, imageData[i].uniqueId);
					i++;
				}
			}
		}
		else {
			console.log('DELETING ', id);
			if(id == Heron.project.shots[Heron.project.activeShot].takes[Heron.project.activeTake].frameCount) {
				Heron.camera.showStream();
			}
			else {
				Heron.camera.viewFrame(id);
			}
			const data = {id:id,uniqueId:uniqueId};
			console.log(data);
			ipcRenderer.send('camera:deleteFrame',data);
		}
	}
	
	changeOnion() {
		
		this.drawFrame(Heron.project.shots[Heron.project.activeShot].takes[Heron.project.activeTake].frameCount);
		
		const videoStreamElement = document.getElementById('videoStream');
		
		// Only if the viewer is selected ; Nur se la vidilo estas elektita
		if (document.getElementsByClassName('selected').length==0){
			document.getElementById('videoStream').style.opacity = 1-parseFloat(document.getElementById('onionBlending').value);
		}
		if(Heron.camera.differenceMode==true){
			videoStreamElement.classList.add('difference');
			videoStreamElement.style.opacity=1;
		}
		else {
			videoStreamElement.classList.remove('difference');
		}
	}
	
//	addToHistory(action, id, data) {
//		if(Heron.camera.history.length>0){
//			let i=Heron.camera.history.length-1;
//			let undone = true;
//			while(i>=0 && undone==true){
//				undone = Heron.camera.history[i].undone;
//				if(undone==true){
//					Heron.camera.history.pop();
//					i--;
//				}
//			}
//		}
//		this.history.push({action:action, id:id, undone:false, data:data});
//	}
}
