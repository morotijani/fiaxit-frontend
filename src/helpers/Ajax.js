export function runFetch(url, method, data, callback) {
    // const domain = process.env.REACT_APP_API;

    // normalize domain and build fullUrl more safely
    let domain = process.env.REACT_APP_API || process.env.REACT_APP_API_URL || '';

    // forcefully remove literal "undefined" which can happen if build-time env is missing
    while (domain.includes('undefined')) {
        domain = domain.replace('undefined', '');
    }

    // ensure domain ends with single slash (if provided)
    if (domain && !domain.endsWith('/')) domain += '/';

    // remove leading slash from url to avoid double-slash
    const relative = url.startsWith('/') ? url.substring(1) : url;
    const fullUrl = domain ? domain + relative : (url.startsWith('/') ? url : '/' + url);

    // log the final URL (helps debug broken/missing env)
    console.log('API request to:', fullUrl);

    const isFormData = data instanceof FormData;

    const options = {
        method: method,
        headers: {
            'Accept': 'application/json',
            // 'X-CMC_PRO_API_KEY': process.env.REACT_APP_CMC_API_KEY 
        }
    }

    // Only set Content-Type if NOT FormData
    if (!isFormData) {
        options.headers['Content-Type'] = 'application/json';
    }

    if (method !== 'GET' && method !== 'DELETE') {
        options['body'] = isFormData ? data : JSON.stringify(data);
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
            if (resp.ok) {
                return resp.json();
            } else if (resp.status === 422 || resp.status === 401 || resp.status === 400 || resp.status === 404) {
                // validation or bad request, return errors as JSON
                return resp.json().then(errors => {
                    return { status: resp.status, success: false, errors: errors }
                });
            } else {
                // include status and text for easier debugging
                const text = await resp.text().catch(() => resp.statusText);
                throw new Error(`HTTP ${resp.status}: ${text || resp.statusText}`);
            }
        })
        .then(resp => {
            if (typeof callback === 'function') {
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

/**
 * For raw responses (blobs, text, etc)
 */
export function rawRequest(url, method = 'GET', data = null) {
    let domain = process.env.REACT_APP_API || process.env.REACT_APP_API_URL || '';
    while (domain.includes('undefined')) {
        domain = domain.replace('undefined', '');
    }
    if (domain && !domain.endsWith('/')) domain += '/';
    const relative = url.startsWith('/') ? url.substring(1) : url;
    const fullUrl = domain ? domain + relative : (url.startsWith('/') ? url : '/' + url);

    const isFormData = data instanceof FormData;
    const options = {
        method: method,
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('userJWTToken')}`
        }
    };

    if (!isFormData && data) {
        options.headers['Content-Type'] = 'application/json';
        options['body'] = JSON.stringify(data);
    } else if (isFormData) {
        options['body'] = data;
    }

    return fetch(fullUrl, options);
}

export function rawGet(url) {
    return rawRequest(url, 'GET');
}