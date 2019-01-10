const electron = require('electron');
const url = require('url');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

const {app, BrowserWindow, Menu, ipcMain} = electron;

const fixPath = require('fix-path');
fixPath();

process.env.NODE_ENV = 'development';
//process.env.NODE_ENV = 'production';

let Heron = {};
Heron.language = 'fr-FR'; // A faire : stocker la préférence utilisateur
Heron.windows = [];
Heron.project = {};

let mainWindow;

setLanguage(Heron.language);

app.on('ready', function(){
    mainWindow = new BrowserWindow({
		minWidth: 800,
        minHeight: 500,
        width: 1600,
        height: 925,
		backgroundColor: '#24242',
		icon: __dirname + '../files/images/icon_beta.ico'
	});
 
	
	Heron.windows['mainWindow']=true;
	
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'files', 'windows', 'mainWindow.html'),
        protocol:'file:',
        slashes: true
    }));
	
	mainWindow.webContents.on('did-finish-load', function() {
		mainWindow.webContents.send('strings', Heron.strings);
		mainWindow.webContents.send('loading');
		
		
		createProjectWindow();
	});
	
    // Quit app when closed
    mainWindow.on('closed', function(){
        app.quit();
    });
	
	
	/********************************************************************************************************************************************************************************************************
	
	openProgressWindow();
	progressWindow.webContents.on('did-finish-load', function() {
		let args=[];
		let ffmpegPath = path.join(__dirname, 'ffmpeg', 'ffmpeg'); 

		// Select platform specific executable
		if(process.platform == 'win32') ffmpegPath += '.exe';
		else if(process.platform == 'darwin') ffmpegPath += '-osx';
		else if(process.platform == 'linux') 
		{
			if(process.arch=='x32') ffmpegPath += '-linux-x32';
			else if(process.arch=='x64') ffmpegPath += '-linux-x64';
			else ffmpegPath += '-linux-x64'; //if(process.arch=='arm64')
		}
		else {
			// Erreur : OS non reconnu
			console.error('OS?');
		}
	
		console.log(ffmpegPath);
		
		progressWindow.webContents.send('log', ffmpegPath);
	
		const child = spawn(ffmpegPath, args);
child.stderr.on('data', (data) => {
	console.log('>> '+data);
});
child.stdout.on('data', (data) => {
	console.log('!! '+data);
});
//		 Advancing the progress bar
		child.stderr.on('data', (data) => {
			let returnedValue = data.toString();

			returnedValue = returnedValue.split(' ');
			if(returnedValue[0]=='frame=') {
				let value;
				if(process.platform=='darwin' || returnedValue[2]=='') value = returnedValue[3];
				else value = returnedValue[2];

				progress = (parseInt(value)/diviser)/frameCount;
	//			console.log('progress: '+progress);
				let dataToSend = {};
				dataToSend['progress']=progress;
				progressWindow.webContents.send('progress', dataToSend);
				progressWindow.setProgressBar(progress);
			}
		});

		child.on('exit', function (code, signal) {
		  console.log('child process exited with ' +
					  `code ${code} and signal ${signal}`); // signal = null = pas d'erreur
			if(code=='1') progressWindow.webContents.send('error', signal);
		});

		child.on('close', function (code, log) {
		  progressWindow.webContents.send('log', 'ok');
		});
	});
	/**********************************************************************************************************************************************************************************************************************************************************/
})

// Handle add shot Window
function createShotWindow() {
	if(Object.keys(Heron.windows).length<=1)
		{
            let params={
				title: Heron.strings['shot'],
				frame: false,
				width: 800,
				height: 450,
				modal: true,
				fullscreenable:false,
				resizable:false,
				backgroundColor: '#24242'
			};
            if(process.platform!='darwin') params['parent']=mainWindow;
			shotWindow = new BrowserWindow(params);

			Heron.windows['shotWindow']=true;

			shotWindow.loadURL(url.format({
				pathname: path.join(__dirname, 'files', 'windows/shotWindow.html'),
				protocol:'file:',
				slashes: true
			}));


			shotWindow.webContents.on('did-finish-load', function() {
				shotWindow.webContents.send('strings', Heron.strings);
				sendExistingShots();
			});

			shotWindow.on('close',function(){
				delete Heron.windows['shotWindow'];
				shotWindow = null;
			});
		}
}

// Handle project Window
function createProjectWindow() {
	if(Object.keys(Heron.windows).length<=1)
		{
            let params = {
				title: Heron.strings['project_createNewProject'],
				frame: false,
				width: 800,
				height: 251,
				modal: true,
				fullscreenable:false,
				resizable:false,
				backgroundColor: '#24242'
			};
            if(process.platform!='darwin') params['parent']=mainWindow;
			projectWindow = new BrowserWindow(params);


			Heron.windows['projectWindow']=true;

			projectWindow.loadURL(url.format({
				pathname: path.join(__dirname, 'files', 'windows/projectWindow.html'),
				protocol:'file:',
				slashes: true
			}));

			projectWindow.webContents.on('did-finish-load', function() {
				projectWindow.webContents.send('strings', Heron.strings);
			});

			projectWindow.on('close',function(){
				delete Heron.windows['projectWindow'];
				projectWindow = null;
			});
		}
}

// Handle export Window
ipcMain.on('window:settings',function(e, settings) {
	console.log(settings);
	openSettingsWindow(settings);
});
function openSettingsWindow(settings) {
	if(Object.keys(Heron.windows).length<=1)
		{
            let params = {
				title: Heron.strings['settings'],
				frame: false,
				width: 800,
				height: 310,
				modal: true,
				fullscreenable:false,
				resizable:false,
				backgroundColor: '#24242'
			};
            if(process.platform!='darwin') params['parent']=mainWindow;
            
			settingsWindow = new BrowserWindow(params);

			Heron.windows['settingsWindow']=true;

			settingsWindow.loadURL(url.format({
				pathname: path.join(__dirname, 'files', 'windows/settingsWindow.html'),
				protocol:'file:',
				slashes: true
			}));

			settingsWindow.webContents.on('did-finish-load', function() {
				settingsWindow.webContents.send('strings', Heron.strings);
				settingsWindow.webContents.send('language', Heron.language);
				settingsWindow.webContents.send('settings', settings);
			});

			settingsWindow.on('close',function(){
				delete Heron.windows['settingsWindow'];
				settingsWindow = null;
			});
		}
}
// Handle export Window
ipcMain.on('window:export',function() {
	openExportWindow();
});
function openExportWindow() {
	if(Object.keys(Heron.windows).length<=1)
		{
            let params = {
				title: Heron.strings['export'],
				frame: false,
				width: 800,
				height: 350,
				modal: true,
				fullscreenable:false,
				resizable:false,
				backgroundColor: '#24242'
			};
            if(process.platform!='darwin') params['parent']=mainWindow;
            
			exportWindow = new BrowserWindow(params);

			Heron.windows['exportWindow']=true;

			exportWindow.loadURL(url.format({
				pathname: path.join(__dirname, 'files', 'windows/exportWindow.html'),
				protocol:'file:',
				slashes: true
			}));


			exportWindow.webContents.on('did-finish-load', function() {
				exportWindow.webContents.send('strings', Heron.strings);
				
				exportWindow.webContents.send('project', Heron.project);
			});

			exportWindow.on('close',function(){
				delete Heron.windows['exportWindow'];
				exportWindow = null;
			});
		}
}

