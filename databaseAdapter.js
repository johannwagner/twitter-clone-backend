import secret from "./secret";

const mysql = require('promise-mysql');
const _ = require('lodash');

class DatabaseAdapter {

    constructor() {
        this.poolPromise = mysql.createPool(secret.DatabaseCredentials);
    }

    putUser(clientId, clientSecret, displayName){
        return this.poolPromise.query('INSERT INTO users (clientId, clientSecret, displayName) VALUES (?,?,?)', [clientId, clientSecret, displayName])
    }

    getUser(clientId) {
        return this.poolPromise.query('SELECT * FROM users WHERE clientId = ?', [clientId]);
    }

    /* TWEETS */

    getTweets(userId, referenceTweetIds) {

        let dbStatement;
        let baseString = 'SELECT t.*, u.displayName FROM tweets t LEFT JOIN users u ON u.id = t.ownerId WHERE t.referenceTweetId ' +
            (referenceTweetIds ? 'IN (' + this.poolPromise.escape(referenceTweetIds) + ')': 'IS NULL');
        let sortString = 'ORDER BY t.id DESC';


        if(userId) {
            dbStatement = this.poolPromise.query(baseString + ' AND t.ownerId = ? ' + sortString, [userId]);
        } else {
            dbStatement = this.poolPromise.query(baseString + " " + sortString);
        }

        // TODO: Optimize it.

        let retTweets;
        return dbStatement.then((tweets) => {
            let tweetIds = tweets.map((t) => t.id);
            retTweets = tweets;
            return this.poolPromise.query('SELECT r.*, u.displayName FROM reactions r LEFT JOIN users u ON u.id = r.ownerId WHERE r.tweetId IN (?)', [tweetIds]);
        }).then((reactions) => {
            retTweets.forEach((tweet) => {
                tweet.reactions = reactions.filter((r) => r.tweetId === tweet.id).map((r) => {
                    return {id: r.id,
                        reactionId: r.reactionId,
                        displayName: r.displayName,
                        imageUrl: "https://static-cdn.jtvnw.net/emoticons/v1/" + r.reactionId + "/1.0"}
                });

                tweet.reactions = _.groupBy(tweet.reactions, (reaction) => reaction.reactionId);
            });

            if(referenceTweetIds) {
                return null;
            }

            return this.getTweets(userId, retTweets.map((t) => t.id))
        }).then((referenceTweets) => {
            if(!referenceTweets) {
                return retTweets;
            }

            retTweets.forEach((tweet) => {
                tweet.referenceTweets = referenceTweets.filter((t) => t.referenceTweetId === tweet.id);
            })

            return retTweets;
        });
    }

    putTweet(body, userId, referenceTweetId){
        return this.poolPromise.query('INSERT INTO tweets (body, ownerId, referenceTweetId) VALUES (?,?,?)', [body, userId ,referenceTweetId]);
    }

    postTweet(tweetId, userId, body) {
        return this.poolPromise.query('UPDATE tweets SET body=? WHERE id = ? AND ownerId = ?', [body, tweetId, userId]);
    }

    addReaction(tweetId, reactorId, reactionId) {
        return this.poolPromise.query('INSERT INTO reactions (tweetId, ownerId, reactionId) VALUES(?,?,?)', [tweetId, reactorId, reactionId]);
    }

    removeReaction(tweetId, reactorId, reactionIdentifer) {
        return this.poolPromise.query('UPDATE reactions SET wasRemoved = 1 WHERE tweetId = ? AND ownerId = ? AND reactionIdentifier = ?', [tweetId, reactorId, reactionIdentifer]);
    }
}

module.exports= DatabaseAdapter;