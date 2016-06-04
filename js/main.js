function createViz(){
	d3.csv("data/mmg.csv", renderCharts);
}

function renderCharts(mmgData){
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
	
	arcXScale = d3.scale.linear().domain([1, 3879]).range([2, lineLength/2]);

	
	arcChart
	.append("line")
	.attr("x1", 100)
	.attr("y1", 300)
	.attr("x2", 700)
	.attr("y2", 300)
	.style("stroke", "black")
	.style("stroke-width", "6px");
	
	arcGen = d3.svg.arc().startAngle(Math.PI/2).endAngle(-Math.PI/2)
	.outerRadius(function(d){
		console.log(d.reldate);
		console.log(arcXScale(d.reldate));
		return arcXScale(+d.reldate);
	})
	.innerRadius(function(d){
		console.log(d.reldate);
		console.log(arcXScale(d.reldate));
		return arcXScale(+d.reldate) ;
	});
	
	console.log(arcGen);
	
	arcChart.selectAll("g.arc")
	.data(mmgData)
	.enter()
	.append("g")
	.attr("class", "arc")
	.attr("transform", function(d){
		return "translate(" + (700-arcXScale(d.reldate)) + ",300)";
	})
	.append("path")
	.attr("d", function(d){
		thisArc = arcGen(d);
		console.log(thisArc);
		return thisArc;
	})
	.style("stroke", "red")
	.style("stroke-width", ".5");
	
	
	
	
}