function openProgressWindow() {
	if(Object.keys(Heron.windows).length<=1)
		{
            
            let params = {
				title: 'tempTRUCTRUC',
//				title: Heron.strings['export'],
				frame: false,
				width: 530,
				height: 150,
				modal: true,
				fullscreenable:false,
				resizable:false,
				backgroundColor: '#24242'
			};
            if(process.platform!='darwin') params['parent']=mainWindow;
            
			progressWindow = new BrowserWindow(params);

			Heron.windows['progressWindow']=true;

			progressWindow.loadURL(url.format({
				pathname: path.join(__dirname, 'files', 'windows/progressWindow.html'),
				protocol:'file:',
				slashes: true
			}));


			progressWindow.webContents.on('did-finish-load', function() {
				progressWindow.webContents.send('strings', Heron.strings);
			});

			progressWindow.on('close',function(){
				delete Heron.windows['progressWindow'];
				progressWindow = null;
			});
		}
}

function openFramerateSelectionWindow() {
	if(Object.keys(Heron.windows).length<=1)
		{
            
            let params = {
				title: Heron.strings['ui_fps'],
				frame: false,
				width: 400,
				height: 150,
				modal: true,
				fullscreenable:false,
				resizable:false,
				backgroundColor: '#24242'
			};
			params['parent']=mainWindow;
            
			framerateSelectionWindow = new BrowserWindow(params);

			Heron.windows['framerateSelectionWindow']=true;

			framerateSelectionWindow.loadURL(url.format({
				pathname: path.join(__dirname, 'files', 'windows/framerateSelectionWindow.html'),
				protocol:'file:',
				slashes: true
			}));

			framerateSelectionWindow.webContents.on('did-finish-load', function() {
				framerateSelectionWindow.webContents.send('strings', Heron.strings);
			});

			framerateSelectionWindow.on('close',function(){
				delete Heron.windows['framerateSelectionWindow'];
				framerateSelectionWindow = null;
			});
		}
}
ipcMain.on('window:close',function(e, windowName) {
	if(windowName=='shotWindow') shotWindow.close();
	else if(windowName=='exportWindow') exportWindow.close();
	else if(windowName=='projectWindow') projectWindow.close();
	else if(windowName=='settingsWindow') settingsWindow.close();
	else if(windowName=='framerateSelectionWindow') framerateSelectionWindow.close();
});

// Obsolete
function buildMenu() {
	// Create menu template
	const mainMenuTemplate = [
		{
			label: Heron.strings['menu_project'],
			submenu: [
				{
					label: Heron.strings['project_createNewProject'],
					accelerator: process.platform == 'darwin' ? 'Command+N' : 'Ctrl+N',
					click() {
						createProjectWindow();
					}
				},
				{
					label: Heron.strings['shot_createNewShot'],
					accelerator:'Shift+S',
					click() {
						createShotWindow();
					}
				},
				{
					label: 'ExportProgress',
					accelerator: process.platform == 'darwin' ? 'Shift+E' : 'Shift+E',
					click() {
						openProgressWindow();
					}
				},
				{
					label: Heron.strings['menu_deletePhoto'],
					click() {
						mainWindow.webContents.send('item:clear');
					}
				},
				{
					label: Heron.strings['menu_quit'],
					accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
					click() {
						app.quit();
					}
				}            
			]
		},
		{
			label: Heron.strings['menu_languages'],
			submenu: [
				{
					label: 'English',
					click() {
						setLanguage('en-US');
					}
				},
				{
					label: 'Esperanto',
					click() {
						setLanguage('eo');
					}
				},
				{
					label: 'Français',
					click() {
						setLanguage('fr-FR');
					}
				}
			]
		},
		{
			label: Heron.strings['menu_themes'],
			submenu: [
				{
					label: Heron.strings['theme_light'],
					click() {
						switchTheme('theme-light');
					}
				},
				{
					label: Heron.strings['theme_dark'],
					click() {
						switchTheme('theme-dark');
					}
				}
			]
		}
	];
	
	
	// If mac, add emtpy object to menu
	if(process.platform == 'darwin'){
		mainMenuTemplate.unshift({});
	}
	// Dev tools
	if(process.env.NODE_ENV !== 'production'){
		mainMenuTemplate.push({
			label: 'DevTools',
			submenu:[
				{
					label: 'Toggle DevTools',
					accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
					click(item, focusedWindow){
						focusedWindow.toggleDevTools();
					}
				},
				{
					role: 'reload'
				}
			]
		})
	}


	const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
	Menu.setApplicationMenu(mainMenu);
}
ipcMain.on('heron:setLanguage',function(e, language) {
	setLanguage(language);
});
ipcMain.on('camera:setWebcam',function(e, webcam) {
	
	console.log('transmitting '+webcam+'...');
	mainWindow.webContents.send('camera:setWebcam', webcam);
});
ipcMain.on('camera:setShortPlayValue',function(e, shortPlayValue) {
	
	console.log('SPV '+shortPlayValue);
	mainWindow.webContents.send('camera:setShortPlayValue', shortPlayValue);
});
function setLanguage(language) {
	var filePath = path.join(__dirname, 'files', 'locales', language+'.json');
	fs.readFile(filePath, 'utf8', function (err, data) {
		if (err) return console.error(err);
		else {
			Heron.strings = JSON.parse(data);
			mainWindow.webContents.send('strings', Heron.strings);
			
			console.log(Heron['windows'].length);
			let compte = 0;
			for(let wi in Heron.windows) {
				compte++;
			}
			if (compte>1) {
				console.log('truc');
				settingsWindow.webContents.send('strings', Heron.strings);
			}
			
			
			
			// Build menu from template
			buildMenu();
		}
	});
}

function switchTheme(theme) {
	mainWindow.webContents.send('theme', theme);
}

