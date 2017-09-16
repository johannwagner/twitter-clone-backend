const express = require('express');
const router = express.Router();
const CredentialManager = require('../credentialManager');
const credentialManager = CredentialManager.getInstance();
const Helper = require('../Helper');
const DatabaseAdapter = require('../databaseAdapter');
const databaseAdapter  = new DatabaseAdapter();

router.post('/', function(req, res) {
    let clientId = req.body.clientId;
    let clientSecret = req.body.clientSecret;

    databaseAdapter.getUser(clientId).then((result) => {
        if(result.length <= 0) {
            throw Error('Unknown clientId.');
        }

        let userInformation = result[0];

        if(userInformation.clientSecret !== clientSecret){
            throw Error('Wrong clientSecret.');
        }

        const clientToken = credentialManager.getToken(clientId, clientSecret, userInformation.id);
        Helper.sendSuccess(res, 200, {clientToken: clientToken});

    }).catch((error) => {
        Helper.sendError(res, 401, {error: error});
    });
});

router.get('/', Helper.clientTokenMiddleware, function (req, res, next) {
    Helper.sendSuccess(res, 200, req.clientContext);
});
module.exports = router;

