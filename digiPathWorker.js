

function findSkillRoute_(pathFinder, source, target){
	
	var path = [source];
	var skillPath = [];
	var skillContext = {};
	var shortestPath;
	try {		
		if(Object.keys(pathFinder.wantedSkills).length){		
			Object.keys(pathFinder.wantedSkills).forEach(function(id){
				if(!pathFinder.skillToDigis[id] || (!pathFinder.skillToDigis[id][target] && !pathFinder.skillToDigis[id][source])){//skills learned by the target and source don't need to be searched
					skillPath.push(id);		
					skillContext[id] = true;	
				}				
			});	
			var fullSkillPaths = [];
			var possiblePaths = permutator(skillPath);	
			var updateStep = 100;
			if(possiblePaths.length > 1000){			
				postMessage({type: "progress_init", data: possiblePaths.length});
				postMessage({type: "progress_update", data: 0});
			}
			for(var i = 0; i < possiblePaths.length; i++){
				var currentSkills = possiblePaths[i];
				var currentSource = source;
				var currentSkillPath = [];
				var coveredSkills = {};
				for(var j = 0; j < currentSkills.length; j++){
					if(!coveredSkills[currentSkills[j]]){					
						var skillNodePath = pathFinder.findClosestSkillHolderPath(currentSource, currentSkills[j], null, skillContext);
						currentSource = skillNodePath[skillNodePath.length-1];
						//register all relevant skills learned by the current waypoint digi
						var moves = pathFinder.digiData[currentSource].moves; 
						for(var k = 0; k < moves.length; k++){
							coveredSkills[moves[k]] = true;
						}
						currentSkillPath = currentSkillPath.concat(skillNodePath.slice(0, -1));
					}
				}		
				if(target != -1){			
					currentSkillPath = currentSkillPath.concat(pathFinder.findRoute([currentSource, target]));
				} else {
					currentSkillPath.push(currentSource);
				}
				fullSkillPaths.push(currentSkillPath);
				if(i % updateStep == 0 && possiblePaths.length > 1000){
					postMessage({type: "progress_update", data: i});
				}
			}
			
			shortestPath = fullSkillPaths[0];
			for(var i = 1; i < fullSkillPaths.length; i++){
				if(shortestPath.length > fullSkillPaths[i].length){
					shortestPath = fullSkillPaths[i];
				}
			}		
		} else if(target != -1) {
			shortestPath = path;
			shortestPath.push(target);
			shortestPath = pathFinder.findRoute(shortestPath);
		} else {
			shortestPath = [];
		}
	} catch (e) {
		shortestPath = [];
	}
	return shortestPath;
}	

function permutator(inputArr) {
  var results = [];

  function permute(arr, memo) {
    var cur, memo = memo || [];

    for (var i = 0; i < arr.length; i++) {
      cur = arr.splice(i, 1);
      if (arr.length === 0) {
        results.push(memo.concat(cur));
      }
      permute(arr.slice(), memo.concat(cur));
      arr.splice(i, 0, cur[0]);
    }

    return results;
  }

  return permute(inputArr);
}

onmessage = function(e) {
	self.importScripts('digiPathFinder.js');	
	console.log('Message received from main script');
	console.log('Posting message back to main script');
	self.workerParams = e.data;
	self.pathFinder = new DigiPathFinder();
	self.pathFinder.init(pathFinderLoaded);	
}

pathFinderLoaded = function(){
	self.pathFinder.setParams(self.workerParams[0]);
	postMessage({type: "result", data: findSkillRoute_(self.pathFinder, self.workerParams[1], self.workerParams[2])});
}