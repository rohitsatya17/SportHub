var Sporthub = function(){

	var appRun = (localStorage.getItem('appState') ? (localStorage.getItem('appState') === 'true') : true);

	return {

		switchAppState: function(){

			appRun = !appRun;
			localStorage.setItem('appState',appRun);

		},

		getAppState : function(){

			return appRun;

		}

	};

}();

Sporthub.cricketService = function(){

	var apiURL = 'http://cricscore-api.appspot.com/csa';

	return{

		getAllMatches: function(){
			
			return $.ajax({
				method: 'GET',
				url: apiURL,
				headers: {'Content-Type': false}
				
			}).then(function(res){
				return res;
			},
			function(err){

			});

		},

		//Get single match data
		getMatchData: function(id){

			return $.ajax({
				method: 'GET',
				url: apiURL + '?id=' + id,
				headers: {'Content-Type': false},
				
			}).then(function(res){
				return res;
			},
			function(err){

			});

		},

		//Getting multiple match data in one request
		getMultipleMatchData: function(ids){

			var ids_string = '';

			for(var i in ids)
				ids_string += ids[i] + '+';

			return $.ajax({
				method: 'GET',
				url: apiURL + '?id=' + ids_string,
				headers: {'Content-Type': false},
				
			}).then(function(res){			
				return res;
			},
			function error(err){
				
			});

		}

	};

}();

Sporthub.cricketNotif = function(){

	var notifIntervalId = null,
		errorWithMatchData = false, //True if an error occurred while fetching all matches data
		showMatchesCtr = 999; //Used for unique id of notification on clicking show score

	chrome.notifications.onButtonClicked.addListener(function callback(notificationId, buttonIndex){

		chrome.tabs.create({'url': "http://www.cricinfo.com/ci/engine/match/"+notificationId.split('-')[0]+".html"});

	});

	var loadMatchesData = function(ctr){

		//Chrome notification callback
		var call = function(res){
		      
		}

		/*var formatNotif = function(){ //Set target and batting team
		var title = matchesData[match].si.replace(/[0-9]+\/[0-9][0-9]?(\s)*(\*)?/g,''),
				//score = matchesData[match].si.match(/[0-9]+\/[0-9][0-9]?(\s)*(\*)?/g),
				teams = (matchesData[match].si.replace(/(\s)+v(\s)+/g,'|')).split('|'),
				batting = '',
				target = '';*/

			//if(teams[0].match(/\*/g)) //Current batting team
			/*	batting = teams[0];
			else if(teams[0].match(/[0-9]+\/[0-9][0-9]?(\s)*(\*)?/g)) //Already batted
				target = teams[0].match(/[0-9]+\/[0-9][0-9]?(\s)*(\*)?/g);

			*/
			//if(teams[1].match(/\*/g))
			/*	batting = teams[1];
			else if(teams[1].match(/[0-9]+\/[0-9][0-9]?(\s)*(\*)?/g))
				target = teams[1].match(/[0-9]+\/[0-9][0-9]?(\s)*(\*)?/g);

			if(batting !== '')
				title += '\n' + 'Batting team: ' + batting;

			if(target !== '')
				title += '\n' + 'Target: ' + target[0].split('/')[0];
		}*/
			
		Sporthub.cricketService.getAllMatches().then(function(matches){

			var	ids = [],
				primarySel = 'international',
	    		teamsSelected = ['all'];

	    	if(!localStorage.getItem('spt-onlyothers')){

		    	if(localStorage.getItem('spt-primary'))
		    		primarySel = localStorage.getItem('spt-primary');

		    	if(primarySel === 'international'){

			    	if(localStorage.getItem('spt-intlteams'))
			    		teamsSelected = localStorage.getItem('spt-intlteams').split(';');

			    	if(teamsSelected[0] === 'all'){

			    		var internationalTeams = ['India','Australia','England','South Africa', 'Sri Lanka', 'West indies', 'New Zealand', 'Bangaldesh', 'Zimbabwe', 'Pakistan'];
			    		teamsSelected = [];

			    		for(var i in internationalTeams)
			    			teamsSelected.push(internationalTeams[i]);

			    	}

					for(var match in matches){

						var t1 = matches[match].t1.trim(),
							t2 = matches[match].t2.trim();

						if((teamsSelected.indexOf(t1) >= 0) || (teamsSelected.indexOf(t2) >= 0))
							ids.push(matches[match].id);

					}

				}
				else{  //primarySel === 'all'
					
					for(var match in matches){

						ids.push(matches[match].id);

					}

				}

			}
			
			if(localStorage.getItem('spt-otherteams')){

				teamsSelected = localStorage.getItem('spt-otherteams').split(',');

				for(var match in matches){

					var t1 = matches[match].t1.trim(),
						t2 = matches[match].t2.trim();

					if((teamsSelected.indexOf(t1) >= 0) || (teamsSelected.indexOf(t2) >= 0))
						ids.push(matches[match].id);

				}

			}


			if(ids.length){

				if(errorWithMatchData){
					//Send a separate request for each id
					for(var id in ids){

						Sporthub.cricketService.getMatchData(ids[id]).then(function(matchData){
							
							if(matchData[0].si.match(/\*/g) && !matchData[0].de.match(/((\s)?-(\s)?Stumps(\s)?)$/g)){

								chrome.notifications.create(matchData[0].id.toString()+ "-" +ctr, {
								    type : "basic",
								    title: matchData[0].si,
								    message: matchData[0].de,
								    iconUrl: "images/icon.png",
								    buttons: [{title:"View Scorecard"}]
								}, call);

							}

						},
						function (){
					
						});
					}
				}
				else{

					Sporthub.cricketService.getMultipleMatchData(ids).then(function(matchesData){

						for(var match in matchesData){

							if(matchesData[match].si.match(/\*/g) && !matchesData[match].de.match(/((\s)?-(\s)?Stumps(\s)?)$/g)){

								chrome.notifications.create(matchesData[match].id.toString()+ "-" +ctr, {
								    type : "basic",
								    title: matchesData[match].si,
								    message: matchesData[match].de,
								    iconUrl: "images/icon.png",
								    buttons: [{title:"View Scorecard"}]
								}, call);

							}

						}
					},
					function(){

						errorWithMatchData = true;

						Sporthub.cricketNotif.stopNotifs();
						Sporthub.cricketNotif.init();

					});

				}

			}

		},
		function(){

		});

	}

	return {

		init: function(){
			
			loadMatchesData(0);

			if(localStorage.getItem('spt-interval'))
				Sporthub.cricketNotif.generateUpdatedNotifs(1000 * 60 * parseInt(localStorage.getItem('spt-interval')));
			else
				Sporthub.cricketNotif.generateUpdatedNotifs(1000 * 60 * 15);

		},

		generateUpdatedNotifs : function(interval){

			var ctr = 0; //Used to generate different id's for new notifs

			notifIntervalId = setInterval(function(){
				
				loadMatchesData(ctr);
				ctr++;

			},interval);

		},

		stopNotifs: function(){
			
			clearInterval(notifIntervalId);

		},

		showMatches: function(){

			loadMatchesData(showMatchesCtr++);

		}

	};

}();

window.addEventListener('load', function(){
	
	if(localStorage.getItem('appState') && (localStorage.getItem('appState') === 'true'))
		Sporthub.cricketNotif.init();

});
