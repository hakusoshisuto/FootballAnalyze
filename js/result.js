//////////////////////////////
// global
//////////////////////////////

var nodeData = node_1st.sort(function(a,b){return a.index-b.index});
var linkAwayData = linkData_barca_1st.sort(function(a,b){return a.patternID-b.patternID});
var linkHomeData = linkData_river_1st.sort(function(a,b){return a.fstS-b.fstS});
/*
var nodeData = node_2nd.sort(function(a,b){a.index-b.index});
var linkAwayData = linkData_barca_2nd.sort(function(a,b){a.fstS-b.fstS});
var linkHomeData = linkData_river_2nd.sort(function(a,b){a.fstS-b.fstS});
*/
var homeTeam = 'RiverPlate';
var awayTeam = 'FC Barcelona';

//////////////////////////////

console.dir(nodeData);
console.dir(linkAwayData);
console.dir(linkHomeData.sort(function(a,b){return a.patternID-b.patternID}));

var graph = new ArcDiagram(nodeData);
var cntSlider = new CntSlider();
var ptnSlider = new PatternLenSlider();

cntSlider.init();
ptnSlider.init();





//////////////////////////////


function ArcDiagram (nodeData) {

  var SVGwidth = 900,
    SVGheight =  780,
    svgMargin = {t: 50, r: 50, b: 50, l: 50},
    uiSize = {
      width:  SVGwidth - svgMargin.l - svgMargin.r,
      height:  SVGheight - svgMargin.t - svgMargin.b
    };

  var core = d3.selectAll('#diagram');
  // initialize
  core.selectAll('svg').remove();

  //////////////////////////////////////
  // 基本設定
  //////////////////////////////////////
  var svg = core.append('svg')
    .attr('width', uiSize.width)
    .attr('height', uiSize.height)
    .attr('transform', 'translate(' + svgMargin.l + ',' + svgMargin.t + ')');

  // 描画領域指定
  var axisGrp = svg.append('g').attr('class', 'axisGrp');


  //////////////////////////////////////
  // 軸設定
  //////////////////////////////////////

  // x軸Scale設定
  var xDomainDef = [0, nodeData.length];  // convert to milliseconds
  var xScale = d3.scale.ordinal()
    .domain(xDomainDef)
    .rangePoints([0, uiSize.width-50]);
  // x軸生成
  var xAxis = d3.svg.axis().scale(xScale).tickValues(0);//.tickSize(0).outerTickSize(0);//.orient('bottom');//.ticks(0);
  axisGrp.append('g').attr('class', 'x axis')
    .attr('transform', 'translate(0, ' + (uiSize.height/2) + ')')
    .call(xAxis);
    // x軸ラベル設定
  //  .selectAll('text')
  //  .text(getXLabel)
  //  .attr('dy', '1em')
  //  .style('text-anchor', 'middle');




  //////////////////////////////////////
  // display node data
  //////////////////////////////////////
  var nodeHeight = 10;
  //var nodeHeight = xScale.range()[1]/nodeData.length;
  var nodeWidth = xScale.range()[1]/nodeData.length;

  var nodeGroup = svg.append('g').attr('class', 'nodeGroup')
    .attr('transform', 'translate(0, ' + (uiSize.height/2 - nodeHeight/2) + ')');

  nodeGroup.selectAll('rect')
    .data(nodeData)
    .enter()
    .append("rect")
    .attr('id', function(d){return 'node'+d.index;})
    .attr("class", function(d,i){
      var res = 'node ';
      if (d.type === 't') {
        if (d.name === 'goal') {
          res += 'goalNode';
        } else {
          res += 'thingNode';
        }
      } else {
        if (d.name === homeTeam) {
          res += 'homeNode';
        } else {
          res += 'awayNode';
        }
      }
      return res;
    })
    .attr("x", function(d,i){return i*nodeWidth;})
    .attr("y", 0)
    .attr("width", nodeWidth)
    .attr("height", nodeHeight);




  //////////////////////////////////////
  // display link data
  //////////////////////////////////////
  var buf = 0,
    size = xScale.range()[1]/nodeData.length,
    strokeWidth = 0;
  //  strokeWidth = size * 0.07;

  var linkGroup = svg.append('g')
    .attr('transform', 'translate(0, ' + (uiSize.height/2) + ')')

  //  .attr('transform', 'translate(' + svgMargin.l + ',' + 0 + ')');

  // setting
  var reg = /^| /g;
  var linkData = [
    {
      name: 'away',
      data: [],
      baseData: linkAwayData,
      startAngle: function(){return 2 * Math.PI/4},
      endAngle: function(){return 6 * Math.PI/4}
    },
    {
      name: 'home',
      data: [],
      baseData: linkHomeData,
      startAngle: function(){return 6 * Math.PI/4},
      endAngle: function(){return 10 * Math.PI/4}
    }
  ];

  updateLink(linkData);


  function updateLink(linkData) {

    for (var i = 0; i < linkData.length; i++) {
      var ld = linkData[i];
      var arc = d3.svg.arc()
        .innerRadius(function(d, i) {
          var iDis = (d.secS - d.fstE);
          var val = (iDis === 0) ? iDis*(buf+strokeWidth) : (iDis-1)*size/2;
          return val;
    //      return val - nodeWidth/2;
        })
        .outerRadius(function(d, i) {
          var oDis = (d.secE - d.fstS+1)/2;
          var val = oDis*size - buf*oDis;
          return val;
    //      return val - nodeWidth/2;
        })
        .startAngle(ld.startAngle)
        .endAngle(ld.endAngle);

      var links = linkGroup.selectAll('path.' + ld.name).data(ld.data);

      // new
      links
        .enter()
        .append("path")
        .attr("class", function(dd){return "arc "+ ld.name  + ' ptnID' + dd.patternID;})
        .attr("d", arc)
        .attr("transform", function(d, i) {
          var xVal = (size * (d.fstE + (d.secS-d.fstE)/2)) + size/2;
    //      var xVal = (size * (d.fstE + (d.secS-d.fstE)/2));
          var mgn = (ld.name === 'home')? -nodeHeight/2 : nodeHeight/2;
          var yVal = mgn;
          return "translate(" + xVal + "," + yVal + ")";
        })
        .on('mouseenter', function(d){
          var className = this.className.baseVal.replace(reg, '.');
          d3.selectAll(className).classed('tgt', true);
        })
        .on('mouseleave', function(d){
          var className = this.className.baseVal.replace(reg, '.');
          d3.selectAll(className).classed('tgt', false);
        });
      // delete
      links.exit().remove();
    }
  }

  // method
  svg.updateLink = updateLink;

  // property
  svg.linkData = linkData;

  return svg;
}






