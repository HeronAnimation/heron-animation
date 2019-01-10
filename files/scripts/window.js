const electron = require('electron');
const path = require('path');
const {dialog} = require('electron').remote
const {ipcRenderer, remote} = electron;
let win = remote.getCurrentWindow();
const stringsToReplace = document.querySelectorAll('[string]');
Heron={};
Heron.strings={};
const Mousetrap = require('mousetrap');

// Set the locales
ipcRenderer.on('strings', function(e, strings){
	console.log('received');
	Heron.strings=strings;
	for(i=0; i<stringsToReplace.length;i++) {
		stringsToReplace[i].innerHTML=strings[stringsToReplace[i].getAttribute('string')];
		stringsToReplace[i].placeholder=strings[stringsToReplace[i].getAttribute('string')];
	}
});

// Change theme
ipcRenderer.on('theme', function(e, theme){
	console.log(">"+theme);
	document.querySelector('link').href = '../css/'+theme+'.css';
});

// Close window
if(document.getElementById('closeWindow'))
{
	const closeWindowButton = document.getElementById('closeWindow');
	closeWindowButton.addEventListener('click', closeWindow);
}
function closeWindow() {
	console.log('hey');
	const windowToClose = document.getElementById('closeWindow').title;
	
	console.log(windowToClose);
	ipcRenderer.send('window:close', windowToClose);
}

Mousetrap.bind('esc', function() {
	closeWindow()	
	return false;
});

function addLoadingIcon(elementId) {
    const loadingIcon = document.createElement("span");
    loadingIcon.classList.add("loadingAnimation");
    const id = document.createAttribute("id");
    id.value = "loadingIcon";
    loadingIcon.setAttributeNode(id);
    
    const loadingAnimation_carre_3 = document.createElement("span"); 
    const loadingAnimation_carre_2 = document.createElement("span"); 
    const loadingAnimation_carre_1 = document.createElement("span"); 
    loadingAnimation_carre_1.classList.add("loadingAnimation_carre");
    loadingAnimation_carre_1.classList.add("loadingAnimation_carre_1");
    loadingAnimation_carre_2.classList.add("loadingAnimation_carre");
    loadingAnimation_carre_2.classList.add("loadingAnimation_carre_2");
    loadingAnimation_carre_3.classList.add("loadingAnimation_carre");
    loadingAnimation_carre_3.classList.add("loadingAnimation_carre_3");
    
    loadingIcon.appendChild(loadingAnimation_carre_3);
    loadingIcon.appendChild(loadingAnimation_carre_2);
    loadingIcon.appendChild(loadingAnimation_carre_1);
    
    document.getElementById(elementId).appendChild(loadingIcon);
}

function removeLoadingIcon() {
    loadingIcon = document.getElementById("loadingIcon");
	if(loadingIcon!=null){
		loadingIcon.outerHTML = "";
		delete loadingIcon;
	}
}