//================================Generate charts================================

var soundGraphElement = document.getElementById('soundGraph');
var lightGraphElement = document.getElementById('lightGraph');

soundGraph = Highcharts.chart(soundGraphElement, {
    title: {
        text: 'Sound sensor data'
    },

    xAxis: {
        type: 'category',
        labels: {
            step: 10,
            rotation: 90
        }
    },

    yAxis: {
        title: {
            text: 'Sound amplitude [dBA]'
        }
    },

    plotOptions: {
        line: {
            marker: {
                enabled: false
            }
        },
        
    },

    legend: {
        layout: 'vertical',
        align: 'right',
        verticalAlign: 'middle'
    },

    series: [{
        showInLegend: false,
        data: [],
        lineWidth: 3
    }],

    responsive: {
        rules: [{
            condition: {},
            chartOptions: {
                legend: {
                    layout: 'horizontal',
                    align: 'center',
                    verticalAlign: 'bottom'
                }
            }
        }]
    },
});


var lightGraph = Highcharts.chart(lightGraphElement, {

    title: {
        text: 'Light sensor data'
    },

    xAxis: {
        type: 'category',
        labels: {
            step: 10,
            rotation: 90
        }
    },

    yAxis: {
        title: {
            text: 'Light intensity [lux]'
        }
    },

    legend: {
        layout: 'vertical',
        align: 'right',
        verticalAlign: 'middle'
    },

    plotOptions: {        
        line: {
            marker: {
                enabled: false
            }
        }
    },

    series: [{
        showInLegend: false,
        data: [],
        lineWidth: 3
    }, ],

    responsive: {
        rules: [{
            condition: {},
            chartOptions: {
                legend: {
                    layout: 'horizontal',
                    align: 'center',
                    verticalAlign: 'bottom'
                }
            }
        }]
    }

});