//////////////////////////////////////
// count slider
//////////////////////////////////////

function CntSlider() {

  var x;
  var brush;
  var brushVal = null;

  var margin = {top: 5, right: 20, bottom: 5, left: 20},
      width = 150 - margin.left - margin.right,
      height = 15 - margin.bottom - margin.top;

  var core = d3.selectAll('#cntSlider');
  // initialize
  core.selectAll('svg').remove();
  var svg = core.append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var sliderAxis = svg.append("g")
    .attr("class", "x sliderAxis")
    .attr("transform", "translate(0," + height / 2 + ")");

  var slider = svg.append("g")
      .attr("class", "slider");

  var handle = slider.append("circle")
      .attr("class", "sliderHandle")
      .attr("transform", "translate(0," + height / 2 + ")")
      .attr("r", 4);

  updateSlider();

  function updateSlider() {
  
    var h = d3.extent(linkHomeData, function(d){return d.cnt;});
    var a = d3.extent(linkAwayData, function(d){return d.cnt;});

    var ptnCntExtent = d3.extent(a.concat(h));
    //var ptnCntExtent = d3.extent(linkAwayData, function(d){return d.pattern.length;});

    console.dir(ptnCntExtent);

    x = d3.scale.linear()
        .domain(ptnCntExtent)
        .range([0, width])
        .clamp(true);

    brush = d3.svg.brush()
        .x(x)
        .extent([ptnCntExtent[0], ptnCntExtent[0]])
    //    .extent([0, 0])
        .on("brush", brushed);
    
    sliderAxis
      .call(d3.svg.axis()
        .scale(x)
        .tickValues(0)
        .outerTickSize(0));

    slider
      .call(brush);
    
//    brushVal = (brushVal === null) ? Math.floor(brush.extent()[0]) : brushVal;

/*
    slider
      .call(brush.event);
*/
  }


  //handle.attr("cx", x(ptnCntExtent[1]));

  /*
    .transition() // gratuitous intro!
    .duration(750)
    .call(brush.extent([70, 70]))
    .call(brush.event);
  */

  function brushed() {
    var currentVal = Math.floor(brush.extent()[0]);
    
//    console.dir(currentVal);
    brushVal = currentVal;
    
    if(brushVal !== currentVal) return false;

    if (d3.event.sourceEvent) { // not a programmatic event
      currentVal = Math.floor(x.invert(d3.mouse(this)[0]));
      brushVal = currentVal;
      if (brushVal !== currentVal) return false;
      brush.extent([brushVal, brushVal]);
    }

    handle.attr("cx", x(brushVal));
    
//    console.dir(brushVal);
    
    filterData();
    graph.updateLink(graph.linkData);
  }

  // method
  svg.updateSlider = updateSlider;
  svg.init = function(){
    slider.call(brush.event);
  };

  // property
  svg.brush = brush;

  return svg;
}



