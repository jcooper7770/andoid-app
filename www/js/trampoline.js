var curr_page = 1;
var paginated_practices = [];
var replace_practice = false;
$(document).ready(function() {
    // Set logger date to current local date if a search date isn't chosen
    /*
    {% if not search_date %}
    {% if not current_date %}
    var date = new Date();
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    document.getElementById("logger-date").value = date.toJSON().slice(0,10);
    document.getElementById("airtime-date").value = date.toJSON().slice(0,10);
    {% else %}
    document.getElementById("logger-date").value = "{{current_date}}";
    document.getElementById("airtime-date").value = "{{current_date}}";
    document.getElementById("practice_date").value = "{{current_date}}";
    {% endif %}
    {% else %}
    document.getElementById("logger-date").value = "{{search_date}}";
    document.getElementById("airtime-date").value = "{{search_date}}";
    document.getElementById("practice_date").value = "{{search_date}}";
    {% endif %}
    */
    var date = new Date();
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    document.getElementById("logger-date").value = date.toJSON().slice(0,10);
    document.getElementById("airtime-date").value = date.toJSON().slice(0,10);

});

const paginate = function() {
    console.log("Starting pagination");
    var practices = [];
    var practices_div = document.getElementById("practices");
    var nodes = practices_div.childNodes;
    for (element of nodes){
        if (element.tagName == "DIV") {
            practices.push(element);
        }
    }

    var page_size = 10;
    n_pages = Math.floor(practices.length / page_size) + 1;
    for(i=0; i< n_pages; i++) {
        var start = i * page_size;
        var end = (i+1) * page_size;
        if(end > practices.length) {
            end = practices.length;
        }
        var current_page = practices.slice(start, end);
        paginated_practices.push(current_page);
    }

    practices_div.innerHTML = "";

    var page_buttons = document.createElement("div");
    page_buttons.id = "page_buttons";
    page_buttons.classList.add("text-center")

    var next_page = document.createElement("button");
    next_page.innerHTML = "Next >>";
    next_page.style = "padding:0 10px; curdor: pointer;"
    next_page.classList = "btn btn-secondary";
    next_page.id = "page_next";
    next_page.onclick = changePage;
    //practices_div.prepend(next_page);
    page_buttons.prepend(next_page);
    for(page=paginated_practices.length; page>0; page--){
        var new_page = document.createElement("button")
        new_page.innerHTML = page;
        new_page.id = "page_"+page;
        new_page.classList = "btn btn-secondary";
        new_page.onclick = changePage;
        new_page.style = "padding:0 10px; curdor: pointer;"
        //practices_div.prepend(new_page)
        page_buttons.prepend(new_page)
    }
    var prev_page = document.createElement("button");
    prev_page.innerHTML = "<< Prev";
    prev_page.style = "padding:0 10px; curdor: pointer;"
    prev_page.id = "page_prev";
    prev_page.classList = "btn btn-secondary";
    prev_page.onclick = changePage;
    //practices_div.prepend(prev_page);
    page_buttons.prepend(prev_page);
    //practices_div.append(page_buttons);
    document.querySelector(".sticky-nav").appendChild(page_buttons)

    var practices_page = document.createElement("div");
    practices_page.id = "practices_page";
    practices_page.style = "overflow-x: scroll; width: 100vw;"
    for(element of paginated_practices[curr_page-1]){
        practices_page.append(element);
        //practices_page.append(document.createElement("br"));
        //practices_page.append(document.createElement("br"));
    }
    practices_div.append(practices_page);

}

