const AppError = class extends Error {
    constructor({status= '', message, info = ''}){
        super(message);

        this.name = this.constructor.name;
        this.status = status;
        this.info = info;
    }
}

export default AppError