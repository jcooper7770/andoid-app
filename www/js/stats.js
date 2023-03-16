document.addEventListener('DOMContentLoaded', function (e) {
    //createCharts();
});


/*
$("[id^=chart-lines]").click(function (e) {
    var showLines = event.target.id.slice(12);
    if (showLines == "yes"){
        {% for event, data in datapts.items() %}
        myChart{{event}}.data.datasets[0].showLine = true;
        myChart{{event}}.update();
        {% endfor %} 
    } else {
        {% for event, data in datapts.items() %}
        myChart{{event}}.data.datasets[0].showLine = false;
        myChart{{event}}.update();
        {% endfor %} 

    }

});
*/

// Adjust chart dates
$('#chart-dates').click(function(e){
    var start = $('#chart-start').val();
    //const dateRegExp = /^[0-9]{1,2}\/[0-9]{1,2}\/[0-9]{4}$/;
    const dateRegExp = /^[0-9]{4}-[0-9]{1,2}-[0-9]{1,2}$/;
    const startValid = dateRegExp.test(start);
    if (start != "" && startValid == false) {
        alert("Start date has to be in mm/dd/yyyy format");
        return
    }
    var end = $('#chart-end').val();
    const endValid = dateRegExp.test(end);
    if (end != "" && endValid == false) {
        alert("End date has to be in mm/dd/yyyy format");
        return
    }
    // refresh the page to update the charts
    //var url = "/logger/user?chart_start=" + start + "&chart_end=" + end;
    //location.href = encodeURI(url);

    // dynamically update the charts
    updateCharts(start, end);
});
$("charts-list a").on('click', function(e){
    e.preventDefault();
    $(this).tab('show');
});
// Clicking on Canvas point should bring to that day
$("[id$='Canvas']").click(function (e) {
    var chartId = e.target.id;
    var eventIdx = chartId.slice(0, -6);
    var chart = chartMap.get(eventIdx);
    var activePoint = chart.getElementsAtEvent(e)[0];
    if (activePoint !== undefined) {
        var dataset = chart.data.datasets[activePoint._datasetIndex];
        var date = dataset.data[activePoint._index].x;

        if(confirm("Would you like to go to the practice on " + date + "?")){
            var url = "/logger/search?practice_date=" + date;
            window.open(encodeURI(url));
            //location.href = encodeURI(url);

        }
    }
});

/*
function updateCharts(start_date, end_date) {
    start = new Date(start_date);
    end = new Date(end_date);

    {% for event, data in datapts.items() %}
    var data_{{event}} = [];
    for (var j=0; j < {{ data | length }}; j++){
        data_date = new Date({{ data | safe }}[j]['x']);
        if ( data_date < start) {
            continue;
        }
        if ( data_date > end ){
            continue;
        }
        data_{{event}}.push({'x': {{ data | safe }}[j]['x'], 'y': {{ data | safe }}[j]['y']});
    }
    myChart{{event}}.data.datasets[0].data = data_{{event}};
    myChart{{event}}.update();
    {% endfor %}

}
*/


const chartMap = new Map();
function createCharts(datapts) {
    var tab = document.querySelector("#canvas-tab");
    var tablist = document.querySelector("#charts-list");
    var num = 0;
    for([event, data] of Object.entries(datapts)) {
        // add tab
        var navTab = document.createElement("li");
        navTab.classList = "nav-item";
        var a = document.createElement("a");
        if (num == 0) {
            a.classList = "nav-link active";
            a.setAttribute("aria-selected", true);
        } else {
            a.classList = "nav-link"
            a.setAttribute("aria-selected", false);
        }
        a.href = `#${event}`;
        a.setAttribute('data-toggle', 'tab');
        a.setAttribute('aria-controls', event);
        a.setAttribute('role', 'tab');
        a.id = `${event}-tab`;
        a.innerText = event;
        navTab.appendChild(a);
        tablist.appendChild(navTab);

        var div = document.createElement("div");
        if (num == 0){
            div.classList = "tab-pane fadeshow active";
        } else {
            div.classList = "tab-pane fade";
        }
        div.id = event;
        div.setAttribute("role", "tabpanel");
        div.setAttribute("aria-labelledby", `${event}-tab`);
        
        var canvas = document.createElement("canvas");
        canvas.classList = "mx-auto";
        canvas.id = `${event}Canvas`;
        canvas.width = "900";
        canvas.height = "500";
        div.appendChild(canvas);
        num += 1;
        const ctx = document.getElementById(`${event}Canvas`).getContext('2d');
        var data = []
        for (entry of data) {
            var line = {
                x: entry.x,
                y: entry.y
            }
            data.push(line);
        }
        var myChart = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [
                    {
                        label: '{{ event }}',
                        data: data,
                        showLine: false,
                        fill: false,
                        borderColor: 'rgba(255, 99, 132, 1)' ? event.startsWith("dmt") : 'rgba(99, 99, 255, 1)',
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    xAxes: [{
                        type: 'time',
                        time: {
                            unit: 'day'
                        }
                    }]
                }
            }
        });
        chartMap.set(event, myChart);
        tab.appendChild(div);
    }
}

// table sorting
function sortTable(f,n,t){
var s = '#'+ t +' tbody    tr';
var rows = $(s).get();

rows.sort(function(a, b) {

    var A = getVal(a);
    var B = getVal(b);

    if(A < B) {
        return -1*f;
    }
    if(A > B) {
        return 1*f;
    }
    return 0;
});

function getVal(elm){
    var v = $(elm).children('td').eq(n).text().toUpperCase();
    if($.isNumeric(v)){
        v = parseInt(v,10);
    }
    return v;
}

$.each(rows, function(index, row) {
    $('#'+t).children('tbody').append(row);
});
}
var f_sl = 1;
var f_nm = 1;
// highlight header on hover
$("[id^=col]").mouseover(function(){
$(this).css({"background-color": "lightgray", "cursor": "pointer"});
});
$("[id^=col]").mouseout(function(){
$(this).css({"background-color": "gray", "cursor": "pointer"});
});
// sort column on click
$("[id^=col]").click(function(){
    f_sl *= -1;
    table = $(this).closest("table")[0].id;
    console.log(table);
    console.log(f_sl)
    var n = $(this).prevAll().length;
    console.log(n);
    sortTable(f_sl,n, table);
});