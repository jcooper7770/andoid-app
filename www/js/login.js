$(document).ready(function() {

});

$("#login").click( function (e) {
    // get login info
    var username = document.querySelector("#username").value;
    var password = document.querySelector("#password").value;

    // send POST to /login2
    var body = JSON.stringify({
        "username": username,
        "password": password
    });
    submitData(body, endpoint="login2").then((response) => {
        var resp = JSON.stringify(response);
        if (!response.success) {
            console.log(`ERROR: ${response.error}`);
            alert(`ERROR: ${response.error}`);
        } else {
            // success so login and go to other page
            sessionStorage.setItem("username", response.user);
            // need to figure out how to send the username over to the logger and use that to load data
            window.location.href = "logger.html";
        }
    });
});
