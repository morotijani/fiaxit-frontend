import {jspnPost, jsonGet, jsonPatch, jsonDelete} from './Ajax'

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

    methodMap = {POST}
}