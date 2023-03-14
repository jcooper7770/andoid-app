async function addNav() {
    await $.get("nav.html", function(data) {
        $("#nav-placeholder").replaceWith(data);
    });
}

async function load(){
    await addNav();
}
load();


var user_turns = [];
var user_goals = [];
var user_airtimes = [];
async function loadHTML3() {
    //return fetch("http://192.168.68.124:1234/logger", {
    var name = sessionStorage.getItem("username");
    if (name == null) {
        var url ="http://192.168.68.124:1234/logger2"
    } else {
        var url ="http://192.168.68.124:1234/logger2?username="+name;
    }
    //return await fetch("http://192.168.68.124:1234/logger2", {
    return await fetch(url, {
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
        },
        //mode: "cors"
        //mode: "no-cors"
    }).then((response) => {
        if(!response.ok) {
            console.log("Error. Rejecting. ", response.status, "(", response.statusText ,")");
            return Promise.reject()
        }
        return new Promise((resolve, reject) => {
            //return resolve(response.text());
            var respText = resolve(response.text());
            console.log(`resp: ${respText}`);
            //return resolve(response.json());
            return JSON.parse(respText);
        })

    }).catch(
        error => {
            console.error("ERROR: ", error);
            console.error("ERROR: ", error.stack);
            return Promise.reject()
    })
 
}

function set_goals(goals) {
    var goals_table = document.querySelector("#goals-table");
    for (i in goals) {
        var goal = goals[i];
        var tr = document.createElement("tr");
        // add checkbox for completing
        var td = document.createElement("td");
        td.width = "5%";
        var input = document.createElement("input");
        input.type = "checkbox";
        input.id = i;
        input.name = "" + i;
        if (goal[2]) {
            input.checked = true;
        }
        td.appendChild(input);
        tr.appendChild(td);

        // add text for goal
        var tdGoal = document.createElement("td");
        if (goal[2]) {
            var text = "[DONE] " + goal[1];
        } else {
            var text = goal[1];
        }
        tdGoal.innerHTML = text;
        tr.appendChild(tdGoal);

        // add delete button
        var tdDel = document.createElement("td");
        tdDel.width = "5%";
        var delButton = document.createElement("button");
        delButton.id = "delete_goal" + i;
        delButton.name = "delete_goal" + i;
        delButton.classList = "btn";
        var span = document.createElement("span");
        span.classList = "fa fa-remove";
        span.id = "delete_goal" + i;
        span.setAttribute("aria-hidden", "true");
        delButton.appendChild(span);
        tdDel.appendChild(delButton);
        tr.appendChild(tdDel);
        
        goals_table.appendChild(tr);
    }
}

function set_airtimes(airtimes) {
    var airtimes_table = document.querySelector("#airtimes-table");
    for (i in airtimes) {
        var airtime = airtimes[i];

        var tr = document.createElement("tr");
        var td1 = document.createElement("td");
        td1.width = "20%";
        td1.innerHTML = airtime[1];
        tr.appendChild(td1);

        var td2 = document.createElement("td");
        td2.innerHTML = airtime[2];
        tr.appendChild(td2);

        var td3 = document.createElement("td");
        td3.width = "5%";

        var button = document.createElement("button");
        button.type = "submit";
        button.id = "delete_airtime" + i;
        button.name = "delete_airtime" + i;
        button.classList = "btn";
        var span = document.createElement("span");
        span.classList = "fa fa-remove";
        span.id = "delete_airtime" + i;
        span.setAttribute("aria-hidden", "true");
        button.appendChild(span);
        td3.appendChild(button);
        tr.appendChild(td3);

        airtimes_table.appendChild(tr);
    }
}

function addSkillDropdowns(all_skills){
    for(var flips in all_skills) {
        var skills = all_skills[flips];
        var div = document.createElement("div");
        div.classList = "dropdown";
        div.style = "display:inline-block";
        var button = document.createElement("button");
        button.classList = "btn btn-secondary btn-sm dropdown-toggle";
        button.type = "button";
        button.id = "drowndownMenuButton";
        button.setAttribute("data-bs-toggle", "dropdown");
        button.setAttribute("aria-expanded", "false");
        button.innerHTML = flips;
        div.appendChild(button);

        var dropdown = document.createElement("div");
        dropdown.classList = "dropdown-menu dropdown-menu-right";
        dropdown.setAttribute("aria-labelledby", "dropdownMenuButton");
        dropdown.style = "overflow-y: auto; max-height:200px; min-width: 90vw;";

        var positions = ["o", "<", "/"];    
        for(var i in skills){
            var skill = skills[i];
            for (j in positions) {
                var pos = positions[j];
                var a = document.createElement("a");
                a.class = "dropdown-item";
                a.style = "display: inline-block; width: auto; border: 1px solid;";
                a.innerHTML = skill + pos;
                a.classList = "dropdown-item";
                var val = "skill" + skill + pos;
                a.value = val;
                a.id = val;
                a.href = "#!";
                a.setAttribute("data-keepopenonclick", true);
                dropdown.appendChild(a);
            }
        }
        div.appendChild(dropdown);
        document.querySelector("#placeholder_skills").appendChild(div);
    }
}

