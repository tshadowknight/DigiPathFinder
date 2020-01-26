function localizePage(){
	$(".digi_name_placeholder").each(function(){
		$(this).html(localizationData[currentLocale].digimon[$(this).data("digimonid")]);
	});
	$(".move_name_placeholder").each(function(){
		$(this).html(localizationData[currentLocale].moves[$(this).data("moveid")]);
	});
	$("[data-appstring!='']").each(function(){
		$(this).html(localizationData[currentLocale].app[$(this).data("appstring")]);
	});
	$("[data-appstringhint!='']").each(function(){
		$(this).attr("title", localizationData[currentLocale].app[$(this).data("appstringhint")]);
	});
}

function showRoute(route){	
	var pathContent = "";
	if(route.length){	
		for(var i = 0; i < route.length; i++){
			var moves = [];
			Object.keys(pathFinder.wantedSkills).forEach(function(skillId){
				if(pathFinder.digiData[route[i]].moves && pathFinder.digiData[route[i]].moves.indexOf(skillId) != -1){
					moves.push(skillId);					
				}
			});
			if(moves.length){
				pathContent+="<div class='path_digi_node path_digi_node_move '>";
			} else {
				pathContent+="<div class='path_digi_node path_digi_node_regular flex-container'>";
			}
			
			pathContent+="<div class='digi_header flex-item flex-container'>";
			
			pathContent+="<img class='flex-item' src='"+"images/"+route[i]+".png' />";
			pathContent+="<div data-digimonid='"+route[i]+"' class='flex-item digi_name digi_name_placeholder'>";
			//pathContent+=pathFinder.digiData[route[i]].name;
			pathContent+="</div>";
			pathContent+="<div data-target='"+route[i]+"' class='db_link flex-item'>";
			pathContent+="<i class='fa fa-external-link' aria-hidden='true'></i>";
			pathContent+="</div>";
			
			pathContent+="</div>";
			pathContent+="<div class='flex-container moves_list'>";
			for(var j = 0; j < moves.length; j++){
				pathContent+="<center data-moveid='"+moves[j]+"' class='listed_move move_name_placeholder flex-item'></center>";
			}
			pathContent+="</div>";			
			pathContent+="<div title='Set as starting point' class='set_start_button' data-id='"+route[i]+"'><i class='fa fa-forward' aria-hidden='true'></i></div>";
			pathContent+="<div title='Ban from routes' class='set_banned_button' data-id='"+route[i]+"'><i class='fa fa-times' aria-hidden='true'></i></div>";
			pathContent+="</div>";
			if(i < route.length-1){
				if(pathFinder.digiData[route[i]].neighBours.prev.indexOf(String(route[i+1])) != -1){			
					pathContent+="<div class='path_arrow' style='color: #ff4f41'><i class='fa fa-chevron-down' aria-hidden='true' style='font-size:30px;'></i></div>";
				} else {
					pathContent+="<div class='path_arrow' style='color:#3cb367'><i class='fa fa-chevron-down' aria-hidden='true' style='font-size:30px;'></i></div>";
				}
			}
		}
	} else {
		pathContent = "<div data-appstring='no_path_warning' id='no_path_warning'>No route could be found with the current bans!</div>";
	}	
			
		
	$("#path_container_content").hide();
	$("#path_container_content").html(pathContent);
	$("#path_container_content").fadeIn("fast");
	$(".set_start_button").on("click", function(){		
		var source = $(this).data("id");
		$("#start_digi").val(source);
		$("#start_digi").trigger("change");
		if(pathFinder.currentLookupMode == "digi"){
			findDigiRoute();
		} else {
			findSkillRoute();
		}				
	});
	$(".set_banned_button").on("click", function(){		
		pathFinder.bannedDigis[$(this).data("id")] = 1;
		if(pathFinder.currentLookupMode == "digi"){
			findDigiRoute();
		} else {
			findSkillRoute();
		}
		showBans();
	});
	$(".db_link").off().on("click", function(){				;
		window.open(pathFinder.digiData[$(this).data("target")].url, '_blank');
	});	
	
	$("#copy_to_clipboard").on("click", function(){		
		var copyContent = "";
		for(var i = 0; i < route.length; i++){
			var moves = [];
			Object.keys(pathFinder.wantedSkills).forEach(function(skillId){
				if(pathFinder.digiData[route[i]].moves && pathFinder.digiData[route[i]].moves.indexOf(skillId) != -1){
					moves.push(skillId);					
				}
			});
			copyContent+="*"+localizationData[currentLocale].digimon[route[i]]+"\n";
			
			for(var j = 0; j < moves.length; j++){
				copyContent+="\t>"+localizationData[currentLocale].moves[moves[j]]+"\n";
			}
			if(i < route.length-1){
				if(pathFinder.digiData[route[i]].neighBours.prev.indexOf(String(route[i+1])) != -1){	
					copyContent+=localizationData[currentLocale].app.txt_devolve_to+":\n";
				} else {
					copyContent+=localizationData[currentLocale].app.txt_evolve_to+":\n";	
				}
			}
			
		}
		if(copyContent!= ""){
			copyToClipboard(copyContent);
		}		
	});
	localizePage();
}

