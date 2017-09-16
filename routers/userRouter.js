const express = require('express');
const router = express.Router();
const uuidGenerator = require('uuid/v4');
const RandomString = require("randomstring");
const Chance = require('chance');
const Helper = require('../Helper');

const CredentialManager = require('../credentialManager');
const DatabaseAdapter = require('../databaseAdapter');

const credentialManager = CredentialManager.getInstance();
const databaseAdapter = new DatabaseAdapter();
const chance = new Chance();


router.get('/', function (req, res) {

});

router.post('/', function (req, res) {

});

router.put('/', function (req, res) {

    let displayName = req.body.displayName;

    if(!displayName) {
        displayName = chance.name();
    }

    const clientCredentials = credentialManager.createAccount();

    databaseAdapter.putUser(clientCredentials.clientId, clientCredentials.clientSecret, displayName).then((result) => {
        // TODO: Improve Client Handshake

        let returnData = {
            clientId: clientCredentials.clientId,
            clientSecret: clientCredentials.clientSecret,
            displayName: displayName
        };

        Helper.sendSuccess(res, 201, returnData);
    }).error((error) => {
        Helper.sendError(res, 500, {error:error});
    });

});

module.exports = router;