async function loadHTMLRetries(numRetries) {
    for (let i = 0; i < numRetries; i++){
        var caughtError = false;
        var done = false;
        console.log("Attempt number: ", i+1);
        await loadHTML3().then((data) => {
            console.log("data: ", data);
            // replace entire html document
            /*
            document.open();
            document.write(data.body);
            document.close();
            */
            // Replace entire body
            //document.body.innerHTML = data.body;

            // Put html into 'data'
            done = fillPageWithData(data);
        }).catch( (err) => {
            console.log("Failed to load HTML after ", i+1, " retries.");
            console.log("ERROR: ", err);
            caughtError = true;
            if (i == numRetries - 1) {
                throw new Error("Failed to load data");               
            }
        });

        if (done) {
            console.log("SUCCESS");
            return
        }
    }
}

function fillPageWithData(data) {
    var data_div = document.querySelector("#practices_body");
    console.log(`data: ${data}`);
    var type = typeof data;
    console.log(`Type: ${type}`);
    //data_div.innerHTML = data.body;
    var jsondata = data;
    if (typeof data == "string") {
        var jsondata = JSON.parse(data);
    }
    localStorage.setItem("savedData", JSON.stringify(jsondata));
    console.log("saved");
    //data_div.innerHTML = data['body'];
    //data_div.innerHTML = jsondata['body'];
    //console.log(`data: ${jsondata['body']}`);


    // save user turns
    //user_turns = jsondata.user_turns;
    user_goals = jsondata.goals;
    set_goals(user_goals);
    user_airtimes = jsondata.airtimes;
    set_airtimes(user_airtimes);

    // replace user name
    var name_field = document.querySelector("#name");
    name_field.value = jsondata.username;
    //var username = sessionStorage.getItem("username", "bob");
    //name_field.value = username;

    // add flips to dropdowns
    addSkillDropdowns(jsondata.all_skills);

    var div = document.createElement("div");
    div.id = "practices";
    div.classList = "practices";
    document.querySelector("#practices_body").appendChild(div); 
    for (let i=0; i<jsondata.practices.length; i++){
        var practice = jsondata.practices[i];
        convertPracticeToTable(practice)
    }
    // 
    console.log("body: ", jsondata.body);
    console.log("user: ", jsondata.username);
    return true;
}

function finishSetup() {
    $(function() {
        $("div.dropdown-menu").on("click", "[data-keepopenonclick]", function(e) {
                e.stopPropagation();
        });
    });
    console.log("Done2");

    $("a.dropdown-item").click(function (e) {
        e.preventDefault();
        var skill = event.target.id.slice(5).replace('t', 'o').replace('p', '<').replace('s', '/');
        console.log("adding " + skill);
        var routineText = document.getElementById('log').value;
        if (routineText != "") {
            $('#log').val(routineText + ' ' + skill);
        } else {
            $('#log').val(skill);
        }
        addRecSkill();
    });
    console.log("Done");
    paginate();
    // remove loading spinner
    document.querySelector('.spinner-container').style.display = "none";

}

