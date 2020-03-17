var heatmapScale = d3.interpolateCool;
function renderSlider() {
    var width = 500;
    var height = 50;
    var barHeight = 20;
    margin = ({top: 20, right: 100, bottom: 30, left: 80});
    colorScale = d3.scaleSequential(heatmapScale).domain([0, 1]);
    axisScale = d3.scaleLinear()
        .domain(colorScale.domain())
        .range([margin.left, width - margin.right]);

    axisBottom = g => g
        .attr("class", `x-axis`)
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(axisScale)
        .ticks(width / 80)
        .tickSize(-barHeight));

    const container = d3.selectAll("#slider");
    var svg = container.append("svg")
    	.attr("height", height)
    	.attr("width", width);

    const defs = svg.append("defs");
    const linearGradient = defs.append("linearGradient")
      .attr("id", "linear-gradient");

    linearGradient.selectAll("stop")
        .data(colorScale.ticks().map((t, i, n) => ({ offset: `${100*i/n.length}%`, color: colorScale(t) })))
        .enter().append("stop")
        .attr("offset", d => d.offset)
        .attr("stop-color", d => d.color);
    
    svg.append('g')
        .attr("transform", `translate(0,${height - margin.bottom - barHeight})`)
        .append("rect")
        .attr('transform', `translate(${margin.left}, 0)`)
	    .attr("width", width - margin.right - margin.left)
	    .attr("height", barHeight)
	    .style("fill", "url(#linear-gradient)");
  
  svg.append('g')
    .call(axisBottom);

}

