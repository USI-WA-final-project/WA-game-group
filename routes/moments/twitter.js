//THIS IS JUST THE STARTING SKETCH OF AN OPTIONAL FEATURE. THIS IS NOT EXPECTED TO WORK FOR NOW

const fetch = require("node-fetch");
const querystring = require("querystring");

const MomentsProvider = require("./provider");

class TwitterProvider extends MomentsProvider {

    constructor() {
        super("Twitter");
    }

    /**
     * Post an image on twitter
     *
     * @param req the request
     * @param item (name: String, dataURL: String)
     * @returns {Promise<boolean>} whether the operation completed successfully
     */

    async upload(req, item, data) {
        const request = await fetch("https://upload.twitter.com/1.1/media_data=" + item.src + "/upload.json?media_category=tweet_image", {
            method: 'POST'
        });

        const result = await request.json();
        if (!this.validateResult(result)) {
            console.error(JSON.stringify(result));
            return false;
        }

        return true;
    }
}

module.exports = new TwitterProvider();