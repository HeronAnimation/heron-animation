ipcRenderer.on('language', function(e, language){
	console.log(language);
	document.getElementById('settingsLanguage').value = language;	
});
ipcRenderer.on('settings', function(e, settings){
	console.log(settings);
	document.getElementById('shortPlayValue').value = settings.shortPlayDuration;
});

function viewPanel(settings) {
	const panels = document.getElementsByClassName('settingsPanel');
	
	console.log(settings);
	console.log(panels);
	
	for(i=0;i<panels.length;i++) {
		console.log(i);
		console.log(panels[i]);
		panels[i].style = 'display:none;';
	}
	document.getElementById('settings_'+settings).style = 'display:inline-block;';
}

function setLanguage(language) {
	ipcRenderer.send('heron:setLanguage', language);
}


function setWebcam(webcam) {
	console.log('sending '+webcam+'...');
	ipcRenderer.send('camera:setWebcam', webcam);
}

document.getElementById('shortPlayValue').addEventListener('input', function () {
	let shortPlayValue = document.getElementById('shortPlayValue').value;
	console.log(shortPlayValue);
	ipcRenderer.send('camera:setShortPlayValue', shortPlayValue);
});

let videoDevices = [];
navigator.mediaDevices.enumerateDevices().then(function (devices) {
	let options = '';
	devices.forEach(function (device) {
		
		if (device.kind == "videoinput") { // Only video ; nur videaj
			console.log(device);
			options+='<option value="'+device.deviceId+'" id="'+device.deviceId+'">'+device.label+'</option>';
		}
	});
	document.getElementById('settingsWebcam').innerHTML = options;

	// Choose the first one ; elektas la unuan
//	var selectedVideoInput = videoDevices[0];
//	selectVideoInput(selectedVideoInput.deviceId, setUpViewer);
});

