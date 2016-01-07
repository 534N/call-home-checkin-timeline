
var timeline = function(params) {
  /**
  * 
  */
  var _width           = params.width;
  var _height          = params.height || 120;
  var _innerwidth      = _width - params.margin.left - params.margin.right;
  var _innerheight     = _height - params.margin.top - params.margin.bottom;
  var currentOpen = null;

  var detail = document.getElementById('timeline');
  var detailTextBox = document.createElement('div');
  detailTextBox.setAttribute('id', 'detail-text');
  detailTextBox.setAttribute('style', `position: absolute; width: ${_innerwidth}px; height: ${_innerheight}px; left: ${params.margin.left}px;`)
  detail.appendChild(detailTextBox);

  var svg = d3.select('#timeline').append('svg')
    .attr('id', 'timeline-svg')
    .attr('width', _width)
    .attr('height', _height);

  /**
  * x scale
  */
  var start = new Date(params.date.toLocaleDateString());
  var end = new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1);
  var _domain = [start, end];
  var xScale = d3.time.scale.utc().domain(_domain).rangeRound([0, _innerwidth]);

  /**
  * x axis
  */
  var ticks = d3.time.hours;
  var xAxis = {
    class: 'main-x-axis',
    tickFormat: {
      Day: '%H:%M',
      Week: '%B %d',
    },
    tick: 1,
    tickPadding: 1,
    tickSize: 1,
    'font-size': '0.8em',
    fill: '#fff',
    scroll: {
      class: 'main-x-axis small',
    },
  };

  var xAxisFunc =
    d3.svg.axis()
      .scale(xScale)
      .orient('bottom')
      .tickFormat(d3.time.format('%H:%M'))
      .ticks(d3.time.hours, getTick(_innerwidth))
      .tickPadding(10)
      .tickSize(1)
      .tickSubdivide(1);

  svg.append('g')
    .attr('class', xAxis.class)
    .attr('transform', `translate(0, 50)`)
    .call(xAxisFunc)
    .selectAll('text')
      .attr('x', _innerwidth / 24 / 2)
      .attr('y', 18)
      .style('font-size', xAxis['font-size'])
      .style('fill', '#888');

  /**
  * 
  */
  
  var dataPointGroup = svg.append('g').attr('id', 'data-points');
  params.data.forEach(function(checkin) {
    var id = checkin.id;
    var cx = xScale(new Date(parseInt(checkin.timestamp)));
    var cy = 30;
    var r = 5;
    var rHover = 8;
    dataPointGroup.append('circle')
      .attr('id', `circle-${id}-shadow`)
      .attr('cx', cx)
      .attr('cy', cy)
      .attr('r', r)
      .attr('class', 'check-in-point-shadow')
      .attr('fill', params.reasonColorCode[checkin.reason])
  });

  params.data.forEach(function(checkin) {
    var id = checkin.id;
    var cx = xScale(new Date(parseInt(checkin.timestamp)));
    var cy = 30;
    var r = 5;
    var rHover = 8;
    dataPointGroup.append('circle')
      .attr('id', `circle-${id}`)
      .attr('cx', cx)
      .attr('cy', cy)
      .attr('r', rHover)
      .attr('class', 'check-in-point')
      .attr('fill', params.reasonColorCode[checkin.reason])
      .on('mouseover', function() {
        d3.select(`#tooltip-${id}`).transition().duration(300).style('opacity', 1);
      })
      .on('mouseout', function() {
        if(currentOpen !== id) {
          d3.select(`#tooltip-${id}`).transition().duration(300).style('opacity', 0);
        }
      })
      .on('click', function() {
        if (currentOpen && currentOpen === id) {
          currentOpen = null;
          d3.select(`#check-in-detail`).transition().duration(300).attr('width', 0).attr('height', 0);
          d3.select(`#check-in-detail-arrow-group`).transition().duration(300).attr('transform', `translate(0, 0)`);
          d3.select(`#check-in-detail-arrow`).transition().duration(300).attr('width', 0).attr('height', 0);

          d3.select(`#circle-${id}-shadow`).transition().duration(300).attr('r', r);
          d3.select(`#check-in-detail div`).remove();
        } else {
          d3.select(`#circle-${currentOpen}-shadow`).transition().duration(300).attr('r', r);
          d3.select(`#tooltip-${currentOpen}`).transition().duration(300).style('opacity', 0);
          d3.select(`#check-in-detail div`).remove();

          currentOpen = id;
          d3.select(`#check-in-detail`).transition().duration(300).attr('width', _innerwidth).attr('height', _innerheight);
          d3.select(`#check-in-detail-arrow-group`).transition().duration(300).attr('transform', `translate(${cx}, 80)`)
          d3.select(`#check-in-detail-arrow`).transition().duration(300).attr('width', 40).attr('height', 40);
          d3.select(`#circle-${currentOpen}-shadow`).transition().duration(300).attr('r', rHover);

          detailTextBox.appendChild(params.callback(checkin));
        }
      });
    dataPointGroup.append('text')
      .attr('id', `tooltip-${id}`)
      .attr('x', cx - 30)
      .attr('y', cy - 15)
      .style('opacity', 0)
      .attr('class', 'check-in-point-tooltip')
      .attr('fill', '#555')
      .text(new Date(checkin.timestamp).toLocaleTimeString())
  });

  

  var checkInDetailBox = svg.append('g');
  
  checkInDetailBox.append('g')
    .attr('id', 'check-in-detail-arrow-group')
    .append('rect')
      .attr('id', 'check-in-detail-arrow')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', 0)
      .attr('height', 0)
      .attr('fill', '#f1f1f1')
      .attr('transform', `rotate(45)`)
  checkInDetailBox.append('rect')
    .attr('id', 'check-in-detail')
    .attr('x', 0)
    .attr('y', 100)
    .attr('width', 0)
    .attr('height', 0)
    .attr('fill', '#f1f1f1')
  checkInDetailBox.append('text')
    .attr('x', 10)
    .attr('y', 120)
    .attr('id', 'check-in-detail-text');



  function getTick(width) {
    if (width >= 1000) {
      return 1;
    }

    if (width >= 600) {
      return 2;
    }
  }







};