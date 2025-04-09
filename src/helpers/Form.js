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

        const newFields = this.fields;
        newFields[key].value = value;
        
        this.setFields({...newFields}); // take newFields, and for every key in there set that up here
    }

    // submit form
    submitForm = async(evt) => {
        evt.preventDefault()
        const disabled = evt.target.getAttribute('disabled');
        if (disabled && (disabled === true || disabled === 'true')) return; // prevent from clicking the submit button over and over and fire off the submit each time
        evt.target.setAttribute('disabled', true);

        const data = this.prepareForPost()
        const resp = await this.methodMap[this.method](this.url, data); // run jsonPost and pass url and data
        
        if (resp.success) {
            this.success(resp)
        } else {
            this.processFormErrors(resp);
        }
        evt.target.removeAtrribute('disabled');
    }

    prepareForPost = () => {
        const data = {};
        // loop through each one of our fields 
        for (const[key, value] of Object.entries(this.fields)) {
            data[key] = value.value;
        }
        return data;
    }
}