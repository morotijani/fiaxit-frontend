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
        this.clearFormErrors()

        const data = this.prepareForPost()
        const resp = await this.methodMap[this.method](this.url, data); // run jsonPost and pass url and data
        
        if (resp.success) {
            this.clearFormErrors();
            this.clearFormValues();
            this.success(resp)
        } else {
            this.processFormErrors(resp);
        }
        evt.target.removeAttribute('disabled');
    }

    prepareForPost = () => {
        const data = {};
        // loop through each one of our fields 
        for (const[key, value] of Object.entries(this.fields)) {
            data[key] = value.value;
        }
        return data;
    }

    processFormErrors = (resp) => {
        const newState = this.fields
        resp.errors.forEach(error => {
            const key = error.path;
            const msg = error.message;
            if (newState.hasOwnProperty(key)) {
                newState[key].isInvalid = true;
                newState[key].msg = msg;
            }
        })
        this.setFields({...newState});
    }

    clearFormErrors = () => {
        const newState = this.fields;
        for (const[key] of Object.entries(this.fields)) {
            newState[key].isInvalid = false;
            newState[key].msg = "";
        }
        this.setFields({...newState});
    }

    clearFormValues = () => {
        const newState = this.fields;
        for (const[key] of Object.entries(this.fields)) {
            newState[key].value = "";
        }
        this.setFields({...newState});
    }

    populateFormValues = (vals) => {
        const newState = this.fields;
        for (const[key] of Object.entries(this.fields)) {
            if (vals.hasOwnProperty(key)) {
                newState[key].value = vals[key];
            }
        }
        // update state by setting state into new object manipulated
        this.setFields({...newState});
    }
}