function copyToClipboard(val){
     var dummy = $('<textarea style="position: fixed; right: -500px;">').val(val).appendTo('body').select()
	document.execCommand('copy')
}

function showBans(){
	var bansContent = "";
	Object.keys(pathFinder.bannedDigis).sort(function(a,b){return pathFinder.digiData[a].name.localeCompare( pathFinder.digiData[b].name)}).forEach(function(id){
		bansContent+="<div class='ban_entry'><div data-digimonid='"+id+"' class='digi_name_placeholder banned_digi_name'></div><div style='width: 20px; display: inline-block;'><div data-id='"+id+"' class='remove_ban_button'><i class='fa fa-times' aria-hidden='true'></i></div></div></div>";
	});
	$("#bans_container").html(bansContent);
	$(".remove_ban_button").on("click", function(){		
		delete pathFinder.bannedDigis[$(this).data("id")];
		findSkillRoute();
		showBans();
	});	
	localizePage();
}

function showSkills(){
	var skillsContent = "";
	Object.keys(pathFinder.wantedSkills).forEach(function(id){
		skillsContent+="<div class='skill_entry  flex-item'><div data-moveid='"+id+"' class='move_name_placeholder'></div><div style='width: 20px; display: inline-block;'><div data-id='"+id+"' class='remove_skill_button'><i class='fa fa-times' aria-hidden='true'></i></div></div></div>";
	});
	$("#skills_container").html(skillsContent);
	$(".remove_skill_button").on("click", function(){		
		delete pathFinder.wantedSkills[$(this).data("id")];		
		showSkills();
		//findSkillRoute();
	});	
	localizePage();
}