// Change the practice page
const changePage = function() {
    var page_id = this.id;
    var page = this.id.split("_")[1];
    if (page == curr_page){
        return
    }
    if(page == "prev"){
        if(curr_page > 1) {
            page = curr_page - 1;
        } else {
            return
        }
    }
    if(page == "next"){
        if(curr_page<paginated_practices.length){
            page = curr_page + 1;
        } else {
            return
        }
    }
    curr_page_id = "page_"+curr_page;
    //document.getElementById(curr_page_id).style.background = "#FFFFFF";
    document.getElementById(curr_page_id).classList = "btn btn-secondary";
    
    curr_page = parseInt(page);
    curr_page_id = "page_"+curr_page;
    //document.getElementById(curr_page_id).style.background = "#0000FF";
    document.getElementById(curr_page_id).classList = "btn btn-primary";
    var practices_page = document.getElementById("practices_page");
    practices_page.innerHTML = "";
    for(element of paginated_practices[curr_page-1]){
        practices_page.append(element);
        practices_page.append(document.createElement("br"));
        practices_page.append(document.createElement("br"));
    }

}
// keep the skill dropdowns open
$(function() {
    $("div.dropdown-menu").on("click", "[data-keepopenonclick]", function(e) {
            e.stopPropagation();
    });
});
// unhide the hidden notes by clicking the comment button
$("[id^=unhide-note]").click(function(e){
    var comment = $(this).siblings('span')[0];
    if (comment.style.display === "none") {
        comment.style.display = "inline";
    } else {
        comment.style.display = "none";
    }
});
$("[id^=skill]").click(function (e) {
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

$("#col-skill").on('click', 'a', function (e) {
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
function updateNumSkills() {
    let skills = $("#log").val().trim().split(/[\s]/);
    let num_skills = skills.length;
    document.getElementById('num_skills').textContent = "Number of skills: " + num_skills;
}
function addRecSkill() {
    var skill_text = $("#log").val();
    // ignore if last skill was a space
    if (skill_text[skill_text.length - 1] == " ") {
        return
    }
    let skills = skill_text.split(/[\s]/);
    var last_skill = skills[skills.length - 1];
    var next_skill = recommendSkill(last_skill);
    if (next_skill != undefined && next_skill != "") {
        // clear out all recommended 
        var recc = document.getElementsByClassName("recc-skill");
        while(recc.length > 0) {
            recc[0].parentNode.removeChild(recc[0]);
        }

        // add new recommended
        console.log("recommended: " + next_skill);
        // add a button with the skill under the log
        var new_line = document.createElement("br");
        new_line.className = "recc-skill";
        for(let i=0; i<next_skill.length; i++){
            n_skill = next_skill[i];
            var new_link = document.createElement('a');
            new_link.id = "skill" + n_skill;
            new_link.value = "skill" + n_skill;
            new_link.textContent = n_skill;
            new_link.className = "recc-skill btn btn-info"
            logger = document.getElementById("log");
            logger.parentNode.insertBefore(new_link, logger.nextSibling);
        }
        logger.parentNode.insertBefore(new_line, logger.nextSibling);

        // automatically add to log
        //$('#log').val(skill_text + ' ' + next_skill);
    }
}

function recommendSkill(current_skill) {
    /*
    if ( {{ user_turns }} == undefined) {
        var all_turns = [];
    }else {
        var all_turns = {{ user_turns | tojson }};
    }
    */
    if (user_turns == undefined) {
        all_turns = []
    } else {
        all_turns = user_turns;
    }
    var next_skills = {};
    for (let turn_num = 0; turn_num < all_turns.length; turn_num++) {
        var turn = all_turns[turn_num];
        skill = "";
        for (let skill_num = 0; skill_num < turn.length - 1; skill_num++) {
            var skill = turn[skill_num];
            //console.log("Current: " + current_skill + " - checking " + skill);
            // Get next skill if the current skill was found
            if (skill == current_skill){
                next_skill = turn[skill_num + 1];
                if (!(next_skill in next_skills)) {
                    next_skills[next_skill] = 0;
                }
                next_skills[next_skill]++;
            }
        }
    }

    if (next_skills.length == 0) {
        return "";
    }

    // sort and find the most used next skill
    var items = Object.keys(next_skills).map(function(key) {
        return [key, next_skills[key]];
    });
    items.sort(function(first, second) {
        return second[1] - first[1];
    });
    if (items.length == 0) {
        return "";
    }
    console.log(next_skills);
    most_used_next = items[0][0];
    most_used_next = items.slice(0, 5);
    most_used = []
    for (let i=0; i<most_used_next.length; i++){
        most_used.push(most_used_next[i][0]);
    }
    return most_used;

};

$("#log").on('input', function (e) {
    //updateNumSkills();
    addRecSkill();
});

// Get a reference to the button and spinner elements
const button = document.getElementById("submit-button");
const spinner = document.querySelector(".spinner-container");
button.addEventListener("click", function() {
  showSpinner("Submitting data...")
});
const goal_button = document.getElementById("submit-goals")
goal_button.addEventListener("click", function() {
  showSpinner("Submitting goals...")
});

const airtime_button = document.getElementById("submit-airtime")
airtime_button.addEventListener("click", function() {
  showSpinner("Submitting airtime...")
});
const skill_button = document.getElementById("submit-skills")
skill_button.addEventListener("click", function() {
  showSpinner("Submitting skill for search...")
});
$("[id$=_skills]").change(function (e) {
    var skill = $(this).val().slice(5).replace('t', 'o').replace('p', '<').replace('s', '/');
    var routineText = document.getElementById('log').value;
    if (routineText != "") {
        $('#log').val(routineText + ' ' + skill);
    } else {
        $('#log').val(skill);
    }
    //updateNumSkills();
});
$('[id^=copy-text]').click(function(e){
    // Add copy of text to log
    var tds = e.target.parentNode.parentNode.parentNode.children;
    var routine = "";
    for (var i=0; i<tds.length; i++){
        var td = tds[i];
        if (td == undefined || td.firstChild == null){
            break;
        }    
        else {
            if (td.firstChild.tagName == undefined){
                var doc = new DOMParser().parseFromString(td.innerHTML, "text/html");
                var elementText = doc.documentElement.textContent;
                routine = routine + " " + elementText;
            }
        }
    }
    var skills = document.getElementById('log').value;
    var newText = "";
    if (skills != ""){
        newText = skills + '\n' + routine;
    } else {
        newText = routine;
    }
    
    // Remove extra spaces
    newText = newText.trim().replace('\n ', '\n');
    $('#log').val(newText);
});
$('#repeat-skills').click(function (e) {
    //var skills = $('log').val();
    var skills = document.getElementById('log').value;
    if (skills != "") {
        if (skills.endsWith('\n')) {
            var newText = skills + skills;
        } else {
            var newText = skills + ' ' + skills;
        }
        nextText = newText.trim().replace('\n ', '\n');
        $('#log').val(newText);
    }
    $('#log').focus();
});
$('#next-line').click(function(e) {
    var skills = document.getElementById('log').value;
    if (skills != "" && !skills.endsWith('\n')) {
        $('#log').val(skills + '\n');
    }
    $('#log').focus();
});
$("[id^=minimize_]").click(function(e){
    var section_to_minimize = event.target.id.split("_")[1];
    var minimize_id = section_to_minimize + "_body";
    var x = document.getElementById(minimize_id);
    if (x.style.display === "none") {
        x.style.display = "";
    } else {
        x.style.display = "none";
    }
    var button = document.getElementById(e.target.id);
    if (button.className == "fa fa-window-minimize") {
        button.className = "fa fa-window-maximize";
    } else {
        button.className = "fa fa-window-minimize";
    }
});
function editPractice(target, date, event) {
    // set date
    document.querySelector("#logger-date").value = date;

    // set event
    document.querySelector("#event").value = event;

    // set practice log
    console.log(`Clicked on ${target.id}`);
    var table = $(`#${target.id}`).parents("table")[0];
    console.log(`table: ${table}`);
    var logElement = document.querySelector("#log");
    getLogFromPractice(table).then((log) => {
        console.log(`Log: ${log}`);
        logElement.value = log;
    });
    logElement.scrollIntoView();
}
async function getLogFromPractice(table) {
    var logLines = [];
    var rows = table.children[1].children;
    for (let i=0; i<rows.length; i++) {
        var rowString = "";
        var row = rows[i];
        if (row.children.length == 0) {
            continue
        }
        if (row.children.length == 1) {
            logLines.push("");
            logLines.push(`# ${row.children[0].innerText.trim()}`);
            continue
        }
        var row_comment = "";
        //var lastCol = row.children.length - 7;
        var lastCol = row.children.length - 6;
        if (lastCol < 0) {
            lastCol = row.children.length;
        }
        for (let j=0; j<lastCol; j++) {
            var cell = row.children[j];
            // handle comments
            if (j == 0) {
                if (cell.children.length == 3) {
                    row_comment = cell.children[2].innerText.trim();
                }
                continue
            }
            // handle skills
            var value = cell.innerText;
            rowString = `${rowString} ${value}`;  
        }
        logLines.push(rowString.trim());
        if (row_comment != "") {
            logLines.push(`# ${row_comment}`);
        }
    }
    var log = logLines.join("\n");
    console.log(`Log: ${log}`);
    return log
}

/*
$("[id^=remove_]").click(function (e) {
    e.preventDefault();
    var date_to_remove = event.target.id.split("_")[1];
    var event_to_remove = event.target.id.split("_")[2];
    let confirmText = "".concat("Are you sure you want to delete ", date_to_remove, " ", event_to_remove, "?");
    if (confirm(confirmText) == true) {
        showSpinner("Deleting data...")

        $.ajax({
            type: 'GET',
            url: "/logger/delete/" + date_to_remove + "/" + event_to_remove,
            success: function (data) {
                location.reload();
            }
        });
    }
});
*/
async function sendLogData(log_text, notes, name, event, date) {
    return await fetch("http://192.168.68.124:1234/logger2", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            'log': log_text,
            'name': name,
            'event': event,
            'notes': notes,
            'date': date,
            'replace': replace_practice,
        }),
    }).then((response) => {
        if(!response.ok) {
            console.log("Error. Rejecting. ", response.status, "(", response.statusText ,")");
            return Promise.reject()
        }
        return new Promise((resolve, reject) => {
            //return resolve(response.text());
            return resolve(response.json());
        })

    }).catch(
        error => {
            console.log("ERROR: ", error);
            return Promise.reject()
    })
}
async function submitData(data, endpoint="logger2") {
    return await fetch(`http://192.168.68.124:1234/${endpoint}`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: data,
    }).then((response) => {
        if(!response.ok) {
            console.log("Error. Rejecting. ", response.status, "(", response.statusText ,")");
            return Promise.reject()
        }
        return new Promise((resolve, reject) => {
            //return resolve(response.text());
            return resolve(response.json());
        })

    }).catch(
        error => {
            console.log("ERROR: ", error);
            return Promise.reject()
    })    
}
$("#submit-button").click(function (e) {
    showSpinner("Submitting data...");

    // get data from log
    var data = document.querySelector("#log").value;
    var notes = document.querySelector("#notes").value;
    var name = document.querySelector("#name").value;
    var event = document.querySelector("#event").value;
    var date = document.querySelector("#logger-date").value;
    console.log(`Submittting data for ${name} on ${date}`);
    // send data to endpoint then refresh
    var data = JSON.stringify({
        'log': data,
        'name': name,
        'event': event,
        'notes': notes,
        'date': date,
        'replace': replace_practice,
    });
    //sendLogData(data, notes, name, event, date).then(() => {
    submitData(data).then((resp) => {
        if (!resp.success) {
            alert(resp.error);
        } else {
            replace_practice = false;
            document.location.reload();
        }
        // add new data to the localstorage
        //document.location.reload();
    }).catch(() => {
        console.log("Failed to send data");
        //document.querySelector('.spinner-container').style.display = "none";
    });

});

