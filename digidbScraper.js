function DigiDBScraper(){
	this.baseURL = "http://digidb.io/digimon-search/?request=";
	this.entries = [];
	for(var i =0; i < 341; i++){
		this.entries.push(i+1);
	}
	this.digiData = {};
	this.digiMoves = {};
	this.moveNames = {};
	this.imageData = {};
	this.done = new $.Deferred();
}

DigiDBScraper.prototype.scrapeEntry = function(){
	var _this = this;
	var entry = _this.entries.pop();
	var url = _this.baseURL+entry;
	_this.digiData[entry] = {
		id: entry,
		name: "",
		moves: [],
		neighBours: {"prev": [], "next": []},
		url: url
	};
	var currentEntry = _this.digiData[entry];
	$.get(url, function(data){
		var $dom = $(data).find(".digiinfo");
		
		var $nameContainer = $dom.find(".digiheader").first();
		_this.imageData[entry] = $($nameContainer).find("img").prop("src");
		var numberAndName = $($nameContainer).find("b").html();
		var nameParts = numberAndName.split(" ");
		nameParts.shift();
		var name = nameParts.join(" ");
		currentEntry.name = name;
		
		var $from = $($dom).find( ":contains(Digivolves From)").closest("table");
		$($from).find("a").each(function(){
			
			var href = $(this).attr("href");
			var id = href.split("=")[1];
			if(typeof id != "undefined"){	
				currentEntry.neighBours.prev.push(id);
			}
		});
		
		var $to = $($dom).find( ":contains(Digivolves Into)").closest("table");
		$($to).find("a").each(function(){
			var href = $(this).attr("href");
			var id = href.split("=")[1];
			if(typeof id != "undefined"){			
				currentEntry.neighBours.next.push(id);
			}
		});
		
		var $movesTable = $($dom).find( ":contains(Attack Name)");
		$($movesTable).find("a").each(function(){
			if($(this).parent().parent().parent().find("td").first().html() != "<b>1</b>"){
				var href = $(this).attr("href");
				var id = href.split("=")[1];
				var name = $(this).html();
				currentEntry.moves.push(id);
				_this.moveNames[id] = name;
			}			
		});
		
		if(_this.entries.length){
			_this.scrapeEntry();
		} else {
			_this.done.resolve();
		}
	});
}

var scraper = new DigiDBScraper();
scraper.scrapeEntry();
$.when(scraper.done.promise()).then(function(){
	download(JSON.stringify(scraper.digiData), "digiData.json", "json");
	download(JSON.stringify(scraper.moveNames), "moveNames.json", "json");
	download(JSON.stringify(scraper.imageData), "imageData.json", "json");
});

// Function to download data to a file
function download(data, filename, type) {
    var file = new Blob([data], {type: type});
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        var a = document.createElement("a"),
                url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);  
        }, 0); 
    }
}