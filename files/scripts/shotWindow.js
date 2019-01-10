function createNewShot() {
	const shotNumber = document.getElementById('shotName').value;
	const takeNumber = document.getElementById('takeName').value;
	
	const projectInfo = [shotNumber, takeNumber];
	ipcRenderer.send('project:newShot', projectInfo);
}
let shots = {};


// When we receive the shot list
ipcRenderer.on('shots', function(e, data){
	shots = data.shots;
	
	document.getElementById('projectName').innerHTML = data.projectName;
	
	// Gather informations about the shots, creates the list
	let list = '<table>';
	list += '<tr><th class="table_id">'+Heron.strings['shot_number']+'</th><th class="table_number">'+Heron.strings['shot_takeCount']+'</th><th>'+Heron.strings['shot_lastUpdated']+'</th></tr>';
	
	let highestShotNumber = 0;
	
	for(shot in shots) {
		let lastUpdated = 0;
		let takeCount = 0;
		for (take in shots[shot].takes) {
			const vtake = shots[shot].takes[take];
			if (vtake.updated>lastUpdated) lastUpdated=vtake.updated;
			takeCount++;
		}
		
		let dlastUpdated = new Date(lastUpdated);
		const stringLastUpdated = dlastUpdated.toLocaleDateString() + " " +  dlastUpdated.toLocaleTimeString();
		list += '<tr onclick="selectShot('+shots[shot].shotNumber+')" id="shot_'+shots[shot].shotNumber+'"><td class="table_id">'+shots[shot].shotNumber+'</td><td class="table_number">'+takeCount+'</td><td>'+stringLastUpdated+'</td></tr>';
		
		if(shots[shot].shotNumber>highestShotNumber) highestShotNumber=shots[shot].shotNumber;
	}
	list+='</table>';
	document.getElementById('shotList').innerHTML = list;
	
	document.getElementById('shotName').value = parseInt(highestShotNumber)+1;
	
});

ipcRenderer.on('take:preview', function(e, data){
	const frameList = data.frameList;
	const shotNumber = data.shotNumber;
	const takeNumber = data.takeNumber;
	
	// Resizes the window if the panel wasn't open
	const bounds = win.getBounds();
	
	if(bounds.width==800) {
		win.setBounds({
			x:bounds.x,
			y:bounds.y,
			width: 1200,
			height:bounds.height
		})
	}
	if(frameList!=0){
		document.getElementById('framePreview').style.display = 'inline-block';document.getElementById('noFramePreview').style.display = 'none';
		const frameCount = Object.keys(frameList).length;
		document.getElementById('previewFrames').max = frameCount;
		document.getElementById('previewFrames').value = Math.round(frameCount/2);
		document.getElementById('previewFrames').oninput = function() {previewFrame(frameList)};
		
		displayFrame(frameList[Math.round(frameCount/2)]);
		
		document.getElementById('loadTakeButton').onclick = 'loadTake('+shotNumber+','+takeNumber+');';
	}
	else {
		document.getElementById('framePreview').style.display ='none';
		document.getElementById('noFramePreview').style.display = 'inline-block';
	}
});
function displayFrame(framePath){
	document.getElementById('preview').src = framePath;
}
function previewFrame(frameList) {
	const frameNumber = document.getElementById('previewFrames').value;
	displayFrame(frameList[frameNumber]);
}
function selectShot(shotId) {
	const takes = shots[shotId].takes;
	
	// Resizes the window if the panel was open
	const bounds = win.getBounds();
	if(bounds.width==1200) {
		win.setBounds({
			x:bounds.x,
			y:bounds.y,
			width: 800,
			height:bounds.height
		})
	}
	
	
	let list = '<table>';
	list += '<tr><th class="table_id">'+Heron.strings['shot_number']+'</th><th class="table_number">'+Heron.strings['take_frameCount']+'</th><th>'+Heron.strings['shot_lastUpdated']+'</th></tr>';
	
	let highestTakeNumber = 0;
	console.log(takes);
	for(take in takes) {
		let lastUpdated = takes[take].updated;
		let frameCount = Object.keys(takes[take].frames).length;
		
		let dlastUpdated = new Date(lastUpdated);
		const stringLastUpdated = dlastUpdated.toLocaleDateString() + " " +  dlastUpdated.toLocaleTimeString();
		
		list += '<tr onclick="selectTake('+shotId+','+takes[take].takeNumber+')" id="take_'+takes[take].takeNumber+'"><td class="table_id">'+takes[take].takeNumber+'</td><td class="table_number">'+frameCount+'</td><td>'+stringLastUpdated+'</td></tr>';
		
		
		if(parseInt(takes[take].takeNumber)>highestTakeNumber) highestTakeNumber=parseInt(takes[take].takeNumber);
	}
	list+='</table>';
	document.getElementById('takeList').innerHTML = list;
	
	console.log(highestTakeNumber);
	document.getElementById('takeName').value = parseInt(highestTakeNumber)+1;
	
	document.getElementById('shotName').value = shotId;
	
	const toRemove = document.querySelectorAll(".shotTakeSelected");
	
	if(toRemove.length>0) {
		for (i=0;i<toRemove.length;i++) {
			toRemove[i].classList.remove('shotTakeSelected');
		}
	}
	document.getElementById('shot_'+shotId).classList.add('shotTakeSelected');
}

function selectTake(shotId, takeId) {
	const projectInfo = {shot:shotId,take:takeId};
//	ipcRenderer.send('project:loadTake', projectInfo);
	const toRemove = document.querySelectorAll(".shotTakeSelected");
	
	if(toRemove.length>0) {
		for (i=0;i<toRemove.length;i++) {
			toRemove[i].classList.remove('shotTakeSelected');
		}
	}
	document.getElementById('shot_'+shotId).classList.add('shotTakeSelected');
	document.getElementById('take_'+takeId).classList.add('shotTakeSelected');
	ipcRenderer.send('take:loadPreview', projectInfo);
	
	document.getElementById('loadTakeButton').addEventListener("click", function() {console.log("shotId");loadTake(shotId,takeId)});
}

function loadTake(shotId, takeId) {
	console.log(shotId);
	const projectInfo = {shot:shotId,take:takeId};
	ipcRenderer.send('project:loadTake', projectInfo);
}