/** PROJECT MANAGEMENT **/
// LOAD
ipcMain.on('project:load',function(e, projectPath) {
	loadProject(projectPath);
});
function loadProject(projectPath){
	projectWindow.close();
	Heron.project.projectPath = projectPath;
	
	let folderName = projectPath.split(path.sep);
	folderName = folderName[folderName.length-1];
	folderName = folderName.substr(0,folderName.length-6);
	
	// get the path from the project file
	projectFilePath = path.join(projectPath, folderName+'.heronpr');
	
	// Reads the project file
	fs.readFile(projectFilePath, 'utf8', function (err, data) {
		if (err) {
			createProjectWindow();
		}
		else {
			Heron.project = JSON.parse(data);
			
			createShotWindow();
		}
	});
	
	
}
// CREATE
ipcMain.on('project:createWindow',function(e, projectInfo) {
	createProjectWindow();
});
ipcMain.on('project:create',function(e, projectInfo) {
	createProject(projectInfo);
});
//Creates a project and opens new/load shot window
function createProject(projectInfo){
	// retrieve and clean info
	projectWindow.close();
	const projectCleanName = cleanString(projectInfo[0]);
	
//	Heron.project.frameRate = 15;
	Heron.project.projectName = projectCleanName;
	Heron.project.projectPath = path.join(projectInfo[1], projectCleanName+'.heron');
	
	Heron.project.shots = {};
	
	// Set dates
	var d = new Date();
    var n = d.getTime();
	Heron.project.created = n;
	Heron.project.updated = n;
	
	// Make the directory
	fs.mkdir(Heron.project.projectPath);
	
	// Save json project file
	saveJson();
	
	// Next : choose or create a shot
	createShotWindow();
}
ipcMain.on('project:shotWindow',function(e, projectInfo) {
	createShotWindow();
});
// NEW SHOT
ipcMain.on('project:newShot',function(e, projectInfo) {
	createShot(projectInfo);
});
function createShot(projectInfo) {
	shotWindow.close();
	
	const shotNumber = projectInfo[0];
	const takeNumber = projectInfo[1];
	// The shot doesn't exist : Create it and the take
	if(Heron.project.shots[shotNumber]==undefined) {
		Heron.project.shots[shotNumber] = { 
			takes: {},
			shotName:shotNumber,
			shotNumber:shotNumber
										  }
		
		// Set dates
		var d = new Date();
		var n = d.getTime();
		Heron.project.shots[shotNumber].takes[takeNumber]= {
			takeNumber: takeNumber,
			framerate: 15,
			frameCount:0,
			created :n,
			updated:n,
			frames: {}
		}
		
		Heron.project.activeShot = shotNumber;
		Heron.project.activeTake = takeNumber;
		

		// Shot and take number names
		let displayNames = getNames(shotNumber,takeNumber,0);
		let shotNumberDisplay = displayNames[0];
		let takeNumberDisplay = displayNames[1];
		
		Heron.project.activeTakePath = path.join(Heron.project.projectPath, Heron.project.projectName+'_'+shotNumberDisplay,Heron.project.projectName+'_'+shotNumberDisplay+'_take_'+takeNumberDisplay);
		
		
		
		fs.mkdir(path.join(Heron.project.projectPath, Heron.project.projectName+'_'+shotNumberDisplay));
		fs.mkdir(Heron.project.activeTakePath);
		fs.mkdir(path.join(Heron.project.activeTakePath,'trash'));
		
		mainWindow.webContents.send('take:load', Heron.project);
			
		// Save json project file
		saveJson();
		
	}else { // The shot exists : so does the take? 
		if(Heron.project.shots[shotNumber].takes[takeNumber]==undefined) { // No : create the take
			// Set dates
			var d = new Date();
			var n = d.getTime();
			Heron.project.shots[shotNumber].takes[takeNumber]= {
				takeNumber: takeNumber,
				framerate: 15,
				frameCount:0,
				created :n,
				updated:n,
				frames: {}
			}

			Heron.project.activeShot = shotNumber;
			Heron.project.activeTake = takeNumber;
			
			
			// Shot and take number names
			let displayNames = getNames(shotNumber,takeNumber,0);
			let shotNumberDisplay = displayNames[0];
			let takeNumberDisplay = displayNames[1];
			
			Heron.project.activeTakePath = path.join(Heron.project.projectPath, Heron.project.projectName+'_'+shotNumberDisplay,Heron.project.projectName+'_'+shotNumberDisplay+'_take_'+takeNumberDisplay);
			
			fs.mkdir(Heron.project.activeTakePath);
			fs.mkdir(path.join(Heron.project.activeTakePath,'trash'));
			
			mainWindow.webContents.send('take:load', Heron.project);
			
			// Save json project file
			saveJson();
		}
		else {// Yes : open it instead
			openTake(shotNumber, takeNumber);
		}
	}
}
// When selecting a take in the list, returns the middle frame as a preview ; Kiam provo estas elektita, sendas la meza bildo kiel antauxrigardo
ipcMain.on('take:loadPreview',function(e, projectInfo) {
	const shotNumber = projectInfo.shot;
	const takeNumber = projectInfo.take;
	
	const  frames = Heron.project.shots[shotNumber].takes[takeNumber].frames;
	const frameCount = Object.keys(frames).length;
	if (frameCount>0) {
		// Shot and take number names
		let displayNames = getNames(shotNumber,takeNumber,0);
		let shotNumberDisplay = displayNames[0];
		let takeNumberDisplay = displayNames[1];

		const takePath = path.join(Heron.project.projectPath, Heron.project.projectName+'_'+shotNumberDisplay,Heron.project.projectName+'_'+shotNumberDisplay+'_take_'+takeNumberDisplay);
		let frameList = {};
		for (frame in frames) {
			const framePath = path.join(takePath, frames[frame].frameName);
			frameList[frame]=framePath;
		}
		const frameData = {frameList: frameList,shotNumber:shotNumber,takeNumber:takeNumber};
		shotWindow.webContents.send('take:preview', frameData);
	}
	else {
		const frameData = {frameList: 0,shotNumber:shotNumber,takeNumber:takeNumber};
		shotWindow.webContents.send('take:preview', frameData);
	}
});
ipcMain.on('project:loadTake',function(e, projectInfo) {
	openTake(projectInfo.shot, projectInfo.take);
	if(shotWindow!=null){
		shotWindow.close();
	}
});
function openTake(shotNumber, takeNumber){
	
	mainWindow.webContents.send('take:load', Heron.project);
	
	Heron.project.activeShot = shotNumber;
	Heron.project.activeTake = takeNumber;
	
	// Shot and take number for the file
	let displayNames = getNames(shotNumber,takeNumber,0);
	let shotNumberDisplay = displayNames[0];
	let takeNumberDisplay = displayNames[1];
	
	Heron.project.activeTakePath = path.join(Heron.project.projectPath, Heron.project.projectName+'_'+shotNumberDisplay,Heron.project.projectName+'_'+shotNumberDisplay+'_take_'+takeNumberDisplay);
	
	let frames = Heron.project.shots[shotNumber].takes[takeNumber].frames;
	const frameCount = Object.keys(frames).length;
	
	mainWindow.webContents.send('take:load', Heron.project);
	
	let i=1;
	// For each frame = get its data ; akiras la datumojn de cxiuj bildoj
	if (frameCount!=0) {
		for (frame in frames) {
			const framePath = path.join(Heron.project.activeTakePath, frames[frame].frameName);
			const frameData = {frameData: framePath,frameNumber:i};
			mainWindow.webContents.send('frame:load', frameData);
			i++;
		}
	}
}
function sendExistingShots() {
	const data = {shots:Heron.project.shots,projectName:Heron.project.projectName}
	shotWindow.webContents.send('shots', data);
}