// goals
var deletedGoals = [];
var deletedAirtimes = [];
document.body.addEventListener( 'click', function ( event ) {
    if( event.target.id.startsWith('delete_goal') ) {
    console.log(`clicked delete button ${event.target}`);
    var del_id = event.target.id;
    deletedGoals.push(del_id);
    console.log(`Adding ${del_id} to be removed from goals`);

    // hide the row
    if (event.target.tagName == "BUTTON") {
        var button = event.target;
        button.parentNode.parentNode.style.display = "none";
    } else if (event.target.tagName == "SPAN") {
        var button = event.target.parentNode;
        button.parentNode.parentNode.style.display = "none";
    }
    };
    if (event.target.id.startsWith("delete_airtime")) {
    var del_id = event.target.id;
    deletedAirtimes.push(del_id);
    console.log(`Adding ${del_id} to be removed from airtimes`);

    // hide the row
    if (event.target.tagName == "BUTTON") {
        var button = event.target;
        button.parentNode.parentNode.style.display = "none";
    } else if (event.target.tagName == "SPAN") {
        var button = event.target.parentNode;
        button.parentNode.parentNode.style.display = "none";
    } 

    }
    if (event.target.id.startsWith("unhide")) {
    var comment = event.target.nextElementSibling;
    console.log(`target: ${event.target.id}. comment: ${comment}`);
    //var comment = $(this).siblings('span')[0];
    if (comment.style.display === "none") {
        comment.style.display = "inline";
    } else {
        comment.style.display = "none";
    }
    }
    if (event.target.id.startsWith("edit_")) {
        var date_to_edit = event.target.id.split("_")[1];
        var event_to_edit = event.target.id.split("_")[2];

        var date_parts = date_to_edit.split("-");
        var month = date_parts[0];
        var day = date_parts[1];
        var year = date_parts[2];
        var date_string = `${year}-${month}-${day}`;
        console.log(`Clicked on ${date_string} ${event_to_edit}`);
        editPractice(event.target, date_string, event_to_edit);
        replace_practice = true;
    }
    if (event.target.id.startsWith("remove_")) {
    var date_to_remove = event.target.id.split("_")[1];
    var event_to_remove = event.target.id.split("_")[2];
    onDeleteConfirm(1, date_to_remove, event_to_remove);
    /*
    navigator.notification.confirm(
        `Are you sure you want to delete ${date_to_remove} ${event_to_remove}?`,
        function(buttonIndex) {
            onDeleteConfirm(buttonIndex, date_to_remove, event_to_remove)
        },
        'Delete Practice',
        ['yes','no']
    );
    */
    }

    function onDeleteConfirm(buttonIndex, date_to_remove, event_to_remove) {
        if (buttonIndex == 1) {
            showSpinner("Deleting Practice...");
            var name = document.querySelector("#name").value;
            var data = JSON.stringify({
                'day': date_to_remove,
                'event': event_to_remove,
                'name': name,
            });
            submitData(data, "/logger/delete").then(() => {
                // remove from localstorage

                document.location.reload();
            }).catch(() => {
                console.log("Failed to send data");
                document.querySelector('.spinner-container').style.display = "none";
            });
        }
    }
});