//////////////////////////////////////
// pattern slider
//////////////////////////////////////
function PatternLenSlider() {

  var x;
  var brush;
  var brushVal = null;

  var margin = {top: 5, right: 20, bottom: 5, left: 20},
      width = 150 - margin.left - margin.right,
      height = 15 - margin.bottom - margin.top;

  var core = d3.selectAll('#ptnLenSlider');
  // initialize
  core.selectAll('svg').remove();

  var svg = core.append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var sliderAxis = svg.append("g")
    .attr("class", "x sliderAxis")
    .attr("transform", "translate(0," + height / 2 + ")");

  var slider = svg.append("g")
      .attr("class", "slider");

  var handle = slider.append("circle")
      .attr("class", "sliderHandle")
      .attr("transform", "translate(0," + height / 2 + ")")
      .attr("r", 4);

  updateSlider();

  function updateSlider() {
  
    var h = d3.extent(linkHomeData, function(d){return d.pattern.length;});
    var a = d3.extent(linkAwayData, function(d){return d.pattern.length;});

    var ptnCntExtent = d3.extent(a.concat(h));
    //var ptnCntExtent = d3.extent(linkAwayData, function(d){return d.pattern.length;});

    console.dir(ptnCntExtent);

    x = d3.scale.linear()
        .domain(ptnCntExtent)
        .range([0, width])
        .clamp(true);

    brush = d3.svg.brush()
        .x(x)
        .extent([ptnCntExtent[0], ptnCntExtent[0]])
    //    .extent([0, 0])
        .on("brush", brushed);
    
    sliderAxis
      .call(d3.svg.axis()
        .scale(x)
        .tickValues(0)
        .outerTickSize(0));

    slider
      .call(brush);

//    brushVal = (brushVal === null) ? Math.floor(brush.extent()[0]) : brushVal;


/*
    slider
      .call(brush.event);
*/
  }


  //handle.attr("cx", x(ptnCntExtent[1]));

  /*
    .transition() // gratuitous intro!
    .duration(750)
    .call(brush.extent([70, 70]))
    .call(brush.event);
  */

  function brushed() {
    var currentVal = Math.floor(brush.extent()[0]);
    
//    console.dir(currentVal);
    brushVal = currentVal;
    
    if(brushVal !== currentVal) return false;

    if (d3.event.sourceEvent) { // not a programmatic event
      currentVal = Math.floor(x.invert(d3.mouse(this)[0]));
      brushVal = currentVal;
      if (brushVal !== currentVal) return false;
      brush.extent([brushVal, brushVal]);
    }

    handle.attr("cx", x(brushVal));
    
//    console.dir(brushVal);
    
    filterData();
    graph.updateLink(graph.linkData);
  }


  // method
  svg.updateSlider = updateSlider;
  svg.init = function(){slider.call(brush.event);};
  // property
  svg.brush = brush;

  return svg;
}

function filterData() {
  var cntVal = Math.floor(cntSlider.brush.extent()[0]);
  var ptnVal = Math.floor(ptnSlider.brush.extent()[0]);
  
  console.dir(cntVal);
  console.dir(ptnVal);
  
  
  
  for(var i = 0; i < graph.linkData.length; i++) {
    var newData = graph.linkData[i].baseData.filter(function(d){
      if (d.cnt <= cntVal && d.pattern.length <= ptnVal) return d;
    });
    graph.linkData[i].data = newData;
  }
}






//////////////////////////////////////
// controller
//////////////////////////////////////

function changeData(e) {
  var s = document.getElementById("tgtData");
  var tgtData = s.options[s.selectedIndex].value;
  if (tgtData === '1st') {
    nodeData = node_1st.sort(function(a,b){return a.index-b.index});
    linkAwayData = linkData_barca_1st.sort(function(a,b){return a.patternID-b.patternID});
    linkHomeData = linkData_river_1st.sort(function(a,b){return a.fstS-b.fstS});
  } else {
    nodeData = node_2nd.sort(function(a,b){a.index-b.index});
    linkAwayData = linkData_barca_2nd.sort(function(a,b){a.fstS-b.fstS});
    linkHomeData = linkData_river_2nd.sort(function(a,b){a.fstS-b.fstS});
  }
  
  // set new
  graph =  new ArcDiagram(nodeData);
  cntSlider = new CntSlider();
  ptnSlider = new PatternLenSlider();

  cntSlider.init();
  ptnSlider.init();

  
}




