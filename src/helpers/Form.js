import { jsonGet, jsonPatch, jsonDelete, jsonPost } from './Ajax'

export class Form {
    url;
    fields;
    setFields;
    success;
    error;

    constructor(url, fields, setFields, success, error = null, method = 'POST') {
        this.url = url;
        this.fields = fields;
        this.setFields = setFields;
        this.success = success;
        this.error = error;
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

        this.setFields({ ...newFields }); // take newFields, and for every key in there set that up here
    }

    // submit form
    submitForm = async (evt) => {
        evt.preventDefault()
        const disabled = evt.target.getAttribute('disabled');
        if (disabled && (disabled === true || disabled === 'true')) return;

        this.clearFormErrors()

        try {
            const data = this.prepareForPost()
            const resp = await this.methodMap[this.method](this.url, data);

            if (resp.success) {
                this.clearFormErrors();
                this.clearFormValues();
                this.success(resp)
            } else {
                this.processFormErrors(resp);
                if (typeof this.error === 'function') {
                    this.error(resp);
                }
            }
        } catch (error) {
            console.error('Form submission error:', error);
            import('react-hot-toast').then(({ default: toast }) => {
                toast.error(error.message || "An unexpected error occurred. Please try again.");
            });
        }
    }

    prepareForPost = () => {
        const data = {};
        // loop through each one of our fields 
        for (const [key, value] of Object.entries(this.fields)) {
            data[key] = value.value;
        }
        return data;
    }

    processFormErrors = (resp) => {
        const newState = this.fields
        let hasShownGeneralError = false;

        // helper to show general error
        const showGeneralError = (msg) => {
            if (!hasShownGeneralError) {
                import('react-hot-toast').then(({ default: toast }) => {
                    toast.error(msg || "Something went wrong. Please check your inputs.");
                });
                hasShownGeneralError = true;
            }
        };

        if (resp.message && !resp.errors) {
            if (resp.path && newState.hasOwnProperty(resp.path)) {
                newState[resp.path].isInvalid = true;
                newState[resp.path].msg = resp.message;
            } else {
                showGeneralError(resp.message);
            }
        }

        // check if resp has errors array
        if (resp.errors) {
            if (!Array.isArray(resp.errors)) {
                const key = resp.errors.path;
                const msg = resp.errors.message;
                if (key && newState.hasOwnProperty(key)) {
                    newState[key].isInvalid = true;
                    newState[key].msg = msg || "There was an error with this field.";
                } else {
                    showGeneralError(msg || resp.message);
                }
            } else {
                resp.errors.forEach(error => {
                    const key = error.path;
                    const msg = error.message;
                    if (key && newState.hasOwnProperty(key)) {
                        newState[key].isInvalid = true;
                        newState[key].msg = msg;
                    } else {
                        showGeneralError(msg || resp.message);
                    }
                })
            }
        }

        this.setFields({ ...newState });
    }

    clearFormErrors = () => {
        const newState = this.fields;
        for (const [key] of Object.entries(this.fields)) {
            newState[key].isInvalid = false;
            newState[key].msg = "";
        }
        this.setFields({ ...newState });
    }

    clearFormValues = () => {
        const newState = this.fields;
        for (const [key] of Object.entries(this.fields)) {
            newState[key].value = "";
        }
        this.setFields({ ...newState });
    }

    populateFormValues = (vals) => {
        const newState = this.fields;
        for (const [key] of Object.entries(this.fields)) {
            if (vals.hasOwnProperty(key)) {
                newState[key].value = vals[key];
            }
        }
        // update state by setting state into new object manipulated
        this.setFields({ ...newState });
    }
}