// Writes the json project file from the Heron.project object.
function saveJson() {
    var file = Heron.project.projectName+'.heronpr';
    var filePath = path.join(Heron.project.projectPath, file);
    
	fs.unlink(filePath, function() {	
		data = Heron.project;

		fs.writeFile(filePath, JSON.stringify(data), function (err) {
			if (err) {
				console.info('There was an error attempting to save your data.');
				console.warn(err.message);
				return;
			} else {
				console.log('saved');
			}
		});
	});
}
ipcMain.on('take:export',function(e, options) {
	exportWindow.close();
	openProgressWindow();
	progressWindow.webContents.on('did-finish-load', function() {
		
		let dataToSend = {};
		dataToSend['progress']=0;
		progressWindow.webContents.send('progress', dataToSend);
		progressWindow.setProgressBar(0);

		const names = getNames(Heron.project.activeShot, Heron.project.activeTake)

		const shot = names[0];
		const take = names[1];

		const frames = Heron.project.shots[Heron.project.activeShot].takes[Heron.project.activeTake].frames;
		const frameCount = Object.keys(frames).length;

		// Get the ffmpeg executable
		let ffmpegPath = path.join(__dirname, 'ffmpeg', 'ffmpeg'); 
		let command = ffmpegPath; 

		// Select platform specific executable
		if(process.platform == 'win32') ffmpegPath += '.exe';
		else if(process.platform == 'darwin') ffmpegPath += '-osx';
		else if(process.platform == 'linux') 
		{
			if(process.arch=='x32') ffmpegPath += '-linux-x32';
			else if(process.arch=='x64') ffmpegPath += '-linux-x64';
			else ffmpegPath += '-linux-x64'; //if(process.arch=='arm64')
		}
		else {
			// Erreur : OS non reconnu
			console.error('OS?');
			progressWindow.webContents.send('error', 'OS?');
		}

		console.log(ffmpegPath);
		progressWindow.webContents.send('log', ffmpegPath);
		
		command += ' -y -framerate '+options.frameRate+' -start_number 0001'
		let args = ['-y',
					'-framerate', options.frameRate,
					'-start_number', '0001'
		]

		const sourcePath = path.join(Heron.project.activeTakePath, Heron.project.projectName+'_'+shot+'_'+take+'_%04d.jpg');

		command = command + ' -i ' + sourcePath;

		args.push('-i', sourcePath);

		const bitRate = '2.5M';// Set according to the picture size

		let nullPath = '/dev/null';
		let commandDelimiter = '\\';
		let extension = '';

		if(process.platform == 'win32') {
			commandDelimiter = '^';
			nullPath = 'NUL';
		}

		if (options.codec == 'h264') {
			command += ' -b:v '+bitRate;
			args.push('-b:v', bitRate);
			command += ' -c:v libx264 -pass 1 -f mp4 '+nullPath+' && '+commandDelimiter+ffmpegPath+' -y -framerate '+options.frameRate+' -start_number 0001 -i '+sourcePath+' -c:v libx264 -b:v '+bitRate+' -pass 2 ';
			args.push('-c:v', 'libx264',
					  '-pass', '1',
					  '-f', 'mp4',
					 '-pix_fmt','yuv420p');
			extension = '.mp4';
		}
		else if (options.codec == 'h265') {
			command += ' -b:v '+bitRate;
			args.push('-b:v', bitRate);
			command += ' -c:v libx265 -x265-params pass=1 -f mp4 '+nullPath+' && '+commandDelimiter+ffmpegPath+' -y -framerate '+options.frameRate+' -start_number 0001 -i '+sourcePath+' -c:v libx265  -b:v '+bitRate+' -x265-params pass=2';
			args.push('-c:v', 'libx265',
					  '-x265-params', 'pass=1',
					  '-f', 'mp4',
					 '-pix_fmt','yuv420p');
			extension = '.mp4';
		}
		else if (options.codec == 'prores422') {
			command += ' -c:v prores -profile:v 3';
			args.push('-c:v', 'prores',
					  '-profile:v', '3');
			extension = '.mov';
		}
		else if (options.codec == 'prores444') {
			command += ' -c:v prores -profile:v 4 -pix_fmt yuv444p10';
			args.push('-c:v', 'prores',
					  '-profile:v', '4',
					  '-pix_fmt', 'yuv444p10');
			extension = '.mov';
		}
		else if (options.codec == 'webm') {
			command += ' -b:v '+bitRate;
			args.push('-b:v', bitRate);
			command += ' -c:v libvpx-vp9 -pass 1 -f webm '+nullPath+' && '+commandDelimiter+ffmpegPath+' -y -framerate '+options.frameRate+' -start_number 0001 -i '+sourcePath+' -c:v libvpx-vp9 -b:v '+bitRate+' -pass 2';
			args.push('-c:v', 'libvpx-vp9',
					  '-pass', '1',
					  '-f', 'webm');
			extension = '.webm';
		}
		else if (options.codec == 'avi') {
			command += ' -b:v '+bitRate;
			args.push('-b:v', bitRate);
			command += ' -c:v mpeg4 -vtag xvid -qscale:v 3';
			args.push('-c:v', 'mpeg4',
					  '-vtag', 'xvid',
					  '-qscale:v', '3');
			extension = '.avi';
		}

		const name = cleanString(options.name);
		console.log("folder : ", options.folder)
		progressWindow.webContents.send('log', 'folder : '+options.folder);
		command += path.join(options.folder, name+extension);

		let diviser = 1;
		let progress = 0;

		// If 2 pass
		if(options.codec == 'h264' || options.codec == 'h265' || options.codec == 'webm'){
		   args.push(nullPath);
			diviser = 2; // For the progress
		}
		else {
			args.push(path.join(options.folder, name+extension));
		}

		const child = spawn(ffmpegPath, args);
		child.stdout.on('data', (data) => {
			console.log('!! '+data);
		});
		// Advancing the progress bar
		child.stderr.on('data', (data) => {
			console.log('>> '+data);
			let returnedValue = data.toString();

			returnedValue = returnedValue.split(' ');
			if(returnedValue[0]=='frame=') {
				let value;
				if(process.platform=='darwin' || returnedValue[2]=='') value = returnedValue[3];
				else value = returnedValue[2];

				progress = (parseInt(value)/diviser)/frameCount;
	//			console.log('progress: '+progress);
				let dataToSend = {};
				dataToSend['progress']=progress;
				progressWindow.webContents.send('progress', dataToSend);
				progressWindow.setProgressBar(progress);
			}
		});

		child.on('exit', function (code, signal) {
		  console.log('child process exited with ' +
					  `code ${code} and signal ${signal}`); // code = 1 = erreur
			if(signal==null) progressWindow.webContents.send('error', signal);
		});


		child.on('close', (data) => {
			console.log('second pass started');
		progressWindow.webContents.send('log', 'second pass started');
			// If second pass is needed
			if(options.codec == 'h264' || options.codec == 'h265' || options.codec == 'webm'){
				let args2 = [];
				if(options.codec == 'h264') {			
					args2.push('-y',
								   '-framerate', options.frameRate,
								   '-start_number', '0001',
								   '-i', sourcePath,
								   '-c:v', 'libx264',
								   '-b:v', bitRate,
								   '-pass', '2',
									'-pix_fmt','yuv420p',
								   path.join(options.folder, name+extension));
				}
				else if(options.codec == 'h265') {			
					args2.push('-y',
								   '-framerate', options.frameRate,
								   '-start_number', '0001',
								   '-i', sourcePath,
								   '-c:v', 'libx265',
								   '-b:v', bitRate,
								   '-x265-params', 'pass=2',
								   '-pix_fmt','yuv420p',
								   path.join(options.folder, name+extension));
				}
				else if(options.codec == 'webm') {			
					args2.push('-y',
								   '-framerate', options.frameRate,
								   '-start_number', '0001',
								   '-i', sourcePath,
								   '-c:v', 'libvpx-vp9',
								   '-b:v', bitRate,
								   '-pass', '2',
								   path.join(options.folder, name+extension));
				}

				const child2 = spawn(ffmpegPath, args2);
				child2.stdout.on('data', (data) => {
					console.log('!! '+data);
				});
				child2.stderr.on('data', (data) => {
					let returnedValue = data.toString();
					returnedValue = returnedValue.split(' ');
					if(returnedValue[0]=='frame=') {
			//			console.log(returnedValue[2]);

						let value;
						if(process.platform=='darwin' || returnedValue[2]=='') value = returnedValue[3];
						else value = returnedValue[2];
						console.log(value, diviser, frameCount);
						progress = (parseInt(value)/diviser)/frameCount;
						if(diviser==2) progress+=.5;
						console.log(progress);
						let dataToSend = {};
						dataToSend['progress']=progress;
						progressWindow.webContents.send('progress', dataToSend);
						progressWindow.setProgressBar(progress);
					}
				});
				child2.on('exit', function (code, signal) {
				  console.log('child2 process exited with ' +
							  `code ${code} and signal ${signal}`); // signal = null = pas d'erreur
					if(signal==null) {
//						progressWindow.close();
					}
					else  progressWindow.webContents.send('error', signal);
				});
			}
			else {
//				progressWindow.close(); // If no second pass, we can close now
			}
		});
	});
	
// YouTube recommendations:
// 2160p (4k) 	35-45 Mbps
// 1440p (2k) 	16 Mbps
// 1080p 	8 Mbps
// 720p 	5 Mbps
// 480p 	2.5 Mbps
// 360p 	1 Mbps
	
//	Note: Windows users should use NUL instead of /dev/null and ^ instead of \. 
	
	
//ffmpeg.exe -y -framerate 25 -start_number 0001 -i Test2_0002_0003_%04d.jpg  -b:v 2.5M  -c:v libx264 -pass 1 -f mp4 NUL && ^ffmpeg.exe -y -framerate 25 -start_number 0001 -i Test2_0002_0003_%04d.jpg -c:v libx264 -b:v 2.5M -pass 2 video2.mp4 // H.264
//	
//ffmpeg.exe -y -framerate 25 -start_number 0001 -i Test2_0002_0003_%04d.jpg -b:v 2.5M -c:v libx265  -x265-params pass=1 -f mp4 NUL && ^ffmpeg.exe -y -framerate 25 -start_number 0001 -i Test2_0002_0003_%04d.jpg -c:v libx265  -b:v 2.5M -x265-params pass=2 video3.mp4 // H.265
//	
//ffmpeg.exe -y -framerate 25 -start_number 0001 -i Test2_0002_0003_%04d.jpg -b:v 2.5M -c:v mpeg4 -vtag xvid -qscale:v 3 video5.avi // AVI
//	
//ffmpeg.exe -y -framerate 25 -start_number 0001 -i Test2_0002_0003_%04d.jpg -b:v 2.5M -c:v prores -profile:v 3 video5.mov // ProRes (422 HQ)
//ffmpeg.exe -y -framerate 25 -start_number 0001 -i Test2_0002_0003_%04d.jpg -b:v 2.5M -c:v prores -profile:v 4 -pix_fmt yuv444p10 video5.mov // ProRes (444)
//move
//
//ffmpeg.exe -y -framerate 25 -start_number 0001 -i Test2_0002_0003_%04d.jpg -b:v 2.5M -c:v libvpx-vp9  -pass 1 -f webm NUL && ^ffmpeg.exe -y -framerate 25 -start_number 0001 -i Test2_0002_0003_%04d.jpg -c:v libvpx-vp9 -b:v 2.5M -pass 2 video4.webm // WEBM (VP9)
});

