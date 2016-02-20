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




var SVGwidth = 1200,
  SVGheight =  1100,
  svgMargin = {t: 50, r: 50, b: 50, l: 50},
  uiSize = {
    width:  SVGwidth - svgMargin.l - svgMargin.r,
    height:  SVGheight - svgMargin.t - svgMargin.b
  };

//////////////////////////////////////
// 基本設定
//////////////////////////////////////
var svg = d3.select('#diagram').append('svg')
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

var reg = /^| /g;


var linkData = [
  {
    name: 'away',
    data: linkAwayData,
    startAngle: function(){return 2 * Math.PI/4},
    endAngle: function(){return 6 * Math.PI/4}

  },
  {
    name: 'home',
    data: linkHomeData,
    startAngle: function(){return 6 * Math.PI/4},
    endAngle: function(){return 10 * Math.PI/4}
  }
];

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
  linkGroup.selectAll('path.' + ld.name)
    .data(ld.data)
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
      
      console.dir(d3.selectAll(className));
      
      d3.selectAll(className).classed('tgt', true);
    })
    .on('mouseleave', function(d){
      var className = this.className.baseVal.replace(reg, '.');
      console.dir(className);
      d3.selectAll(className).classed('tgt', false);
    });
    
    
}




/*
// away
var arcAway = d3.svg.arc()
  .innerRadius(function(d, i) {
    var iDis = (d.secS - d.fstE);
    var val = (iDis === 0) ? iDis*(buf+strokeWidth) : (iDis-1)*size/2;
    
    return val;
  })
  .outerRadius(function(d, i) {
    var oDis = (d.secE - d.fstS+1)/2;
    return oDis*size - buf*oDis;
  })
  .startAngle(2 * Math.PI / 4)
  .endAngle(6 * Math.PI / 4);
linkGroup.selectAll('path.away')
  .data(linkAwayData)
  .enter()
  .append("path")
  .attr("class", "arc away")
  .attr("d", arcAway)
  .attr("transform", function(d, i) {
    return "translate(" + (size * (d.fstE + (d.secS-d.fstE)/2)) + "," + (size + 10) + ")";
  });


// home
var arcHome = d3.svg.arc()
  .innerRadius(function(d, i) {
    var iDis = (d.secS - d.fstE);
    var val = (iDis === 0) ? iDis*(buf+strokeWidth) : (iDis-1)*size/2;
    
    return val + nodeWidth/2;
  })
  .outerRadius(function(d, i) {
    var oDis = (d.secE - d.fstS+1)/2;
    return oDis*size - buf*oDis + nodeWidth/2;
  })
  .startAngle(6 * Math.PI/4)
  .endAngle(10 * Math.PI/4);

linkGroup.selectAll('path.home')
  .data([linkHomeData[25]])
  .enter()
  .append("path")
  .attr("class", "arc home")
  .attr("d", arcHome)
  .attr("transform", function(d, i) {
    return "translate(" + (size * (d.fstE + (d.secS-d.fstE)/2)) + "," + (size + 10) + ")";
  });

*/

//////////////////////////////////////
// slider
//////////////////////////////////////

/*
var ptnCntExtent = d3.extent();

*/












