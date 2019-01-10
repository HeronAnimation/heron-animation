// Retrieves the list of all inputs ; Akiras la liston de la enigoj
function listVideoInputs() {
	let videoDevices = [];
	navigator.mediaDevices.enumerateDevices().then(function (devices) {
		devices.forEach(function (device) {

			if (device.kind == "videoinput") { // Only video ; nur videaj
				videoDevices.push(device);
			}
		});
		console.log(videoDevices);
		// Choose the first one ; elektas la unuan
		var selectedVideoInput = videoDevices[0];
        selectVideoInput(selectedVideoInput.deviceId, setUpViewer);
	});
}

// Change theme
ipcRenderer.on('camera:setWebcam', function(e, webcam){
	console.log('received '+webcam+'...');
	selectVideoInput(webcam, setUpViewer);
});


// Plays the selected video input in the player ; Legas la elektitan videan eniron en la legilo.
function selectVideoInput(videoInputId, callback) {
    let constraints = {
        video: {
            deviceId: videoInputId,
            width: 1920, height: 1080
        },
        audio: false
    };

    navigator.mediaDevices.getUserMedia(constraints)
        .then(function (stream) {
            // Clone the element to remove listeners ; Kopias la elementon por forigu la ausxkultantojn
            let old_videoElement = document.getElementById('videoStream');
            let videoElement = old_videoElement.cloneNode(true);
            old_videoElement.parentNode.replaceChild(videoElement, old_videoElement);
        
            // Plays the stream in the player, ; Ekas la videon
            videoElement.srcObject = stream;
            window.stream = stream;
            videoElement.play();
        
        
            // When the video has started, continue : adapt the player ;
            // Kiam la video ekis, dauxrigu : adaptu la legilon
            videoElement.addEventListener("playing", function () {
                callback(videoInputId);
            });
        })
        .catch(function (err) {
            console.error("An error occured!");
            console.error(err);
        });
}

// Adapts the player width and height to the video stream ;
// Adaptas la altecon kaj la largxecon de la legilo al la video
function setUpViewer(videoInputId) {
	
	console.log('setting '+videoInputId+'...');
    removeLoadingIcon();
    
    const videoElement = document.getElementById('videoStream');
    const viewer = document.getElementById('viewer');

    const videoWidth = videoElement.videoWidth;
    const videoHeight = videoElement.videoHeight;
    const videoTracks = stream.getVideoTracks();

    Heron.camera = new Camera(videoTracks[0].label, videoInputId, videoWidth, videoHeight);
    
    scaleViewer();
}
function scaleViewer() {
//    const scaledVideoHeight = 540; // Desired height ; dezirata alteco
	let bounds = win.getBounds()
    const scaledVideoHeight = bounds.height-385; // Desired height ; dezirata alteco
    let videoHeight = Heron.camera.height;
    let videoWidth = Heron.camera.width;
		
		
    const videoElement = document.getElementById('videoStream');
    const viewerContainer = document.getElementById('viewer');
    const viewer = document.getElementById('viewerCanvas');
    const overlays = document.getElementById('overlaysCanvas');
    
//	console.log(videoHeight, videoWidth);
	
    // Scales the video ; Ajxustas la grandeco de la video
//    if (videoHeight < scaledVideoHeight) {
//        let videoScaleRatio = scaledVideoHeight / videoHeight;
//    } else {
//        let videoScaleRatio = scaledVideoHeight / videoHeight;
//    }
	let videoScaleRatio = scaledVideoHeight / videoHeight;
    if(videoScaleRatio<1)
    {
        videoElement.style.transformOrigin = "left top";
        viewer.style.transformOrigin = "left top";
        overlays.style.transformOrigin = "left top";
    }
    else {
        videoElement.style.transformOrigin = "top";
        viewer.style.transformOrigin = "left top";
        overlays.style.transformOrigin = "left top";
    }
    videoElement.style.transform = "scale(" + videoScaleRatio + ")";
	videoElement.style.position = "relative";
//	videoElement.style.bottom = videoHeight+"px";
    viewer.style.transform = "scale(" + videoScaleRatio + ")";
    overlays.style.transform = "scale(" + videoScaleRatio + ")";
//    viewer.style.top = "-"+(videoHeight+5)+"px";

    // Adjusts the width of the viewer ;  Ajxustas la largxecon de la vidilo
    let scaledVideoWidth = videoWidth * videoScaleRatio;
    let scaledVideoWidthWithPadding = parseInt(scaledVideoWidth) + 60;
    let scaledVideoHeightWithPadding = parseInt(scaledVideoHeight) + 60;
    viewerContainer.style = "width:" + scaledVideoWidthWithPadding + "px;height:" + scaledVideoHeightWithPadding + "px;";
    viewer.width = videoWidth;
    viewer.height = videoHeight;
    overlays.width = videoWidth;
    overlays.height = videoHeight;
}

function switchVideoInput() {
    const selectedInput = document.getElementById("videoDevice").value;
    
    navigator.mediaDevices.enumerateDevices().then(function (devices) {
        devices.forEach(function (device) {
            if (device.kind == "videoinput") { // Only video ; nur videaj
                if (device.deviceId == selectedInput)
                {
                    selectVideoInput(device.deviceId, function() {
                        
                        const videoElement = document.getElementById('videoStream');
                        
                        const videoWidth = videoElement.videoWidth;
                        const videoHeight = videoElement.videoHeight;
                        
                        camera.label = device.label;
                        camera.deviceId = device.deviceId;
                        camera.width = videoWidth;
                        camera.height = videoHeight;
                        camera.ratio = videoWidth / videoHeight;
                        
                        scaleViewer(videoHeight, videoWidth);
                    });
                }
            }
        });
    });
}