DigiPathFinder.prototype.loadJSON = function(path)
{	
	var _this = this;
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function()
    {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200 || xhr.status === 0) {                
                _this.JSONLoaded(path, JSON.parse(xhr.responseText));
            } else {                
                _this.JSONError(xhr);
            }
        }
    };
    xhr.open("GET", path, true);
    xhr.send();
}

DigiPathFinder.prototype.JSONError = function(request){
	
}

DigiPathFinder.prototype.JSONLoaded = function(path, data){
	var _this = this;
	_this.JSONToLoad[path].status = 1;
	_this[_this.JSONToLoad[path].targetVar] = data;
	_this.allJSONLoaded();
}

DigiPathFinder.prototype.allJSONLoaded = function(){
	var _this = this;
	var allLoaded = true;
	Object.keys(_this.JSONToLoad).forEach(function(file){
		if(_this.JSONToLoad[file].status == -1){
			allLoaded = false;
		}
	});	
	if(!allLoaded){
		return;
	}
	this.skillToDigis = {};
	Object.keys(_this.digiData).forEach(function(digiId){
		var moves = _this.digiData[digiId].moves;
		for(var i = 0; i < moves.length; i++){
			if(!_this.skillToDigis[moves[i]]){
				_this.skillToDigis[moves[i]] = {};
			}
			_this.skillToDigis[moves[i]][digiId] = true;
		}		
	});
	this.maxLookupSize = Object.keys(this.digiData).length;
	if(_this.initCallback){
		_this.initCallback();
	}
}

function DigiPathFinder(){
	this.JSONToLoad = {
		"digiData.json": {status: -1, targetVar: "digiData"},
		"moveNames.json": {status: -1, targetVar: "moveNames"}
	};
	this.initCallback = null;
}

DigiPathFinder.prototype.init = function(callback){
	var _this = this;
	_this.initCallback = callback;
	Object.keys(_this.JSONToLoad).forEach(function(file){
		_this.loadJSON(file);
	});	
	this.bannedDigis = {};
	this.wantedSkills = {};
	this.currentLookupMode = -1;
	this.defaultBans = {
	}
}

DigiPathFinder.prototype.getParams = function(){
	var _this = this;
	return {
		"bannedDigis": _this.bannedDigis,
		"wantedSkills": _this.wantedSkills,
		"defaultBans": _this.defaultBans
	};
}

DigiPathFinder.prototype.setParams = function(params){
	var _this = this;
	_this.bannedDigis = params.bannedDigis;
	_this.wantedSkills = params.wantedSkills;
	_this.defaultBans = params.defaultBans;
}

DigiPathFinder.prototype.findClosestSkillHolderPath = function(source, skill, target, skillContext){
	var _this = this;
	return _this.findRoute([source, target], skill, skillContext);
}

DigiPathFinder.prototype.findRoute = function(path, skill, skillContext){
	var _this = this;	
	var source = path[0];
	var target = path[1];
	var stack = [];
	var pathsToSource = {};
	pathsToSource[source] = [];
	var visited = {};
	var pathFound = false;
	stack.push(source);
	while(stack.length && !pathFound){
		var current = stack.shift();		
		var neighbours = _this.digiData[current].neighBours.prev.concat(_this.digiData[current].neighBours.next);
		var ctr = 0;
		var skillCandidate;
		var skillCandidateRating = 0;
		while(ctr < neighbours.length && !pathFound){
			var neighbourId = neighbours[ctr];
			if(!_this.isBanned(neighbourId) && !visited[neighbourId] && neighbourId != current){
				if(skill && _this.skillToDigis[skill][neighbourId]){
					var rating = 0;
					var moves = pathFinder.digiData[neighbourId].moves; 
					for(var k = 0; k < moves.length; k++){
						if(skillContext[moves[k]]){
							rating++;
						}
					}
					if(rating > skillCandidateRating){
						skillCandidateRating = rating;
						skillCandidate = neighbourId;
					}
				}
				if(neighbourId == target){
					pathFound = true;
				} else {
					stack.push(neighbourId);					
				}
				pathsToSource[neighbourId] = pathsToSource[current].concat([current]);				
			}			
			ctr++;
		}
		if(skillCandidate){
			target = skillCandidate;
			pathFound = true;
		}
		visited[current] = true;
	}
	if(!pathsToSource[target]){
		throw("Path not possible");
	}
	return pathsToSource[target].concat([target]);
}

DigiPathFinder.prototype.isBanned = function(id){
	var _this = this;
	var banned = _this.bannedDigis[id];
	if(!banned){
		Object.keys(_this.defaultBans).forEach(function(category){
			if(_this.defaultBans[category].applied && _this.defaultBans[category].bans[id]){
				banned = true;
			}
		});
	}
	return banned;
}