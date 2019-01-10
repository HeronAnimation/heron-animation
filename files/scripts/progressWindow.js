ipcRenderer.on('progress', function(e, data){
	console.log(data.progress);
//	document.getElementById("progressBar").value=data.progress;
	console.log(Math.round(data.progress*300)+'px');
	document.getElementById("progressBar").style='width:'+Math.round(data.progress*300)+'px;';
});

ipcRenderer.on('error', function(e, data){
//	document.getElementById("progressBar").value=data.progress;
	document.getElementById("exportError").innerHTML+=data+'<br />';
});

ipcRenderer.on('log', function(e, data){
//	document.getElementById("progressBar").value=data.progress;
	document.getElementById("exportError").innerHTML+=data+'<br />';
	console.log(data);
});