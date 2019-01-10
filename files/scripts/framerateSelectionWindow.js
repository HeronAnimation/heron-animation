function submitFramerate() {
	const framerate = document.getElementById('fpsSelection').value;
	ipcRenderer.send('project:framerate', framerate);
}