/** CAMERA FUNCTIONS **/
ipcMain.on('camera:newFrame',function(e, data) {
	let undelete = false;
	if(data.undelete==true) undelete = true;
	let position = data.position;
	if(data.position!=undefined) position = data.position;
	else position = Heron.project.shots[Heron.project.activeShot].takes[Heron.project.activeTake].frameCount+1;
	addFrameToDisk(data.imageData, position, undelete);
});
function addFrameToDisk(imageData, position, undelete) {	
	console.log(position, undelete);
	// Updates the frame count ; Gxisdatigas la konton de bildoj
	Heron.project.shots[Heron.project.activeShot].takes[Heron.project.activeTake].frameCount++;
	const frameNumber = position;
	let push = false;
//	console.log('position:'+position);
	if(position != Heron.project.shots[Heron.project.activeShot].takes[Heron.project.activeTake].frameCount) push = true;
	
	// Shot and take number for the file
	let displayNames = getNames(Heron.project.activeShot,Heron.project.activeTake,frameNumber);
	let shotNumberDisplay = displayNames[0];
	let takeNumberDisplay = displayNames[1];
	let frameNumberDisplay = displayNames[2];

	let frameName = Heron.project.projectName+'_'+shotNumberDisplay+'_'+takeNumberDisplay+'_'+frameNumberDisplay+'.jpg';
	
	if(push==true){ // If the image is not added at the end : move what's after it
		let i=Heron.project.shots[Heron.project.activeShot].takes[Heron.project.activeTake].frameCount-1;
//		console.log("PUSH");
		while(i>=frameNumber){
//		console.log('renaming frame '+i+' -> '+(i+1));

			// Get the new file name
			const nameNumbers =  getNames(Heron.project.activeShot, Heron.project.activeTake, i+1);
			const newFrameName = Heron.project.projectName+'_'+nameNumbers[0]+'_'+nameNumbers[1]+'_'+nameNumbers[2]+'.jpg';
			
			// Rename the file
			fs.rename(path.join(Heron.project.activeTakePath,Heron.project.shots[Heron.project.activeShot].takes[Heron.project.activeTake].frames[i].frameName), path.join(Heron.project.activeTakePath,newFrameName), function(err) {
				if ( err ) console.log('ERROR: ' + err);
			});
			
			// Change the object
			Heron.project.shots[Heron.project.activeShot].takes[Heron.project.activeTake].frames[i+1]=Heron.project.shots[Heron.project.activeShot].takes[Heron.project.activeTake].frames[i];
			Heron.project.shots[Heron.project.activeShot].takes[Heron.project.activeTake].frames[i+1].frameNumber=i+1;

			// set the Name in the object
			Heron.project.shots[Heron.project.activeShot].takes[Heron.project.activeTake].frames[i+1].frameName=newFrameName;
			i--;
		}
	}
	
	Heron.project.shots[Heron.project.activeShot].takes[Heron.project.activeTake].frames[frameNumber] = {
		frameName: frameName,
		frameNumber: frameNumber
	}
	const framePath = path.join(Heron.project.activeTakePath,frameName);
//	console.log(frameNumber, frameName)
	
	// If undeleted frame
	if(undelete == true) {
		
		fs.rename(path.join(Heron.project.activeTakePath,'trash',imageData.uniqueId+'.jpg'),path.join(Heron.project.activeTakePath,frameName), function(err) {
				if ( err ) console.log('ERROR: ' + err);
				let data = {imageData:framePath,frameNumber:frameNumber,project:Heron.project};
				mainWindow.webContents.send('frame:written', data);
				saveJson();
			});
		
	}
	else { // Normal case
	
		// Writes the file ; skribas la dosieron
		fs.writeFile(framePath, imageData, 'base64', function(err) {
			console.error(err);
			// Send info back to mainWindow + saveJson ; sendas datumon reen al mainWindow + saveJson
			let framePath2 = framePath+'?'+(Math.random()*100); 
			let data = {imageData:framePath2,frameNumber:frameNumber,project:Heron.project};
			mainWindow.webContents.send('frame:written', data);
			saveJson();
		});
	}
}
ipcMain.on('project:framerate',function(e, framerate) {
	if(framerate=='other'){
		openFramerateSelectionWindow();
	}
	else {
		if(Heron.windows['framerateSelectionWindow']!=null) framerateSelectionWindow.close();
		
		mainWindow.webContents.send('project:framerate', framerate);
//		Heron.project.frameRate = framerate;
		Heron.project.shots[Heron.project.activeShot].takes[Heron.project.activeTake].framerate = framerate;
		saveJson();
	}
	
});

