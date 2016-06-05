function createViz(){
	d3.csv("data/mmg.csv", renderCharts);
}

function renderCharts(mmgData){
	
	var verbose = false;
	if (verbose){
		console.log(mmgData);
	}
	//build svg areas
	//flexbox is still awesome and lets me pretend it's good old Java
	
	mainWidth = 800
	overallBox = d3.select("body")
	.append("div")
	.attr("id", "overallBox")
	.style("flex-direction", "column");
	
	topRowBox = d3.select("#overallBox")
	.append("div")
	.attr("id", "topRowBox")
	.style("flex-direction", "row");
	
	topRowBox
	.append("svg")
	.attr("id", "arcChart")
	.attr("width", mainWidth)
	.attr("height", 500);
	
	topRowBox
	.append("svg")
	.attr("id", "pieBox")
	.attr("width", mainWidth/2)
	.attr("height", 500);
	
	secondRowBox = overallBox
	.append("div")
	.attr("id", "secondRowBox")
	.style("display", "flex")
	.style("flex-direction", "row");
		
	secondRowBox
	.append("div")
	.attr("id", "citationBox")
	//too lazy to reindex the widths right now. #bigsorry
	.attr("width", 300)
	.attr("height", 600)
	.style("max-height", 600)
	.style("overflow-y", "auto");
	
	citationList = d3.select("#citationBox")
	.append("ul")
	.attr("id", "citationList");
		
	//for debugging
	// for (i = 1; i < 10; i++){
		// citationList.append("li")
		// .html("This is item " + i);
	// }
	
	secondRowBox
	.append("div")
	.attr("id", "discBox")
	.attr("width", 200)
	.attr("height", 600)
	.style("max-height", 600)
	.style("overflow-y", "auto");

	
	
	mediaSpot = d3.select("div#overallBox")
	.insert("audio", "div#secondRowBox")
	.attr("id", "mediaSpot")
	//present only for debugging
	.attr("controls", "")
	.attr("src", "data/mmg2.mp3");
	//mediaSpot.node().play();
	var myAudio = document.getElementsByTagName("audio")[0];
	myAudio.addEventListener("play", startTransitions);
	
	
	//set up the piechart data
	var cited = [];
	
	pieGroup = d3.select("svg#pieBox")
	.append("g")
	.attr("id", "pieG")
	.attr("transform", "translate(200,200)");
	
	pieLayout = d3.layout.pie().value(function(d){return d.values.length}).sort(null);
	
	pieArc = d3.svg.arc().outerRadius(200);
	
	pieColorScale = d3.scale.category10(["History", "Military", "Math", "Logic", "Literature", "Art", "Science"]);
	
	
	
	//build up the arcChart
	
	
	arcChart = d3.select("#arcChart");
	
	lineLength = 600;
	
	//the arcs must be drawn with the center on the line halfway between 1879 and the reldate
	arcXScale = d3.scale.linear().domain([1, 3879]).range([2, lineLength/2]);
	
	tickXScale = d3.scale.linear().domain([1, 3879]).range([2, lineLength]);

	
	arcChart
	.append("g")
	.attr("id", "baseline")
	.attr("transform", "translate(700,310)")
	.append("line")
	.attr("x1", 0)
	.attr("y1", 0)
	.attr("x2", -lineLength)
	.attr("y2", 0)
	.style("stroke", "white")
	.style("stroke-width", "2px");
	
	d3.select("g#baseline")
	.append("line")
	.attr("id", "year0")
	//I hate how hacky it is to keep doubling the halved scale, but it
	//still performs better.  Argh.
	.attr("x1", 2*arcXScale(-1879))
	.attr("y1", 0)
	.attr("x2", 2*arcXScale(-1879))
	.attr("y2", 20)
	.style("stroke", "green")
	.style("stroke-width", "2px");
	
	d3.select("g#baseline")
	.append("text")
	.attr("transform", "translate(" + (2*arcXScale(-1879) + 5)+", 60)rotate(-90)")
	.text("0 AD")
	.style("fill", "white");

	d3.select("g#baseline")
	.append("text")
	.attr("transform", "translate(" + (2*arcXScale(0))+", 85)rotate(-90)")
	.text("1879 AD")
	.style("fill", "white");

	
	d3.select("g#baseline")
	.append("line")
	.attr("id", "year1879")
	.attr("x1", -arcXScale(0))
	.attr("y1", 0)
	.attr("x2", -arcXScale(0))
	.attr("y2", 20)
	.style("stroke", "green")
	.style("stroke-width", "2px");
	
	arcGen = d3.svg.arc().startAngle(Math.PI/2).endAngle(-Math.PI/2)
	.outerRadius(function(d){
		if (verbose){
			console.log(d.reldate);
			console.log(arcXScale(d.reldate));
		}
		return arcXScale(+d.reldate);
	})
	.innerRadius(function(d){
		if (verbose){
			console.log(d.reldate);
			console.log(arcXScale(d.reldate));
		}
		return arcXScale(+d.reldate) ;
	});
	
	if (verbose){
		console.log(arcGen);
	}
	
	myAudio.play();
	function startTransitions(){
		arcChart.selectAll("g.arc")
		.data(mmgData)
		.enter()
		.append("g")
		.attr("class", "arc")
		.attr("transform", function(d){
			return "translate(" + (700-arcXScale(d.reldate)) + ",310)";
		})
		.append("path")
		.transition(function(d, i){return "transition" + i})
		.duration(1000)
		//.delay(function(d, i){return i * 100})
		.delay(function(d, i){return ((d.seconds-1)*1000)})
		.each("end", makeEntries)
		.attrTween("d", function(d,i,a){
			return function (t){
				tempArcGen = d3.svg.arc().startAngle(Math.PI/2).endAngle(Math.PI/2 - t*(Math.PI))
				.outerRadius(function(d){
					if (verbose){
						console.log(d.reldate);
						console.log(arcXScale(d.reldate));
					}
					return arcXScale(+d.reldate);
				})
				.innerRadius(function(d){
					if (verbose){
						console.log(d.reldate);
						console.log(arcXScale(d.reldate));
					}
					return arcXScale(+d.reldate) ;
				});
				thisArc = tempArcGen(d);
				if (verbose){
					if (i == 5){
						console.log(d);
						console.log(t);
						console.log(thisArc);
					}
				}
				return thisArc;
			}
		})
		.style("fill", "none")
		.style("stroke", "red")
		.style("stroke-width", ".5");
	}
	
	
	
	function makeEntries(d,i){
		if (false){
			console.log("making entries");
		}
		placeTick(d,i);
		//the ? syntax is more concise but I prefer the clarify of if statements
		//pieData[d.field] ? pieData[d.field] = pieData[d.field] + 1 : pieData[d.field] = 1;
		cited.push(d);
		nestedByField = d3.nest()
		.key(function(el){return el.field})
		.entries(cited);
		if (false){
			console.log(nestedByField);
		}
		
		pieG = d3.select("g#pieG");
		//this works but there must be a better way.
		//not only is this hacky an inefficient, but I can't
		//tween it at all, so it's jerky.
		pieG.selectAll("path").remove();
		pieG.selectAll("path")
		.data(pieLayout(nestedByField))
		.enter()
		.append("path")
		.attr("d", pieArc)
		.style("fill", function(d){return pieColorScale(d.data.key)})
		.style("stroke", "black")
		.style("stroke-width", "1px")
		.on("mouseover", pieSliceMouseover)
		.on("mouseout", pieSliceMouseout);
		
		d3.select("g#tooltip").remove();
		
		d3.select("#citationList")
		.append("li")
		.html(d.ref + ": " + d.prettydate)
		.style("color", function(){ return pieColorScale(d.field)})
		.attr("href", "")
		.on("click", function(){
			setDiscussion(d,i);
		})
		.on("mouseover", function(){
			highlight(d,i);
		})
		.on("mouseout", function(){
			unhighlight();
		});
		
		updateScroll();
		
	}
	
	function updateScroll(){
		var element = document.getElementById("citationBox");
		element.scrollTop = element.scrollHeight;
}
	
	function unhighlight(){
		d3.selectAll("g.arc > path")
		.style("stroke", "red")
		.style("stroke-width", "1px");

	};
	
	function highlight(d,i){
		//reset previous selection
		d3.selectAll("g.arc > path")
		.style("stroke", "red")
		.style("stroke-width", "1px");

		//doesn't work yet
		
		d3.selectAll("g.arc").select("path")
		.filter(function(m, i){
			if (true){
				console.log("m:");
				console.log(m);
				console.log("m.field:");
				console.log(m.field);
			}
			return m.ref == d.ref;
		})
		.style("stroke", function(){
			return pieColorScale(d.field);
		})
		.style("stroke-width", "3px")
		.each(function(){
			if (false){
				console.log(this);
				console.log(this.parentElement);
				console.log(this.parentElement.parentElement);
			}
			this.parentElement.parentElement.appendChild(this.parentElement);
		});

	}
	
	function setDiscussion(d, i){
		if (false){
			console.log(d);
		}
		d3.select("#discBox").selectAll("p").remove();
		
		d3.select("#discBox")
		.append("p")
		.html(d.field)
		.style("font-size", "2em")
		.style("color", pieColorScale(d.field));
		
		d3.select("#discBox")
		.append("p")
		.html(d.ref)
		.style("font-size", "1.5em");
		
		d3.select("#discBox")
		.append("p")
		.html(d.explanation)
		.style("color", "white");
		d3.select("#discBox")
		.append("p")
		.append("a")
		.attr("href", d.citation)
		.html(d.citation)
		.style("color", "white");
		
	}
	
	function placeTick(d, i){
		//need to break these out into functions
		if (false){
			console.log("calling placetick");
			console.log("placeTick function using " +d.reldate);
			console.log(i);
		}
		
		dateGroup = d3.select("g#baseline")
		.append("g")
		.attr("class", "dateG")
		.attr("transform", function(m){
			if (verbose){
				console.log("transform function using " + d.reldate);
			}
			//for some reason using the halved scale places more accurate ticks
			//I'll have to make another scale to generate the axis, but I'm
			//concerned I'll run into the same problem.
			return "translate(-" + 2*arcXScale(d.reldate) + ", 0)";
		});
		
		dateGroup
		.append("line")
		.attr("x1", 0)
		.attr("x2", 0)
		.attr("y1", 0)
		.attr("y2", 10)
		.style("stroke", "white")
		.style("stroke-width", "1px");
		
		
		yOffsets = {"Sir Caradoc": 80, "Battle of Waterloo": 120, "Binomial Nomenclature": 120, "Gerard Dow": 80, "Zoffany": 120, "HMS Pinafore": 120, "Caractacus (Man)": 95, "Caractacus (Statue)":120, "Mamelon":120, "Ravelin":120, "Mauser Rifle":120, "Commissariat":120, "Beginning of the Century":120, "Heliogabalus": 100, "Calculus":120};

		dateGroup
		.append("text")
		.style("opacity", 0)
		.style("fill", "white")
		.attr("text-anchor", "middle")
		.text(function(){return d.prettydate})
		//.attr("transform", "translate(0,20)")
		.attr("transform", function(){
			if (yOffsets[d.ref]){
				return "translate(0, " + (yOffsets[d.ref] - 20)+")";
			} else {
				return "translate(0,25)";
			}
		})

		.transition()
		.duration(1000)
		.style("opacity", 100)
		.transition()
		.duration(500)
		.style("opacity", 0)
		.remove();
		
		
		dateGroup
		.append("text")
		.style("opacity", 0)
		.style("fill", "white")
		.attr("text-anchor", "middle")
		.text(function(){return d.ref})
		.style("fill", function(){
			return pieColorScale(d.field);
		})
		.style("font-size", 18)
		.attr("transform", function(){
			if (yOffsets[d.ref]){
				return "translate(0, " + yOffsets[d.ref]+")";
			} else {
				return "translate(0,40)";
			}
		})
		.transition()
		.duration(1000)
		.style("opacity", 100)
		.transition()
		.duration(500)
		.style("opacity", 0)
		.remove();
		
		
		
		
		
		
	}
	
	function pieSliceMouseover(d, i){
		if (false){
			console.log(d);
		}
		d3.select("svg#pieBox")
		.append("g")
		.attr("id", "tooltip")
		.attr("transform", "translate(200,450)")
		.append("text")
		.attr("text-anchor", "middle")
		.style("font-size", "2em")
		.text(function(){return d.data.key})
		.style("fill", "white");
		
		d3.selectAll("g.arc").select("path")
		.filter(function(m, i){
			if (false){
				console.log("m:");
				console.log(m);
				console.log("m.field:");
				console.log(m.field);
			}
			return m.field == d.data.key;
		})
		.style("stroke", function(){
			return pieColorScale(d.data.key);
		})
		.style("stroke-width", "3px")
		.each(function(){
			if (false){
				console.log(this);
				console.log(this.parentElement);
				console.log(this.parentElement.parentElement);
			}
			this.parentElement.parentElement.appendChild(this.parentElement);
		});
	}
	
	function pieSliceMouseout(d, i){
		d3.select("svg#pieBox").select("g#tooltip").remove();
		d3.selectAll("g.arc > path")
		.style("stroke", "red")
		.style("stroke-width", "1px");
	}
	
	
}