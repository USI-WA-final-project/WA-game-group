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
    async upload(req, item) {
        const r1 = await fetch("https://upload.twitter.com/1.1/media/upload.json?media_category=tweet_image", {
            method: 'POST',
            headers: this.getAuthHeaders(req),
            body: {
                "media_ids": item.src.replace('data:image/jpeg;base64,', '')
            }
        });

        const data = await r1.json();
        const baseApi = "https://api.twitter.com/1.1/statuses/update.json?status=The Legend of Ajax&media_ids=";
        const r2 = await fetch(baseApi + data.media_ids, {
            method: 'POST',
            headers: this.getAuthHeaders(req),
        });

        const result = await r2.json();
        if (!this.validateResult(result)) {
            console.error(JSON.stringify(result));
            return false;
        }

        return true;
    }

    getAuthHeaders(req) {
        return {
            "Content-Type": "application/x-www-form-urlencoded",
            'Postman-Token': '05b4e8bd-bf28-4be0-ab05-bb1c64d933d5',
            "cache-control": 'no-cache',
            "Authorization": 'OAuth oauth_consumer_key="OLI9Fqk2L2KQHZdKCSfhNyh5s",oauth_token="1202226584431812608-duYBFlGKZyKxC0nOrV7LnzZU2MhAcf",oauth_signature_method="HMAC-SHA1",oauth_timestamp="1576745403",oauth_nonce="yncIPs2IeT3",oauth_version="1.0",oauth_signature="oiTw%2B2qJyn7GBa6ZybjLjRhdVe8%3D"'
        };
    }

        get index() {
        return 2;
    }

    validateResult(result) {
        return result !== undefined &&
            (result.status === 200 || result.status === 409);
    }

}

module.exports = new TwitterProvider();