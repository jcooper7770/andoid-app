document.addEventListener('DOMContentLoaded', function (e) {
    //document.querySelector('.spinner-container').style.display = "none";
    showSpinner("Loading data...");
    load();
    // send request to get stats data (stats and charts)
    getData().then((data) => {
        console.log(data);
        // fill charts
    }).catch((err) => {
        console.error(`ERROR: ${err}`);

        /*
        $("[id^=chart-lines]").click(function (e) {
          var showLines = e.target.id.slice(12);
          for (item of chartMap) {
            var chart = item[1];
            if (showLines == "yes") {
              chart.data.datasets[0].showLine = true;
              chart.update();
            } else {
              chart.data.datasets[0].showLine = false;
              chart.update();
            }
          }
        });
        */
    });
    document.querySelector("#chart-lines-yes").addEventListener('click', function (e) {
        for (item of chartMap) {
            var chart = item[1];
            chart.data.datasets[0].showLine = true;
            chart.update();
        }
    });
    document.querySelector("#chart-lines-no").addEventListener('click', function (e) {
        for (item of chartMap) {
            var chart = item[1];
            chart.data.datasets[0].showLine = false;
            chart.update();
        }
    });

    document.querySelector('.spinner-container').style.display = "none";
});

async function getData() {
    var name = sessionStorage.getItem("username");
    //var url = `https://192.168.68.124:1234/logger/user/statistics2?name=${name}`
    var url = `logger/user/statistics2?name=${name}`;
    getRetries(url, 10, function (data) {
        console.log(data);
        console.log(typeof data);
        var obj = JSON.parse(data);
        console.log(obj);
        var all_skills = obj.all_skills;
        fillAllSkills(all_skills);

        var dmt_passes = obj.dmt_passes;
        fillDMTPasses(dmt_passes);

        createCharts(obj.datapts);
        //return data;
    });
}

function fillAllSkills(all_skills) {
    var keys = Object.keys(all_skills);
    keys.sort();
    var tbody = document.querySelector("#all-skills-body");
    for (key of keys) {
        var stats = all_skills[key];

        var tr = document.createElement("tr");
        var td1 = document.createElement("td");
        td1.innerText = key;
        tr.appendChild(td1);

        var td2 = document.createElement("td");
        td2.innerText = stats['trampoline'];
        tr.appendChild(td2);

        var td3 = document.createElement("td");
        td3.innerText = stats['dmt'];
        tr.appendChild(td3);

        var td4 = document.createElement("td");
        td4.innerText = stats['all'];
        tr.appendChild(td4);

        tbody.appendChild(tr);
    }
}

function fillDMTPasses(dmt_passes) {
    var keys = Object.keys(dmt_passes);
    keys.sort();
    var tbody = document.querySelector("#dmt-pass-body");
    for (key of keys) {
        var stats = dmt_passes[key];

        var tr = document.createElement("tr");
        var td1 = document.createElement("td");
        td1.innerText = key;
        tr.appendChild(td1);

        var td2 = document.createElement("td");
        td2.innerText = stats['dmt'];
        tr.appendChild(td2);

        tbody.appendChild(tr);
    }
}

// table sorting
function sortTable(f, n, t) {
    var s = '#' + t + ' tbody    tr';
    var rows = $(s).get();

    rows.sort(function (a, b) {

        var A = getVal(a);
        var B = getVal(b);

        if (A < B) {
            return -1 * f;
        }
        if (A > B) {
            return 1 * f;
        }
        return 0;
    });

    function getVal(elm) {
        var v = $(elm).children('td').eq(n).text().toUpperCase();
        if ($.isNumeric(v)) {
            v = parseInt(v, 10);
        }
        return v;
    }

    $.each(rows, function (index, row) {
        $('#' + t).children('tbody').append(row);
    });
}
var f_sl = 1;
var f_nm = 1;
// highlight header on hover
$("[id^=col]").mouseover(function () {
    $(this).css({ "background-color": "lightgray", "cursor": "pointer" });
});
$("[id^=col]").mouseout(function () {
    $(this).css({ "background-color": "gray", "cursor": "pointer" });
});
// sort column on click
$("[id^=col]").click(function () {
    f_sl *= -1;
    table = $(this).closest("table")[0].id;
    console.log(table);
    console.log(f_sl)
    var n = $(this).prevAll().length;
    console.log(n);
    sortTable(f_sl, n, table);
});

const chartMap = new Map();
function createCharts(datapts) {
    var tab = document.querySelector("#canvas-tab");
    var tablist = document.querySelector("#charts-list");
    var num = 0;
    for ([event, data] of Object.entries(datapts)) {
        // add tab
        var navTab = document.createElement("li");
        navTab.classList = "nav-item";
        var a = document.createElement("button");
        if (num == 0) {
            a.classList = "nav-link active";
            a.setAttribute("aria-selected", true);
        } else {
            a.classList = "nav-link"
            a.setAttribute("aria-selected", false);
        }
        a.href = `#${event}`;
        a.setAttribute('data-bs-toggle', 'tab');
        a.setAttribute('data-bs-target', `#${event}`);
        a.setAttribute('aria-controls', event);
        a.setAttribute('role', 'tab');
        a.id = `${event}-tab`;
        a.type = "button";
        a.innerText = event;
        navTab.appendChild(a);
        tablist.appendChild(navTab);

        var div = document.createElement("div");
        if (num == 0) {
            div.classList = "tab-pane fade show active";
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
        num += 1;
        const ctx = canvas.getContext('2d');
        var dataList = []
        for (entry of data) {
            var line = {
                x: entry.x,
                y: entry.y
            }
            dataList.push(line);
        }
        var borderColor = event.startsWith('dmt') ? 'rgba(255, 99, 132, 1)' : 'rgba(99, 99, 255, 1)';
        var myChart = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [
                    {
                        label: event,
                        data: dataList,
                        showLine: false,
                        fill: false,
                        borderColor: borderColor,
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
        div.appendChild(canvas);
        tab.appendChild(div);



    }
}

function showSpinner(text) {
    var spinnerText = document.querySelector('.spinner-text');
    var textContent = text || "Loading...";
    spinnerText.textContent = textContent;

    // add css for each letter to cause a delay
    var spanCount = textContent.length;
    var spanCSS = "";
    for (var i = 1; i <= spanCount; i++) {
        var delay = (i - 1) * 0.1;
        spanCSS += `.spinner-text span:nth-child(${i}) { animation-delay: ${delay}s; } `;
    }
    var styleElement = document.querySelector("style[type='text/css']");
    if (styleElement == null) {
        alert("Cannot create loading spinner");
        return
    }
    styleElement.insertAdjacentHTML('beforeend', spanCSS);

    // move each letter into a span element
    var chars = text.split('');
    var wrappedChars = chars.map(function (char) {
        return '<span>' + char + '</span>';
    });
    spinnerText.innerHTML = wrappedChars.join('');

    // make the spinner visible
    var spinnerContainer = document.querySelector(".spinner-container");
    spinnerContainer.style.display = "flex";

    // allow spinner to be closed
    var spinnerClose = document.getElementById("spinner-close");
    spinnerClose.addEventListener("click", function () {
        spinnerContainer.style.display = "none";
    });
}