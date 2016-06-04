function createViz(){
	d3.csv("data/mmg.csv", renderCharts);
}

function renderCharts(mmgData){
	
	var verbose = false;
	console.log(mmgData);
	//build svg areas
	//flexbox is still awesome and lets me pretend it's good old Java
	
	mainWidth = 800
	overallBox = d3.select("body")
	.append("div")
	.attr("id", "overallBox")
	.style("flex-direction", "column");
	
	overallBox
	.append("svg")
	.attr("id", "arcChart")
	.attr("width", mainWidth)
	.attr("height", 600);
	
	secondRowBox = overallBox
	.append("div")
	.attr("id", "secondRowBox")
	.style("flex-direction", "row");
	
	secondRowBox
	.append("svg")
	.attr("id", "pieBox")
	.attr("width", mainWidth/2)
	.attr("height", 600);
	
	secondRowBox
	.append("svg")
	.attr("id", "discBox")
	.attr("width", mainWidth/2)
	.attr("height", 600);
	
	//build up the arcChart
	
	
	arcChart = d3.select("#arcChart");
	
	lineLength = 600;
	
	//the arcs must be drawn with the center on the line halfway between 1879 and the reldate
	arcXScale = d3.scale.linear().domain([1, 3879]).range([2, lineLength/2]);
	
	tickXScale = d3.scale.linear().domain([1, 3879]).range([2, lineLength]);

	
	arcChart
	.append("g")
	.attr("id", "baseline")
	.attr("transform", "translate(700,300)")
	.append("line")
	.attr("x1", 0)
	.attr("y1", 0)
	.attr("x2", -lineLength)
	.attr("y2", 0)
	.style("stroke", "black")
	.style("stroke-width", "1px");
	
	d3.select("g#baseline")
	.append("line")
	.attr("id", "year0")
	//I hate how hacky it is to keep doubling the halved scale, but it
	//still performs better.  Argh.
	.attr("x1", 2*arcXScale(-1879))
	.attr("y1", 0)
	.attr("x2", 2*arcXScale(-1879))
	.attr("y2", 20)
	.style("stroke", "blue")
	.style("stroke-width", "1px");
	
	d3.select("g#baseline")
	.append("text")
	.attr("transform", "translate(" + (2*arcXScale(-1879) + 5)+", 60)rotate(-90)")
	.text("0 AD");

	d3.select("g#baseline")
	.append("text")
	.attr("transform", "translate(" + (2*arcXScale(0))+", 85)rotate(-90)")
	.text("1879 AD");

	
	d3.select("g#baseline")
	.append("line")
	.attr("id", "year1879")
	.attr("x1", -arcXScale(0))
	.attr("y1", 0)
	.attr("x2", -arcXScale(0))
	.attr("y2", 20)
	.style("stroke", "blue")
	.style("stroke-width", "1px");
	
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
	
	arcChart.selectAll("g.arc")
	.data(mmgData)
	.enter()
	.append("g")
	.attr("class", "arc")
	.attr("transform", function(d){
		return "translate(" + (700-arcXScale(d.reldate)) + ",300)";
	})
	.append("path")
	.transition(function(d, i){return "transition" + i})
	.duration(1000)
	.delay(function(d, i){return i * 100})
	.each("end", placeTick)
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
	
	function placeTick(d, i){
		if (verbose){
			console.log("calling placetick");
			console.log("placeTick function using " +d.reldate);
			console.log(i);
		}
		
		dateGroup = d3.select("g#baseline")
		.append("g")
		.attr("class", "dateG")
		.attr("transform", function(m){
			console.log("transform function using " + d.reldate);
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
		.style("stroke", "black")
		.style("stroke-width", "1px");
		
		dateGroup
		.append("text")
		.style("opacity", 0)
		.attr("text-anchor", "middle")
		.text(function(){return d.prettydate})
		.attr("transform", "translate(0,20)")
		.transition()
		.duration(1000)
		.style("opacity", 100)
		.transition()
		.duration(500)
		.style("opacity", 0)
		.remove();
		
		
		
		
	}
	
	
	
	
}