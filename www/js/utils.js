async function submitData(data, endpoint="logger2") {
    return await fetch(`http://192.168.0.104:1234/${endpoint}`, {
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