ipcMain.on('camera:deleteFrame',function(e, imageIds) {
	id = imageIds.id;
	console.log('deleting frame '+imageIds.id+' on '+Heron.project.shots[Heron.project.activeShot].takes[Heron.project.activeTake].frameCount);
	console.log(Heron.project.shots[Heron.project.activeShot].takes[Heron.project.activeTake].frames)
	const uniqueId = imageIds.uniqueId;
	
	
	// Moves the file to the trash folder ; movigxas la dosieron al la rubujo
	const oldPath = path.join(Heron.project.activeTakePath,Heron.project.shots[Heron.project.activeShot].takes[Heron.project.activeTake].frames[id].frameName);
	const newPath = path.join(Heron.project.activeTakePath,'trash',uniqueId+'.jpg');
	fs.rename(oldPath, newPath, (err) => {
		if (err) throw err;
		console.log('deleted');
	});
console.log(newPath);
	Heron.project.shots[Heron.project.activeShot].takes[Heron.project.activeTake].frameCount--; // Updates the framecount ; gxisdatigas la sumon



	let i=id+1;
	// Renames all the subsequent frames in the object ; Renomigxas cxiuj la sekvantajn bildojn en la objekto
//	console.log(i);
//	console.log(Heron.project.shots[Heron.project.activeShot].takes[Heron.project.activeTake].frameCount+1);
	while(i<=Heron.project.shots[Heron.project.activeShot].takes[Heron.project.activeTake].frameCount+1){

		console.log('renaming frame '+i+' -> '+(i-1));
		console.log(Heron.project.shots[Heron.project.activeShot].takes[Heron.project.activeTake].frames);
		console.log(Heron.project.shots[Heron.project.activeShot].takes[Heron.project.activeTake].frames[i-1]);
		
		const nameNumbers =  getNames(Heron.project.activeShot, Heron.project.activeTake, i-1);
		const newFrameName = Heron.project.projectName+'_'+nameNumbers[0]+'_'+nameNumbers[1]+'_'+nameNumbers[2]+'.jpg';
		fs.rename(path.join(Heron.project.activeTakePath,Heron.project.shots[Heron.project.activeShot].takes[Heron.project.activeTake].frames[i].frameName), path.join(Heron.project.activeTakePath,newFrameName), function(err) {
			if ( err ) console.log('ERROR: ' + err);
		});
		Heron.project.shots[Heron.project.activeShot].takes[Heron.project.activeTake].frames[i-1]=Heron.project.shots[Heron.project.activeShot].takes[Heron.project.activeTake].frames[i];
		Heron.project.shots[Heron.project.activeShot].takes[Heron.project.activeTake].frames[i-1].frameNumber=i-1;

		// Name
		Heron.project.shots[Heron.project.activeShot].takes[Heron.project.activeTake].frames[i-1].frameName=newFrameName;
		i++;
	}
	delete Heron.project.shots[Heron.project.activeShot].takes[Heron.project.activeTake].frames[i-1];
	saveJson();
	let data = {project:Heron.project, deletedFrame:id};
	mainWindow.webContents.send('frame:deleted', data);
//	mainWindow.webContents.send('frame:deleted', data);
	
//	let frames = Heron.project.shots[Heron.project.activeShot].takes[Heron.project.activeTake].frames;
//	const frameCount = Object.keys(frames).length;
	
//	mainWindow.webContents.send('frame:deleted', Heron.project);
//	mainWindow.webContents.send('take:load', Heron.project);
	
//	let j=1;
//	// For each frame = get its data ; akiras la datumojn de cxiuj bildoj
//	if (frameCount!=0) {
//		for (frame in frames) {
//			const framePath = path.join(Heron.project.activeTakePath, frames[frame].frameName);
//			const frameData = {frameData: framePath,frameNumber:j};
//			mainWindow.webContents.send('frame:load', frameData);
//			j++;
//		}
//	}
});
/** END CAMERA FUNCTIONS **/


