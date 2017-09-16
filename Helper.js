
const CredentialManager = require("./credentialManager");
const credentialManager = CredentialManager.getInstance();

module.exports  = {

    sendSuccess: (res, statusCode, content) => {
        res.status(statusCode).json(content);
    },

    sendError: (res, statusCode, content) => {
        console.log(statusCode,content);


        if(content.error) {
            content.error = content.error.toString();
        }

        res.status(statusCode).json(content);
    },
    clientTokenMiddleware: (req, res, next) => {
        const clientTokenBody = req.body.clientToken;
        const clientTokenHeader = req.get('clientToken');

        const clientToken = clientTokenHeader ? clientTokenHeader : clientTokenBody;

        const clientContext = credentialManager.getContext(clientToken);

        if(!clientContext) {
            module.exports.sendError(res, 401, {error: 'Your token is invalid.'});
            return;
        }

        req.clientContext = clientContext;

        next();

    }

};