const fs = require('fs');

const loadProjectForm = document.getElementById('loadProjectFolder');
loadProjectForm.addEventListener('click', loadFolderSelection);

const projectForm = document.getElementById('projectFolder');
projectForm.addEventListener('click', openFolderSelection);

function loadFolderSelection(){
	const projectFolder = dialog.showOpenDialog({properties: ['openDirectory']});
	ipcRenderer.send('project:load', projectFolder[0]);
}

// Opens folder selection dialog for new project form
function openFolderSelection(){
	const projectFolder = dialog.showOpenDialog({properties: ['openDirectory']});
	document.getElementById('folderPath').innerHTML = projectFolder[0];
}

// When create is clicked
function createNewProject() {
	const folderPath = document.getElementById('folderPath').innerHTML;
	const projectName = document.getElementById('projectName').value;
	
	// Removes errors incase they were there
	document.getElementById('projectName').classList.remove('formError');
	document.getElementById('projectFolderDiv').classList.remove('formError');
	
	// If the path is really a folder path and the name is valid
	if(fs.existsSync(folderPath)) {
		if(projectName!='' && projectName.length<=35) {
			const projectInfo = [projectName, folderPath];
			ipcRenderer.send('project:create', projectInfo);
		}
		else {
			document.getElementById('projectName').classList.add('formError');
		}
	}
	else {
		document.getElementById('projectFolderDiv').classList.add('formError');
		if(projectName=='' || projectName.length>35) {
			document.getElementById('projectName').classList.add('formError');
		}
	}
}