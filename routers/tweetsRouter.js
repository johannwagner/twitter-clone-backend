const express = require('express');
const router = express.Router();
const Helper = require('../Helper');
const DatabaseAdapter = require('../databaseAdapter');

const databaseAdapter = new DatabaseAdapter();


router.get('/:userId?/:tweetId?', Helper.clientTokenMiddleware, function (req, res) {
    let userId = req.params.userId;

    databaseAdapter.getTweets(userId).then((tweets) => {
        Helper.sendSuccess(res, 200, tweets);
    }).catch((error) => {
        Helper.sendError(res, 500, error);
    })


});

router.post('/:userId/:tweetId', Helper.clientTokenMiddleware, function (req, res) {
    let body = req.body.body;

    let tweetId = Number(req.params.tweetId);
    let userId = Number(req.params.userId);

    if(req.clientContext.userId !== userId){
        Helper.sendError(res, 401, 'Not allowed.');
        return;
    }


    databaseAdapter.postTweet(tweetId, userId, body).then(() => {
        Helper.sendSuccess(res, 200, {});
    }).catch((error) => {
        Helper.sendError(res, 500, error);
    })

});

router.put('/:userId/:tweetId/reaction', Helper.clientTokenMiddleware , (req, res, next) => {
    let userId = Number(req.params.userId);
    let tweetId = Number(req.params.tweetId);
    let reactorId = req.clientContext.userId;
    let reactionIdentifer = req.body.reactionIdentifier;

    databaseAdapter.addReaction(tweetId, reactorId, reactionIdentifer).then((result) => {
        Helper.sendSuccess(res, 200, {});
    }).catch((error) => {
        Helper.sendError(res, 500, error);
    })
});
router.delete('/:userId/:tweetId/reaction', Helper.clientTokenMiddleware, (req, res, next) => {
    let userId = Number(req.params.userId);
    let tweetId = Number(req.params.tweetId);
    let reactorId = req.clientContext.userId;
    let reactionIdentifer = req.body.reactionIdentifier;

    databaseAdapter.removeReaction(tweetId, reactorId, reactionIdentifer).then((result) => {
        Helper.sendSuccess(res, 200, {});
    }).catch((error) => {
        Helper.sendError(res, 500, error);
    })
});


router.put('/', Helper.clientTokenMiddleware, function (req, res) {
    let userId = req.clientContext.userId;
    let tweetBody = req.body.body;
    let referenceTweetId = req.body.referenceTweetId;


    databaseAdapter.putTweet(tweetBody, userId, referenceTweetId).then((result) => {
        Helper.sendSuccess(res, 201, {});
    }).catch((error) => {
        Helper.sendError(res, 500, error);
    })
});


module.exports = router;
