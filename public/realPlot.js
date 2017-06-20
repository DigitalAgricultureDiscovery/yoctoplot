recentPointIndex = 0;

var ctx = document.getElementById("myChart");
scatterChart = new Chart(ctx, {
  type: 'line',
  data: {
    datasets: [{
      label: 'LIGHTMK3-76EB4_lightSensor',
      data: [{}],
      fill: false,
      lineTension: 0.1,
      backgroundColor: 'rgba(75,192,192,0.4)',
      borderColor: 'rgba(75,192,192,1)',
      borderCapStyle: 'butt',
      borderDash: [],
      borderDashOffset: 0.0,
      borderJoinStyle: 'miter',
      pointBorderColor: 'rgba(75,192,192,1)',
      pointBackgroundColor: '#fff',
      pointBorderWidth: 1,
      pointHoverRadius: 5,
      pointHoverBackgroundColor: 'rgba(75,192,192,1)',
      pointHoverBorderColor: 'rgba(220,220,220,1)',
      pointHoverBorderWidth: 2,
      pointRadius: 1,
      pointHitRadius: 10,
      pointStyle: 'circle',
      spanGaps: false
    }],
  },
  options: {
    scales: {
      xAxes: [{
        type: 'time',
        position: 'bottom'
      }],
      yAxes: [{
        scaleLabel: {
          display: true,
          labelString: 'lx'
        }
      }]
    },
    responsive: false
  }
});

$(function () {
  var socket = io();
  socket.on('update chart', function (data) {
    var newData = {
      'x': new Date(parseInt(data['timestamp']) * 1000),
      'y': parseFloat(data['LIGHTMK3-76EB4_lightSensor'])
    };
    scatterChart.data.datasets[0].data.push(newData);
    scatterChart.update();

    if (recentPointIndex == 0) {
      $('#recent0').html(
        newData['x'] + '<br />' +
        newData['y']);
      recentPointIndex++;
    } else if (recentPointIndex > 0 && recentPointIndex < 2) {
      $('#recent' + recentPointIndex.toString()).html(
        $('#recent' + (recentPointIndex - 1).toString()).html());
      $('#recent0').html(
          newData['x'] + '<br />' +
          newData['y']);
      recentPointIndex++;
    } else {
      $('#recent' + recentPointIndex.toString()).html(
        $('#recent' + (recentPointIndex - 1).toString()).html());
      $('#recent' + (recentPointIndex - 1).toString()).html(
        $('#recent' + (recentPointIndex - 2).toString()).html());
      $('#recent0').html(
        newData['x'] + '<br />' +
        newData['y']);
      recentPointIndex = 0;
    }
  });
});
