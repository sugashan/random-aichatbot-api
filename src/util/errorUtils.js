import ClientError from "./errors/ClientError.js";

export const handleError = (res, err, msg) => {
    const errStatus = err && err.info && err.info.status && err.info.status.toString();

    if (errStatus === '404'){
        res.boom.notFound(`${msg} | ${JSON.stringify(err)}`, new ClientError(err));
    }
    res.boom.badImplementation(`${msg} | ${JSON.stringify(err)}`, new ClientError(err));
}