function convertPracticeToTable(practice) {
    var table = document.createElement("table");
    table.border = 1;
    table.align = "center";
    table.classList = "table table-striped table-responsive-lg";
    table.width = "30%";

    // header
    var thead = document.createElement("thead");
    thead.classList = "thead-dark bg-dark text-white";

    var tr = document.createElement("tr");
    var th = document.createElement("th");
    th.innerText = practice.title;
    th.colSpan = "100";
    var button = document.createElement("button");
    button.type = "button";
    button.classList = "btn float-right";
    button.id = "delete-button";
    var a = document.createElement("a");
    a.title = "remove day";
    a.href = "#!";
    var span = document.createElement("span");
    span.id = `remove_${practice.date}_${practice.event}`;
    span.classList = "fa fa-remove";
    span.setAttribute("aria-hidden", "true");
    a.appendChild(span);
    button.appendChild(a);
    th.appendChild(button);

    var button = document.createElement("button");
    button.type = "button";
    button.classList = "btn float-right";
    button.innerHTML = `<a title="edit day" href="#!"><span id="edit_${practice.date}_${practice.event}" class="fa fa-pencil-square-o" aria-hidden="true"></span></a>`;
    th.appendChild(button);

    tr.appendChild(th);
    thead.appendChild(tr);
    table.appendChild(thead);

    // table body
    var tbody = document.createElement("tbody");
    var turnNum = 0;
    var numSkills = 0;
    var numFlips = 0;
    var totalDiff = 0;
    for (let i=0; i<practice.turns.length; i++) {
        var turn = practice.turns[i];
        var tr = document.createElement("tr");
        var td = document.createElement("td");

        if (turn.skills.length == 0) {
            // comment line
            if (turn.note != "") {
                td.innerHTML = `<i class="fa fa-comments"></i> ${turn.note}`;
            }
            td.colSpan = "100";
        } else {
            // skills line
            turnNum += 1;
            if (turn.note != "") {
                td.innerHTML = `${turnNum}<i title="toggle comment" class="fa fa-comments" id="unhide-note"></i><span id="hidden-note" style="display:none">${turn.note}</span>`;
            } else {
                td.innerText = turnNum;
            }
            td.width = "10%";
            tr.appendChild(td);

            /*
            // one td per skill
            for (let skillNum=0; skillNum < turn.skills.length; skillNum++) {
                var skill = turn.skills[skillNum];
                td = document.createElement("td");
                td.innerText = `${skill}`;
                tr.appendChild(td);
            } 
            */
            td = document.createElement("td");
            var turn_str = turn.skills.join(" ");
            td.innerText = turn_str;
            tr.appendChild(td);

            td = document.createElement("td");
            td.innerText = `${turn.skills.length}`;
            tr.appendChild(td);

            numSkills += turn.skills.length;
            td = document.createElement("td");
            td.innerText = `${numSkills}`;
            tr.appendChild(td);

            td = document.createElement("td");
            td.innerText = `${turn.flips}`;
            tr.appendChild(td);

            numFlips += turn.flips;
            td = document.createElement("td");
            td.innerText = `${numFlips}`;
            tr.appendChild(td);

            td = document.createElement("td");
            var turn_diff = Math.round(10*turn.difficulty)/10;
            td.innerText = `${turn_diff}`;
            tr.appendChild(td);

            totalDiff += turn_diff;
            td = document.createElement("td");
            td.innerText = `${totalDiff}`;
        }
        tr.appendChild(td);
        tbody.appendChild(tr);
    }
    table.appendChild(tbody);
    document.querySelector("#practices_body").appendChild(table);

    var div = document.createElement("div");
    div.classList = "container";
    div.appendChild(table);
    document.querySelector("#practices").appendChild(div);
}

localStorage.removeItem("savedData");
var allData = localStorage.getItem("savedData");
if (allData != null && allData != "undefined") {
    console.log(`allData: ${allData}`);
    var data = allData;
    if (typeof allData == "string") {
        var data = JSON.parse(allData);
    }

    fillPageWithData(data);
    alert("Filled with data");
    finishSetup();
} else {
    // Show loading spinner
    showSpinner("Loading...");

    // Start loading data
    loadHTMLRetries(10).then(() => {
        console.log("Done0");
        console.log("Done1");
        finishSetup();
        /*
        $(function() {
            $("div.dropdown-menu").on("click", "[data-keepopenonclick]", function(e) {
                    e.stopPropagation();
            });
        });
        console.log("Done2");

        $("a.dropdown-item").click(function (e) {
            e.preventDefault();
            var skill = event.target.id.slice(5).replace('t', 'o').replace('p', '<').replace('s', '/');
            console.log("adding " + skill);
            var routineText = document.getElementById('log').value;
            if (routineText != "") {
                $('#log').val(routineText + ' ' + skill);
            } else {
                $('#log').val(skill);
            }
            addRecSkill();
        });
        console.log("Done");
        paginate();
        // remove loading spinner
        document.querySelector('.spinner-container').style.display = "none";
        */
    }).catch( (err) => {
        // remove loading spinner
        document.querySelector('.spinner-container').style.display = "none";
        alert(err);
    });
}