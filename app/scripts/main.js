'use strict';	

var app = chrome.extension.getBackgroundPage();

var changeAppState = function(){

	app.Sporthub.switchAppState();

	if(!app.Sporthub.getAppState()){

		app.Sporthub.cricketNotif.stopNotifs();
		$('#appState').html('Launch App');
		$('#appState').css('background-color','rgb(64, 182, 64)');

	}
	else{

		app.Sporthub.cricketNotif.init();
		$('#appState').html('Stop App');
		$('#appState').css('background-color','red');

	}

}

var primarySel = 'all',
	intlteamsSel = 'all';

var saveSettings = function(){

	//localStorage.setItem('spt-intlteams',$('input[name = "intlteams"]:checked').serialize());
	intlteamsSel = '';

	if(($('input[name = "primary"]:checked').serialize()).split('=')[1] === 'international'){

		if($('input[name = "intlteams"]:checked').length){

			var ctr = 0;

			$('input[name = "intlteams"]:checked').each(function(){

				intlteamsSel += (this.value).trim() + ';';
				ctr++;

				if($('input[name = "intlteams"]:checked').length === ctr){

					localStorage.setItem('spt-primary','international');
					localStorage.setItem('spt-intlteams', intlteamsSel);
					loadPartial('main');

				}
					

			});

		}
		else{

			localStorage.setItem('spt-primary','international');
			localStorage.setItem('spt-intlteams', 'all;');
			loadPartial('main');

		}

	}
	else{

		localStorage.setItem('spt-primary','all');
		localStorage.removeItem('spt-intlteams');
		loadPartial('main');

	}

	if($('#other-teams').val() !== ''){
		
		var val = $('#other-teams').val() + ',',
			other_teams = val.split(',');

		for(var i in other_teams){

			if(other_teams[i] !== '')
				other_teams[i] = other_teams[i].trim();
			else
				other_teams.splice(i,1);

		}

		other_teams.push('');
		
		localStorage.setItem('spt-otherteams',other_teams.join(','));

	}
	else if(localStorage.getItem('spt-otherteams'))
		localStorage.removeItem('spt-otherteams');

	if($('input[name = "only-others"]:checked').length)
		localStorage.setItem('spt-onlyothers',true);
	else if(localStorage.getItem('spt-onlyothers'))
		localStorage.removeItem('spt-onlyothers');

	if($('#notifInterval').val()){

		localStorage.setItem('spt-interval', $('#notifInterval').val());
		
		if(localStorage.getItem('appState') && (localStorage.getItem('appState') === 'true')){

			app.Sporthub.cricketNotif.stopNotifs();
			app.Sporthub.cricketNotif.generateUpdatedNotifs(1000 * 60 * parseInt($('#notifInterval').val()));

		}

	}
	else
		localStorage.setItem('spt-interval','15');


}

var APP_FLAG = false;

var loadPartial = function (partialName){
	
   $('#partial').load('views/'+partialName+'.html');

   if(!APP_FLAG || (partialName === 'main'))
   	setEventListeners();

   APP_FLAG = true;
   
}


var setEventListeners = function(){
	
	var internationalTeams = ['India','Australia','England','South Africa', 'Sri Lanka', 'West indies', 'New Zealand', 'Bangaldesh', 'Zimbabwe', 'Pakistan'];

	setTimeout(function(){

   		document.getElementById("appState").addEventListener("click", changeAppState, false);
   		
   		document.getElementById("setting").addEventListener("click", 
   							function() { 

   								loadPartial('settings'); 

   								setTimeout(function(){

									if(localStorage.getItem('spt-primary') && (localStorage.getItem('spt-primary') === 'all')){

										$('input:radio[name=primary][value=all]').attr('checked', true);
										$('.settings #international-teams').css('display','none');
										$('.settings #international-teams .list').html('');	

									}
									else{

   										$('input:radio[name=primary][value=international]').attr('checked', true);
   										$('.settings #international-teams').css('display','block');	
   										$('.settings #international-teams .list').html('');	

   										var sel_teams = [];

   										if(localStorage.getItem('spt-intlteams'))
   											sel_teams = localStorage.getItem('spt-intlteams').split(';');
   										
		   								for(var team in internationalTeams){
		   								
		   									var temp = '<input type="checkbox" name="intlteams" value="'+internationalTeams[team]+ '"' +((sel_teams.indexOf(internationalTeams[team]) >= 0)?'checked':'') +'>'+internationalTeams[team]+'<br>';
											$('.settings #international-teams .list').append(temp);

										}

									}

									if(localStorage.getItem('spt-otherteams'))
										$('#other-teams').val(localStorage.getItem('spt-otherteams'));

									if(localStorage.getItem('spt-onlyothers'))
										$('input:checkbox[name=only-others]').attr('checked', true);										

									if(localStorage.getItem('spt-interval'))
										$('#notifInterval').val(localStorage.getItem('spt-interval'));

									document.getElementById("setting-all").addEventListener("click", function(){

										$('input:radio[name=primary][value=all]').attr('checked', true);
										$('.settings #international-teams').css('display','none');		
										$('.settings #international-teams .list').html('');						

									}, false);

									document.getElementById("setting-intl").addEventListener("click", function(){

										$('.settings #international-teams').css('display','block');	
										$('input:radio[name=primary][value=international]').attr('checked', true);
										$('.settings #international-teams .list').html('');	

		   								for(var team in internationalTeams){
		   									
		   									var temp = '<input type="checkbox" name="intlteams" value="'+internationalTeams[team]+ '">'+internationalTeams[team]+'<br>';
		   									
											$('.settings #international-teams .list').append(temp);

										}	

									}, false);

									document.getElementById("save-settings").addEventListener("click", saveSettings, false);

								},500);

   							}, 
   							false);

	document.getElementById("view-score").addEventListener("click", function(){

		app.Sporthub.cricketNotif.showMatches();
		
	}, false);

	document.getElementById("about").addEventListener("click", function(){

		loadPartial('about');

	}, false);

	document.getElementsByTagName("header")[0].addEventListener("click", function(){

		loadPartial('main');

	}, false);

   },1000);

}

loadPartial('main');

//Check if app is stopped or launched
if(localStorage.getItem('appState') == 'false'){

	setTimeout(function(){

		$('#appState').html('Launch App');
		$('#appState').css('background-color','rgb(64, 182, 64)');

	},100);

}

$('footer time').html((new Date).getFullYear());