function createControls(){
	var content = "";
	
	
	content+="<div class='control_section'>";
	content+="<div data-appstring='header_digimon' class='header'>Digimon</div>";
	content+="<div class='control_block' >";	
	content+="<div class='control_title'><span class data-appstring='start_digimon'>Start Digimon</span>";
	content+="<div id='start_digi_db_link' class='db_link flex-item'>";
	content+="<i class='fa fa-external-link' aria-hidden='true'></i>";
	content+="</div>";
	content+="</div>";
	content+="<select class='digi_select' id='start_digi'>";		
	content+="</select>";	
	content+="<img class='controls_digi_icon' id='start_digi_icon' class='flex-item'/>";
	content+="</div>";
	content+="<div class='controls_arrow' ><i class='fa fa-chevron-right' aria-hidden='true' style='font-size:30px;'></i></div>";
	content+="<div class='control_block' >";
	content+="<div class='control_title'><span data-appstring='end_digimon'>End Digimon</span>";
	content+="<div id='end_digi_db_link' class='db_link flex-item'>";
	content+="<i class='fa fa-external-link' aria-hidden='true'></i>";
	content+="</div>";
	content+="<select class='digi_select' id='end_digi'>";	
	content+="</select>";
	content+="<img class='controls_digi_icon' id='end_digi_icon' class='flex-item'/>";
	
	content+="</div>";
	content+="</div>";
	content+="</div>";
	
	content+="<div class='control_section'>";
	content+="<div data-appstring='header_skills' class='header'>Skills (Max. 8)</div>";
	content+="<div class='skill_controls flex-container'>";
	content+="<select class='digi_select flex-item' id='end_move'>";
	
	content+="</select>";
	//content+="<div class='go_button' id='add_skill'>Add</div>";
	//content+="<div class='go_button' id='find_move_path' style='margin-left: 2px;'>Go!</div>";

	content+="<div id='skills_container'></div>";
	content+="</div>";
	content+="</div>";
	content+="<div class='control_section flex-container'>";
	content+="<div style='margin-right: 5px;' data-appstring='header_bans' class='header'>Bans</div>";
	content+="<div id='bans_container'></div>";
	content+="</div>";
	content+="</div>";
	
	$("#controls").html(content);
	
	var preferredLocale = localStorage.getItem("DigiPathFinder_locale");
	if(preferredLocale){
		$("#locale_select").val(preferredLocale);
		currentLocale = preferredLocale;
	}
	
	
	populateMoveList();
	populateDigimonList("start_digi");
	populateDigimonList("end_digi", true);
	//secondary control pane
	content = "";
	
	content+="<div id='path_tools' class='flex-container'>";		
	content+="<div class='flex-item flex-container' id='find_move_path'>";
	content+="<div data-appstring='calculate_path' class='flex-item'>";
	//content+="Calculate Path";
	content+="</div>";
	content+="</div>";
	content+="</div>";
	content+="<div data-appstringhint='hint_copy' title='Copy the current path to text' id='copy_to_clipboard'><i class='fa fa-files-o' aria-hidden='true'></i></div>";
	
	$("#path_tools_container").html(content);
	
	localizePage();
	
	$("#find_digi_path").on("click", function(){
		findDigiRoute();
	});
	$("#path_tools").on("click", function(){
		findSkillRoute();
	});	
	$("#DNA_ban").on("click", function(){
		pathFinder.defaultBans.DNA.applied = $(this)[0].checked;
	});	
	$("#end_move").on("change", function(){
		if($(this).val() != -1){
			if(Object.keys(pathFinder.wantedSkills).length < 8){
				pathFinder.wantedSkills[$(this).val()] = 1;			
			}
			showSkills();
		}		
	});	
	
	$("#start_digi").on("change", function(){
		$("#start_digi_icon").attr("src", "images/"+$("#start_digi").val()+".png");
		$("#start_digi_db_link").data("target",$("#start_digi").val());
		$("#start_digi_db_link").css("display", "inline");
		$("#start_digi_db_link").show();
	});
	$("#end_digi").on("change", function(){
		if($("#end_digi").val() && pathFinder.digiData[$("#end_digi").val()]){
			$("#end_digi_icon").attr("src", "images/"+$("#end_digi").val()+".png");
			$("#end_digi_db_link").data("target", $("#end_digi").val());
			$("#end_digi_db_link").css("display", "inline");
			$("#end_digi_db_link").show();
		} else {
			$("#end_digi_icon").attr("src", "");
			$("#end_digi_db_link").hide();
		}		
	});
	
	$("#locale_select").on("change", function(){
		currentLocale = $(this).val();
		localStorage.setItem("DigiPathFinder_locale", currentLocale);
		populateMoveList();
		populateDigimonList("start_digi");
		populateDigimonList("end_digi", true);
		localizePage();
	});
	
	$(".db_link").off().on("click", function(){				;
		window.open(pathFinder.digiData[$(this).data("target")].url, '_blank');
	});
	
	$("#start_digi").val($("#start_digi option:first").val());
	$("#start_digi").trigger("change");
	
	$("#end_digi").val($("#end_digi option:first").val());
	$("#end_digi").trigger("change");
	
	$("#load_hider").hide();	
}

