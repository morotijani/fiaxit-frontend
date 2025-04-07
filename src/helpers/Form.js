import {jspnPost, jsonGet, jsonPatch, jsonDelete, jsonPost} from './Ajax'

export class Form {
    url;
    fields;
    setFields;
    success;
    method;

    constructor(url, fields, setFields, success, method = 'POST') {
        this.url = url;
        this.fields = fields;
        this.setFields = setFields;
        this.success = success;
        this.method = method;
    }

    // 
    methodMap = {
        POST: jsonPost, 
        GET: jsonGet, 
        PATCH: jsonPatch, 
        DELETE: jsonDelete
    };

    // setters
    setUrl = (url) => {
        this.url = url;
    }

    setMethod = (method) => {
        this.method = method;
    }

    handleInputChanges = (evt) => {
        const key = evt.target.name;
        const value = evt.target.value;

        
    }
}