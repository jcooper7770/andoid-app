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