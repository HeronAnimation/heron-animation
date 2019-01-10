var fs = require('fs');
function exportTake() {
	let folderPath = document.getElementById('folderPath').innerHTML;
	
	// Ajouter dossier /exports
	if (fs.existsSync(folderPath)) {
		folderPath = folderPath;
	}else {
		folderPath = Heron.project.projectPath;	
	}
	
	const options = {
		codec: document.getElementById('saveFormat').value,
		folder: folderPath,
		name: document.getElementById('saveName').value,
		frameRate: Heron.project.shots[Heron.project.activeShot].takes[Heron.project.activeTake].framerate,
//		crop: document.querySelector('input[name="aspectRatio"]:checked').value,
	};
	console.log(options);
	ipcRenderer.send('take:export', options);
}

ipcRenderer.on('project', function(e, heron){
	
	Heron.project = heron;
});

const saveFolder = document.getElementById('saveFolder');


saveFolder.addEventListener('click', openFolderSelection);



// Opens folder selection dialog for new project form
function openFolderSelection(){
	const saveFolder = dialog.showOpenDialog({properties: ['openDirectory']});
	document.getElementById('folderPath').innerHTML = saveFolder[0];
}