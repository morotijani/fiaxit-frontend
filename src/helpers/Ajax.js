export function runFetch(url, method, data, callback) {
    // const domain = process.env.REACT_APP_API;

    // normalize domain and build fullUrl more safely
    let domain = process.env.REACT_APP_API || '';
    // ensure domain ends with single slash (if provided)
    if (domain && !domain.endsWith('/')) domain += '/';
    // remove leading slash from url to avoid double-slash
    const relative = url.startsWith('/') ? url.substring(1) : url;
    const fullUrl = domain ? domain + relative : (url.startsWith('/') ? url : '/' + url);

    // log the final URL (helps debug broken/missing env)
    console.log('API request to:', fullUrl);

    const options = {
        method: method,
        headers: {
            'Accept': 'application/json', 
            'Content-Type': 'application/json', 
            // 'X-CMC_PRO_API_KEY': process.env.REACT_APP_CMC_API_KEY 
        }
    }

    if (method !== 'GET' && method !== 'DELETE'){
        options['body'] = JSON.stringify(data);
    }

    // add authorization header if the user is logged in.
    const token = localStorage.getItem('userJWTToken');
    if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
    }

    // return fetch(domain + url, options).then(async resp => {
    //     if(resp.ok) {
    //         return resp.json();
    //     } else if(resp.status === 422){
    //         return resp.json().then(errors => {
    //             return {status: resp.status, success: false, errors: errors}
    //         });
    //     } else {
    //         throw new Error(resp.statusText);
    //     }
    // }).then(resp => {
    //     if(typeof callback === 'function') {
    //         return callback(resp);
    //     } else {
    //         return resp;
    //     }
    // })

    return fetch(fullUrl, options)
        .then(async resp => {
            if(resp.ok) {
                return resp.json();
            } else if (resp.status === 422) {
                return resp.json().then(errors => {
                    return {status: resp.status, success: false, errors: errors}
                });
            } else if (resp.status === 401) {
                // unauthorized, token may be expired or invalid
                // optionally, could trigger a logout event here
                return resp.json().then(errors => {
                    return {status: resp.status, success: false, errors: errors}
                });
            } else {
                // include status and text for easier debugging
                const text = await resp.text().catch(()=>resp.statusText);
                throw new Error(`HTTP ${resp.status}: ${text || resp.statusText}`);
            }
        })
        .then(resp => {
            if(typeof callback === 'function') {
                return callback(resp);
            } else {
                return resp;
            }
        })
        .catch(err => {
            // clearer error log including URL
            console.error('Fetch failed for', fullUrl, err);
            throw err;
        })
}

export function jsonPost(url, data, callback) {
    return runFetch(url, 'POST', data, callback);
}

export function jsonGet(url, callback) {
    return runFetch(url, 'GET', {}, callback);
}

export function jsonPatch(url, data, callback) {
    return runFetch(url, 'PATCH', data, callback);
}

export function jsonDelete(url, callback) {
    return runFetch(url, 'DELETE', {}, callback);
}