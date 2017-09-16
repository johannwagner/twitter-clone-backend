const _ = require('lodash');
const RandomString = require("randomstring");
const uuidGenerator = require('uuid/v4');
const moment = require('moment');


class CredentialManager {

    static getInstance() {
        if(!this.instance) {
            this.instance = new this();
        }

        return this.instance;
    }

    constructor() {
        this.tokenList = {};
    }

    createAccount() {
        const clientId = uuidGenerator();
        const clientSecret = RandomString.generate(64);

        return {
            clientId: clientId,
            clientSecret: clientSecret
        }
    }

    static generateNewToken() {
        return RandomString.generate(64);
    }

    getContext(tokenString) {
        const clientContext = this.tokenList[tokenString];
        const expiredToken = clientContext && moment(clientContext.expireDate).isBefore(moment());


        if(!clientContext || expiredToken){
            return null;
        }

        return clientContext;
    }

    getToken(clientId, clientSecret, userId) {
        // {tokenString: clientSecret}

        const newToken = CredentialManager.generateNewToken();


        this.tokenList[newToken] = {
            clientId: clientId,
            expireDate: moment().add(10, 'm'),
            userId: userId
        };

        return newToken;
    }
}

module.exports = CredentialManager;