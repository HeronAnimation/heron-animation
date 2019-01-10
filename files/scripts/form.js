//const upButtons = document.querySelectorAll('.inputNumberDecrement');
//
//console.log(upButtons);
//
//for(i=0;i<upButtons.length;i++) {
//	upButtons[i].addEventListener('change', function(e) {
//		console.log(e);
//	});
//}

function inputNumberDecrement(inputId) {
	let min = -Infinity;
	if(document.getElementById(inputId).min!="") min = parseInt(document.getElementById(inputId).min);
	let value = parseInt(document.getElementById(inputId).value);
	let step = parseInt(document.getElementById(inputId).step);
	if(value-step>=min)
	{
		document.getElementById(inputId).value=value-step;
		document.getElementById(inputId).dispatchEvent(new Event('input'));
	}
}

function inputNumberIncrement(inputId) {
	let max = Infinity;
	if(document.getElementById(inputId).max!="")  max = parseInt(document.getElementById(inputId).max);
	let value = parseInt(document.getElementById(inputId).value);

	let step = parseInt(document.getElementById(inputId).step);
//	console.log(value+'+'+step+'<='+max);
	if(value+step<=max)
	{
		document.getElementById(inputId).value=value+step;
		document.getElementById(inputId).dispatchEvent(new Event('input'));
	}else{console.log('no');}
}