function populateDigimonList(target, includeEmpty){
	var content = "";
	var digimonNames = localizationData[currentLocale].digimon;
	if(includeEmpty){
		content+="<option selected value='-1'></option>";
	}
	Object.keys(digimonNames).sort(function(a,b){return digimonNames[a].localeCompare( digimonNames[b])}).forEach(function(id){
		content+="<option value='"+id+"'>"+digimonNames[id]+"</option>";
	});	
	var currentVal = $("#"+target).val();
	$("#"+target).html(content);
	$("#"+target).val(currentVal);
}

function populateMoveList(){
	var content = "";
	var moveNames = localizationData[currentLocale].moves;
	content+="<option value='-1'></option>";
	Object.keys(moveNames).sort(function(a,b){return moveNames[a].localeCompare(moveNames[b])}).forEach(function(id){
		content+="<option value='"+id+"'>"+moveNames[id]+"</option>";
	});	
	var currentVal = $("#end_move").val();
	$("#end_move").html(content);
	$("#end_move").val(currentVal);
}

function findDigiRoute(source, target){
	findSkillRoute();
}

var overlayTimer;
var path;
var digiWorker;
var pathsTried = 0;
var totalPaths = 1;
function findSkillRoute(){
	$("#path_container_content").fadeOut("fast");
	overlayTimer = (new Date).getTime();
	$("#overlay").fadeIn("fast");
	var source = $("#start_digi").val();
	var target = $("#end_digi").val();
	digiWorker = new Worker('digiPathWorker.js');
	digiWorker.postMessage([pathFinder.getParams(), source, target]);
	digiWorker.onmessage = function(e) {
		pathFinder.currentLookupMode = "skill";		
		if(e.data.type == "result"){
			path = e.data.data;
			clearOverlay();
		} else if(e.data.type == "progress_init"){
			totalPaths = e.data.data || 1;
			pathsTried = 0;
			displayProgress();
			$("#progress_display").fadeIn("fast");
		} else if(e.data.type == "progress_update"){
			pathsTried = e.data.data;
			displayProgress();
		}		
	}	
}


function displayProgress(){	
	var percent = String(Math.floor((pathsTried / totalPaths * 100)));
	$("#progress_display").html(percent.padStart(3, "0"));
}

function clearOverlay(){
	if((new Date).getTime() - overlayTimer > 500){
		showRoute(path);
		$("#overlay").fadeOut("fast");
		$("#progress_display").fadeOut("fast");
		$("#progress_goal").html("");
		$("#progress_current").html("");
	} else {
		setTimeout(function(){
			clearOverlay();
		}, 50);
	}
}

var pathFinder;
var currentLocale = "ENG";
var localizationConfig = {
	ENG: {
		moves: "moveNames.json",
		digimon: "digiNames.json",
		app: "appStrings.json"
	},
	JPN: {
		moves: "moveNames_jp.json",
		digimon: "digiNames_jp.json",
		app: "appStrings_jp.json"	
	}
}
var localizationData = {
	ENG: {
		moves: {},
		digimon: {},
		app: {}
	},
	JPN: {
		moves: {},
		digimon: {},
		app: {}
	}
};
$(document).ready(function(){
	var deferreds = [];
	Object.keys(localizationConfig).forEach(function(locale){
		deferreds.push($.getJSON(localizationConfig[locale].moves, function(data){
			localizationData[locale].moves = data;
		}));
		deferreds.push($.getJSON(localizationConfig[locale].digimon, function(data){
			localizationData[locale].digimon = data;
		}));
		deferreds.push($.getJSON(localizationConfig[locale].app, function(data){
			localizationData[locale].app = data;
		}));
	});
	$.when.apply($, deferreds).then(function(){
		pathFinder = new DigiPathFinder();
		pathFinder.init(createControls);	
		$("#worker_cancel").on("click", function(){	
				if(digiWorker){
					digiWorker.terminate();			
				}
				$("#overlay").fadeOut("fast");		
			});
			particlesJS.load('particles', 'particles.json', function() {
			  console.log('callback - particles.js config loaded');
		});		
	});	
});


