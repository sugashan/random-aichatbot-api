const ClientError = class {
    constructor({status= 'UNDEFINED', message, info}){
        this.code = status;
        this.message = message;
        this.info = info;
    }
}

export default ClientError