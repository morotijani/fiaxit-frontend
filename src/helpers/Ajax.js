export function runFetch(url, method, data, callback) {
    const domain = process.env.REACT_APP_API;
    const options = {
        method: method, 
        headers: {
            'Accept': 'application/json', 
            'Content-Type': 'application/json'
        }
    }

    //
    if (method !== 'GET' && method !== 'DELETE') {
        options['body'] = JSON.stringify[data];
    }

    // Add authorization header if user is logged in
    const token = localStorage.getItem('userJWTToken');
    if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
    }

    // fetch
    return fetch(domain + url, options).then(async resp => {
        if (resp.ok) {
            return resp.json();
        } else if(resp.status === 422) {
            return resp.json().then(errors => {
                return {status: resp.status, success: false, errors: errors}
            });
        } else {
            throw new Error(resp.statusText);
        }
    }).then(resp => {
        if (typeof callback === 'function') {
            return callback(resp);
        } else {
            return resp;
        }
    })
}

// post
export function jsonPost(url, data, callback) {
    return runFetch(url, 'POST', data, callback);
}

// get
export function jsonGet(url, callback) {
    return runFetch(url, 'GET', {}, callback);
}

// patch
export function jsonPatch(url, data, callback) {
    return runFetch(url, 'PATCH', data, callback)
}

// delete
export function jsonDelete(url, callback) {
    return runFetch(url, 'DELETE', {}, callback)
}