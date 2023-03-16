async function addNav() {
    await $.get("nav.html", function(data) {
        $("#nav-placeholder").replaceWith(data);
    });
}

async function load(){
    await addNav();
}
load();
screen.orientation.unlock();

//document.querySelector('.spinner-container').style.display = "none";
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

async function submitData(data, endpoint="logger2") {
    /*
    for (let i=0; i< 10; i++) {
        //await fetch(`https://192.168.68.124:1234/test2`, {
        await fetch(`https://192.168.68.124:1234/test2`, {
            method: "GET",
        })
        .then((response) => response.json())
        .then((resp) => {
            console.log(`${resp}`);
            var y = JSON.stringify(resp);
            console.log(`dfsdf ${y}`);
        }).catch((err) => {
            console.log(`ERROR: ${err}`);
        });
    }
    */

    return await fetch(`https://192.168.68.124:1234/${endpoint}`, {
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

async function sendGet(endpoint) {
    var url = `https://192.168.68.124:1234/${endpoint}`;
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
async function getRetries(endpoint, numRetries, dataFunc) {
    for (let i = 0; i < numRetries; i++){
        var caughtError = false;
        var done = false;
        console.log("Attempt number: ", i+1);
        //await loadHTML3().then((data) => {
        await sendGet(endpoint).then((data) => {
            console.log("data: ", data);

            // do stuff with data
            dataFunc(data);
            done = true;
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
