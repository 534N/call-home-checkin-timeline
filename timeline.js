
var timeline = function(params) {
  /**
  * 
  */
  var _width           = params.width;
  var _height          = params.height || 120;
  var _innerwidth      = _width - params.margin.left - params.margin.right;
  var _innerheight     = _height - params.margin.top - params.margin.bottom;
  var currentOpen = null;

  var handleWindowResize = function() {
    console.debug('window resize');
    var newWidth = window.innerWidth;
    var newInnerwidth = newWidth - params.margin.left - params.margin.right;
    renderChart(newWidth, _height, newInnerwidth, params.date, params.data, params.reasonColorCode, params.margin);
  }
  window.addEventListener('resize', handleWindowResize)

  renderChart(_width, _height, _innerwidth, params.date, params.data, params.reasonColorCode, params.margin);

  function renderChart(_width, _height, _innerwidth, date, data, reasonColorCode, margin) {

    /*
    * SORT data points by timestamp
    */
    data.sort(function(a, b) {
      return a.timestamp - b.timestamp;
    });

    /*
    * remove any existing child nodes
    */
    d3.select('#timeline').selectAll('*').remove();

    /*
    * creating detail text box
    */
    var detail = document.getElementById('timeline');
    var detailTextBox = document.createElement('div');
    var detailTextBoxStyle = {
      opacity: 0,
      position: 'absolute',
      width: `${_innerwidth}px`,
      height: `${_innerheight}px`,
      left: `${margin.left}px`,
      transition: 'opacity 0.3s ease-in',
    }

    detailTextBox.setAttribute('id', 'detail-text');
    detailTextBox.setAttribute('style', styleObjectToString(detailTextBoxStyle));
    detail.appendChild(detailTextBox);

    /*
    * render the svg container
    */
    var svg = d3.select('#timeline').append('svg')
      .attr('id', 'timeline-svg')
      .attr('width', _width)
      .attr('height', _height);

    /**
    * x scale
    */
    var start = new Date(date.toLocaleDateString());
    var end = new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1);
    var _domain = [start, end];
    var xScale = d3.time.scale.utc().domain(_domain).rangeRound([0, _innerwidth]);

    /**
    * x axis
    */
    renderAxis();

    /**
    * data points
    */
    var dataPointGroup = svg.append('g').attr('id', 'data-points');
    renderDataPoints();
    
    /**
    * checkin detail box
    */
    var checkInDetailBox = svg.append('g');
    var arrowBoxGroup = checkInDetailBox.append('g')
      .attr('id', 'check-in-detail-arrow-group')
      .attr('style', 'opacity: 0');

    renderArrowBoxGroup();
    renderCheckInDetailBox();

    /** 
    * <FUNCTIONS>
    */
    function renderAxis() {
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
    }

    function renderDataPoints() {
      data.forEach(function(checkin, idx) {
        var id = checkin.id;
        var cx = xScale(new Date(parseInt(checkin.timestamp)));
        var cy = 30;
        var r = 5;
        var rHover = 8;
        dataPointGroup.append('circle')
          .attr('id', `circle-${id}-shadow`)
          .attr('index', idx)
          .attr('cx', cx)
          .attr('cy', cy)
          .attr('r', r)
          .attr('class', 'check-in-point-shadow')
          .attr('fill', reasonColorCode[checkin.reason])
      });

      data.forEach(function(checkin, idx) {
        console.debug(idx);
        var id = checkin.id;
        var cx = xScale(new Date(parseInt(checkin.timestamp)));
        var cy = 30;
        var r = 5;
        var rHover = 8;

        dataPointGroup.append('circle')
          .attr('id', `circle-${id}`)
          .attr('index', idx)
          .attr('cx', cx)
          .attr('cy', cy)
          .attr('r', rHover)
          .attr('class', 'check-in-point')
          .attr('fill', reasonColorCode[checkin.reason])
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
              detailTextBoxStyle.opacity = 0;
              detailTextBox.setAttribute('style', styleObjectToString(detailTextBoxStyle));

              d3.select(`#check-in-detail`).transition().duration(300).attr('width', 0).attr('height', 0);
              d3.select(`#check-in-detail-arrow`).transition().duration(300).attr('width', 0).attr('height', 0);

              d3.select(`#check-in-detail-arrow-group`).transition().duration(300).attr('transform', `translate(0, 0)`).attr('style', 'opacity: 0');

              d3.select(`#circle-${id}-shadow`).transition().duration(300).attr('r', r);
              d3.select(`#check-in-detail div`).remove();
            } else {
              hideCheckInDetailPanel(currentOpen);

              currentOpen = id;
              showCheckInDetailPanel(cx);

              detailTextBoxStyle.opacity = 1;
              detailTextBox.setAttribute('style', styleObjectToString(detailTextBoxStyle));
              setChild.call(detailTextBox, params.callback(checkin));
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
    }
    

    function renderCheckInDetailBox() {
      checkInDetailBox.append('rect')
        .attr('id', 'check-in-detail')
        .attr('x', 0)
        .attr('y', 105)
        .attr('width', 0)
        .attr('height', 0)
        .attr('fill', '#f1f1f1')
      checkInDetailBox.append('text')
        .attr('x', 10)
        .attr('y', 120)
        .attr('id', 'check-in-detail-text');
    }

    function renderArrowBoxGroup() {
      arrowBoxGroup.append('rect')
        .attr('id', 'check-in-detail-arrow')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', 0)
        .attr('height', 0)
        .attr('fill', '#f1f1f1')
        .attr('transform', `rotate(45)`);

      arrowBoxGroup.append('text')
        .attr('x', -80)
        .attr('y', 18)
        .attr('class', 'nav-button')
        .text('PREV')
        .on('click', function() {
          var currentIndex = parseInt(d3.select(`#circle-${currentOpen}`).attr('index'));
          if (currentIndex > 0) {
            var newActive = currentIndex - 1;
            var newActiveId = params.data[newActive].id;
            var newActiveCircle = d3.select(`#circle-${newActiveId}`);
            hideCheckInDetailPanel(currentOpen);
            currentOpen = newActiveCircle.attr('id').replace(/circle-/, '');
            var cx = xScale(new Date(parseInt(params.data[newActive].timestamp)));
            showCheckInDetailPanel(cx);
            setChild.call(detailTextBox, params.callback(params.data[newActive]));
          } else {
            arrowBoxGroup.attr('disabled', true);
          }
        });

      arrowBoxGroup.append('text')
        .attr('x', 40)
        .attr('y', 18)
        .attr('class', 'nav-button')
        .text('NEXT')
        .on('click', function() {
          var currentIndex = parseInt(d3.select(`#circle-${currentOpen}`).attr('index'));
          if (currentIndex < data.length - 1) {
            var newActive = currentIndex + 1;
            var newActiveId = params.data[newActive].id;
            var newActiveCircle = d3.select(`#circle-${newActiveId}`);
            hideCheckInDetailPanel(currentOpen);
            currentOpen = newActiveCircle.attr('id').replace(/circle-/, '');
            var cx = xScale(new Date(parseInt(params.data[newActive].timestamp)));
            showCheckInDetailPanel(cx);
            setChild.call(detailTextBox, params.callback(params.data[newActive]));
          }
          
        });
    }

    function hideCheckInDetailPanel(currentOpen) {
      var r = 5;
      d3.select(`#circle-${currentOpen}-shadow`).transition().duration(300).attr('r', r);
      d3.select(`#tooltip-${currentOpen}`).transition().duration(300).style('opacity', 0);
      d3.select(`#check-in-detail div`).remove();
    }

    function showCheckInDetailPanel(cx) {
      var rHover = 8;
      d3.select(`#check-in-detail`).transition().duration(300).attr('width', _innerwidth).attr('height', _innerheight);
      d3.select(`#check-in-detail-arrow-group`).transition().duration(300).attr('transform', `translate(${cx}, 80)`).attr('style', 'opacity: 1');
      d3.select(`#check-in-detail-arrow`).transition().duration(300).attr('width', 40).attr('height', 40);
      d3.select(`#tooltip-${currentOpen}`).transition().duration(300).style('opacity', 1);
      d3.select(`#circle-${currentOpen}-shadow`).transition().duration(300).attr('r', rHover);
    }

    function setChild(child) {
      this.innerHTML = '';
      this.appendChild(child);
    }

    function styleObjectToString(styleObj) {
      var styleString = '';
      Object.keys(styleObj).forEach(function(key) {
        styleString += `${key}: ${styleObj[key]};`;
      });

      return styleString;
    }

    function getTick(width) {
      if (width >= 1000) {
        return 1;
      }

      if (width >= 600) {
        return 2;
      }

      if (width >= 300) {
        return 3;
      }

      if (width >= 100) {
        return 8;
      }

      return 12;
    }
  }
};