$("#submit-goals").click(function (e) {
    var name = document.querySelector("#name").value;
    var goal = document.querySelector("#goal_string").value;
    console.log(`Submitting goal for ${name}: ${goal}`);
    // checkk which goals are checked off
    var checkboxes = document.querySelectorAll("#goals-table > tr > td > input");
    var obj = {
        'name': name,
        'goals_form': 1,
        'goal_string': goal,
    };
    checkboxes.forEach(function (box) {
        if (box.checked) {
            obj[box.id] = true;
            console.log(`Adding in ${box.id} because checked`);
        }
    });
    // add goals which were deleted
    deletedGoals.forEach(function (goal) {
        console.log(`Deleting ${goal}`);
        obj[goal] = true;
    });
    var data = JSON.stringify(obj);
    submitData(data).then((response) => {
        document.location.reload();
    }).catch(() => {
        console.log("Failed to send goal");
        document.querySelector('.spinner-container').style.display = "none";
    });
});
$("#submit-airtime").click(function (e) {
    var name = document.querySelector("#name").value;
    var airtime = document.querySelector("#airtime_string").value;
    var airtime_date = document.querySelector("#airtime-date").value;
    console.log(`Submitting airtime for ${name}: ${airtime}`);
    var obj = {
        'name': name,
        'airtime_form': 1,
        'airtime-date': airtime_date,
    };
    if (airtime != "") {
        obj['airtime_string'] = airtime;
    }
    // add airtimes which were deleted
    deletedAirtimes.forEach(function (atime) {
        console.log(`Deleting ${atime}`);
        obj[atime] = true;
    });
    var data = JSON.stringify(obj);
    submitData(data).then((response) => {
        if ( response.success ) {
            document.location.reload();
        } else {
            console.log("FAILED");
        }
    }).catch(() => {
        console.log("Failed to send goal");
        document.querySelector('.spinner-container').style.display = "none";
    });
});