/** MISC FUNCTIONS **/
// Adds 0s to the numbers for the name of files ; aldonas 0jn al la numbro de la dosieroj.
function getNames(shot, take, frame){
	if(shot<10) shotNumberDisplay = '000'+shot;
	else if(shot<100) shotNumberDisplay = '00'+shot;
	else if(shot<1000) shotNumberDisplay = '0'+shot;
	else shotNumberDisplay = shot;
	if(take<10) takeNumberDisplay = '000'+take;
	else if(take<100) takeNumberDisplay = '00'+take;
	else if(take<1000) takeNumberDisplay = '0'+take;
	else takeNumberDisplay = take;
	if(frame<10) frameNumberDisplay = '000'+frame;
	else if(frame<100) frameNumberDisplay = '00'+frame;
	else if(frame<1000) frameNumberDisplay = '0'+frame;
	else frameNumberDisplay = frame;
	
	return [shotNumberDisplay, takeNumberDisplay, frameNumberDisplay];
}

// Removes diacritics and other special characters ; foririgxas de la texto la specialajn literojn
function cleanString(string) {
    
    var string = string.replace(/[|&;.°!?§$€£*%@'`^¨"\/=+:<>()+,]/g, '');
    string = string.replace(/ /g, '_');

    return removeDiacritics(string);
}

function removeDiacritics (str) {
    var diacriticsMap = {
        A: /[\u0041\u24B6\uFF21\u00C0\u00C1\u00C2\u1EA6\u1EA4\u1EAA\u1EA8\u00C3\u0100\u0102\u1EB0\u1EAE\u1EB4\u1EB2\u0226\u01E0\u00C4\u01DE\u1EA2\u00C5\u01FA\u01CD\u0200\u0202\u1EA0\u1EAC\u1EB6\u1E00\u0104\u023A\u2C6F]/g,
        AA: /[\uA732]/g,
        AE: /[\u00C6\u01FC\u01E2]/g,
        AO: /[\uA734]/g,
        AU: /[\uA736]/g,
        AV: /[\uA738\uA73A]/g,
        AY: /[\uA73C]/g,
        B: /[\u0042\u24B7\uFF22\u1E02\u1E04\u1E06\u0243\u0182\u0181]/g,
        C: /[\u0043\u24B8\uFF23\u0106\u0108\u010A\u010C\u00C7\u1E08\u0187\u023B\uA73E]/g,
        D: /[\u0044\u24B9\uFF24\u1E0A\u010E\u1E0C\u1E10\u1E12\u1E0E\u0110\u018B\u018A\u0189\uA779]/g,
        DZ: /[\u01F1\u01C4]/g,
        Dz: /[\u01F2\u01C5]/g,
        E: /[\u0045\u24BA\uFF25\u00C8\u00C9\u00CA\u1EC0\u1EBE\u1EC4\u1EC2\u1EBC\u0112\u1E14\u1E16\u0114\u0116\u00CB\u1EBA\u011A\u0204\u0206\u1EB8\u1EC6\u0228\u1E1C\u0118\u1E18\u1E1A\u0190\u018E]/g,
        F: /[\u0046\u24BB\uFF26\u1E1E\u0191\uA77B]/g,
        G: /[\u0047\u24BC\uFF27\u01F4\u011C\u1E20\u011E\u0120\u01E6\u0122\u01E4\u0193\uA7A0\uA77D\uA77E]/g,
        H: /[\u0048\u24BD\uFF28\u0124\u1E22\u1E26\u021E\u1E24\u1E28\u1E2A\u0126\u2C67\u2C75\uA78D]/g,
        I: /[\u0049\u24BE\uFF29\u00CC\u00CD\u00CE\u0128\u012A\u012C\u0130\u00CF\u1E2E\u1EC8\u01CF\u0208\u020A\u1ECA\u012E\u1E2C\u0197]/g,
        J: /[\u004A\u24BF\uFF2A\u0134\u0248]/g,
        K: /[\u004B\u24C0\uFF2B\u1E30\u01E8\u1E32\u0136\u1E34\u0198\u2C69\uA740\uA742\uA744\uA7A2]/g,
        L: /[\u004C\u24C1\uFF2C\u013F\u0139\u013D\u1E36\u1E38\u013B\u1E3C\u1E3A\u0141\u023D\u2C62\u2C60\uA748\uA746\uA780]/g,
        LJ: /[\u01C7]/g,
        Lj: /[\u01C8]/g,
        M: /[\u004D\u24C2\uFF2D\u1E3E\u1E40\u1E42\u2C6E\u019C]/g,
        N: /[\u004E\u24C3\uFF2E\u01F8\u0143\u00D1\u1E44\u0147\u1E46\u0145\u1E4A\u1E48\u0220\u019D\uA790\uA7A4]/g,
        NJ: /[\u01CA]/g,
        Nj: /[\u01CB]/g,
        O: /[\u004F\u24C4\uFF2F\u00D2\u00D3\u00D4\u1ED2\u1ED0\u1ED6\u1ED4\u00D5\u1E4C\u022C\u1E4E\u014C\u1E50\u1E52\u014E\u022E\u0230\u00D6\u022A\u1ECE\u0150\u01D1\u020C\u020E\u01A0\u1EDC\u1EDA\u1EE0\u1EDE\u1EE2\u1ECC\u1ED8\u01EA\u01EC\u00D8\u01FE\u0186\u019F\uA74A\uA74C]/g,
        OI: /[\u01A2]/g,
        OO: /[\uA74E]/g,
        OU: /[\u0222]/g,
        P: /[\u0050\u24C5\uFF30\u1E54\u1E56\u01A4\u2C63\uA750\uA752\uA754]/g,
        Q: /[\u0051\u24C6\uFF31\uA756\uA758\u024A]/g,
        R: /[\u0052\u24C7\uFF32\u0154\u1E58\u0158\u0210\u0212\u1E5A\u1E5C\u0156\u1E5E\u024C\u2C64\uA75A\uA7A6\uA782]/g,
        S: /[\u0053\u24C8\uFF33\u1E9E\u015A\u1E64\u015C\u1E60\u0160\u1E66\u1E62\u1E68\u0218\u015E\u2C7E\uA7A8\uA784]/g,
        T: /[\u0054\u24C9\uFF34\u1E6A\u0164\u1E6C\u021A\u0162\u1E70\u1E6E\u0166\u01AC\u01AE\u023E\uA786]/g,
        TZ: /[\uA728]/g,
        U: /[\u0055\u24CA\uFF35\u00D9\u00DA\u00DB\u0168\u1E78\u016A\u1E7A\u016C\u00DC\u01DB\u01D7\u01D5\u01D9\u1EE6\u016E\u0170\u01D3\u0214\u0216\u01AF\u1EEA\u1EE8\u1EEE\u1EEC\u1EF0\u1EE4\u1E72\u0172\u1E76\u1E74\u0244]/g,
        V: /[\u0056\u24CB\uFF36\u1E7C\u1E7E\u01B2\uA75E\u0245]/g,
        VY: /[\uA760]/g,
        W: /[\u0057\u24CC\uFF37\u1E80\u1E82\u0174\u1E86\u1E84\u1E88\u2C72]/g,
        X: /[\u0058\u24CD\uFF38\u1E8A\u1E8C]/g,
        Y: /[\u0059\u24CE\uFF39\u1EF2\u00DD\u0176\u1EF8\u0232\u1E8E\u0178\u1EF6\u1EF4\u01B3\u024E\u1EFE]/g,
        Z: /[\u005A\u24CF\uFF3A\u0179\u1E90\u017B\u017D\u1E92\u1E94\u01B5\u0224\u2C7F\u2C6B\uA762]/g,
        a: /[\u0061\u24D0\uFF41\u1E9A\u00E0\u00E1\u00E2\u1EA7\u1EA5\u1EAB\u1EA9\u00E3\u0101\u0103\u1EB1\u1EAF\u1EB5\u1EB3\u0227\u01E1\u00E4\u01DF\u1EA3\u00E5\u01FB\u01CE\u0201\u0203\u1EA1\u1EAD\u1EB7\u1E01\u0105\u2C65\u0250]/g,
        aa: /[\uA733]/g,
        ae: /[\u00E6\u01FD\u01E3]/g,
        ao: /[\uA735]/g,
        au: /[\uA737]/g,
        av: /[\uA739\uA73B]/g,
        ay: /[\uA73D]/g,
        b: /[\u0062\u24D1\uFF42\u1E03\u1E05\u1E07\u0180\u0183\u0253]/g,
        c: /[\u0063\u24D2\uFF43\u0107\u0109\u010B\u010D\u00E7\u1E09\u0188\u023C\uA73F\u2184]/g,
        d: /[\u0064\u24D3\uFF44\u1E0B\u010F\u1E0D\u1E11\u1E13\u1E0F\u0111\u018C\u0256\u0257\uA77A]/g,
        dz: /[\u01F3\u01C6]/g,
        e: /[\u0065\u24D4\uFF45\u00E8\u00E9\u00EA\u1EC1\u1EBF\u1EC5\u1EC3\u1EBD\u0113\u1E15\u1E17\u0115\u0117\u00EB\u1EBB\u011B\u0205\u0207\u1EB9\u1EC7\u0229\u1E1D\u0119\u1E19\u1E1B\u0247\u025B\u01DD]/g,
        f: /[\u0066\u24D5\uFF46\u1E1F\u0192\uA77C]/g,
        g: /[\u0067\u24D6\uFF47\u01F5\u011D\u1E21\u011F\u0121\u01E7\u0123\u01E5\u0260\uA7A1\u1D79\uA77F]/g,
        h: /[\u0068\u24D7\uFF48\u0125\u1E23\u1E27\u021F\u1E25\u1E29\u1E2B\u1E96\u0127\u2C68\u2C76\u0265]/g,
        hv: /[\u0195]/g,
        i: /[\u0069\u24D8\uFF49\u00EC\u00ED\u00EE\u0129\u012B\u012D\u00EF\u1E2F\u1EC9\u01D0\u0209\u020B\u1ECB\u012F\u1E2D\u0268\u0131]/g,
        j: /[\u006A\u24D9\uFF4A\u0135\u01F0\u0249]/g,
        k: /[\u006B\u24DA\uFF4B\u1E31\u01E9\u1E33\u0137\u1E35\u0199\u2C6A\uA741\uA743\uA745\uA7A3]/g,
        l: /[\u006C\u24DB\uFF4C\u0140\u013A\u013E\u1E37\u1E39\u013C\u1E3D\u1E3B\u017F\u0142\u019A\u026B\u2C61\uA749\uA781\uA747]/g,
        lj: /[\u01C9]/g,
        m: /[\u006D\u24DC\uFF4D\u1E3F\u1E41\u1E43\u0271\u026F]/g,
        n: /[\u006E\u24DD\uFF4E\u01F9\u0144\u00F1\u1E45\u0148\u1E47\u0146\u1E4B\u1E49\u019E\u0272\u0149\uA791\uA7A5]/g,
        nj: /[\u01CC]/g,
        o: /[\u006F\u24DE\uFF4F\u00F2\u00F3\u00F4\u1ED3\u1ED1\u1ED7\u1ED5\u00F5\u1E4D\u022D\u1E4F\u014D\u1E51\u1E53\u014F\u022F\u0231\u00F6\u022B\u1ECF\u0151\u01D2\u020D\u020F\u01A1\u1EDD\u1EDB\u1EE1\u1EDF\u1EE3\u1ECD\u1ED9\u01EB\u01ED\u00F8\u01FF\u0254\uA74B\uA74D\u0275]/g,
        oi: /[\u01A3]/g,
        ou: /[\u0223]/g,
        oo: /[\uA74F]/g,
        p: /[\u0070\u24DF\uFF50\u1E55\u1E57\u01A5\u1D7D\uA751\uA753\uA755]/g,
        q: /[\u0071\u24E0\uFF51\u024B\uA757\uA759]/g,
        r: /[\u0072\u24E1\uFF52\u0155\u1E59\u0159\u0211\u0213\u1E5B\u1E5D\u0157\u1E5F\u024D\u027D\uA75B\uA7A7\uA783]/g,
        s: /[\u0073\u24E2\uFF53\u015B\u1E65\u015D\u1E61\u0161\u1E67\u1E63\u1E69\u0219\u015F\u023F\uA7A9\uA785\u1E9B]/g,
        ss: /[\u00DF]/g,
        t: /[\u0074\u24E3\uFF54\u1E6B\u1E97\u0165\u1E6D\u021B\u0163\u1E71\u1E6F\u0167\u01AD\u0288\u2C66\uA787]/g,
        tz: /[\uA729]/g,
        u: /[\u0075\u24E4\uFF55\u00F9\u00FA\u00FB\u0169\u1E79\u016B\u1E7B\u016D\u00FC\u01DC\u01D8\u01D6\u01DA\u1EE7\u016F\u0171\u01D4\u0215\u0217\u01B0\u1EEB\u1EE9\u1EEF\u1EED\u1EF1\u1EE5\u1E73\u0173\u1E77\u1E75\u0289]/g,
        v: /[\u0076\u24E5\uFF56\u1E7D\u1E7F\u028B\uA75F\u028C]/g,
        vy: /[\uA761]/g,
        w: /[\u0077\u24E6\uFF57\u1E81\u1E83\u0175\u1E87\u1E85\u1E98\u1E89\u2C73]/g,
        x: /[\u0078\u24E7\uFF58\u1E8B\u1E8D]/g,
        y: /[\u0079\u24E8\uFF59\u1EF3\u00FD\u0177\u1EF9\u0233\u1E8F\u00FF\u1EF7\u1E99\u1EF5\u01B4\u024F\u1EFF]/g,
        z: /[\u007A\u24E9\uFF5A\u017A\u1E91\u017C\u017E\u1E93\u1E95\u01B6\u0225\u0240\u2C6C\uA763]/g
    };
    for (var x in diacriticsMap) {
        // Iterate through each keys in the above object and perform a replace
        str = str.replace(diacriticsMap[x], x);
    }
    return str;
}