// For searching for skills
$("#submit-skills").click(function (e) {
    var skills = document.querySelector("#practice_skills").value;

    for(let i=0; i<paginated_practices.length; i++) {
        var page = paginated_practices[i];
        for (let j=0; j<page.length; j++) {
            var container = page[j];
            var table = container.children[0];

            // re-display the table incase it was hidden
            table.style.display = "";
            var tbody = table.children[1];
            var trs = tbody.children;
            var numRowsHidden = 0;
            for(let k=0; k<trs.length; k++) {
                var tr = trs[k];
                if (skills == "") {
                    tr.style.display = "";
                    continue;
                }
                var row_string = "";
                var tds = tr.children;
                for(let l=1; l<tds.length; l++) {
                    row_string = row_string + " " + tds[l].innerHTML.replace("&lt;", "<");
                }
                if (!row_string.includes(skills)) {
                    tr.style.display = "none";
                    numRowsHidden++;
                }
            }
            if (numRowsHidden == trs.length){
                table.style.display = "none";
            }
        }
    }
    document.querySelector('.spinner-container').style.display = "none";
});


$("#search-practice").click(function (e) {

    var val = document.querySelector("#practice_date").value;
    var date = new Date(val);
    var string_date = ((date.getMonth() > 8) ? (date.getMonth() + 1) : ('0' + (date.getMonth() + 1))) + '/' + ((date.getDate() > 8) ? (date.getDate()+1) : ('0' + (date.getDate()+1))) + '/' + date.getFullYear();
    console.log(string_date);
    for(let i=0; i<paginated_practices.length; i++) {
        var page = paginated_practices[i];
        for (let j=0; j<page.length; j++) {
            var container = page[j];
            var table = container.children[0];

            // re-display the table incase it was hidden
            table.style.display = "";
            if (val == "") {
                continue
            }
            var thead = table.children[0];
            var title = thead.children[0].children[0].innerHTML;
            if (!title.includes(string_date)) {
                table.style.display = "none";
            }
        }
    }
    document.querySelector('.spinner-container').style.display = "none";
});
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
  styleElement.insertAdjacentHTML('beforeend', spanCSS);

  // move each letter into a span element
  var chars = text.split('');
  var wrappedChars = chars.map(function(char) {
    return '<span>' + char + '</span>';
  });
  spinnerText.innerHTML = wrappedChars.join('');

  // make the spinner visible
  var spinnerContainer = document.querySelector(".spinner-container");
  spinnerContainer.style.display = "flex";

  // allow spinner to be closed
  var spinnerClose = document.getElementById("spinner-close");
  spinnerClose.addEventListener("click", function() {
    spinnerContainer.style.display = "none";
  });
}