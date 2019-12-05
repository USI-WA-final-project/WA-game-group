const fetch = require("node-fetch");
const querystring = require("querystring");

const MomentsProvider = require("./provider");

class ImgurProvider extends MomentsProvider {

    constructor() {
        super("Imgur");
    }


    /**
     * Upload an image to imgur
     *
     * @param req the request
     * @param item (name: String, dataURL: String)
     * @returns {Promise<boolean>} whether the operation completed successfully
     */
    async upload(req, item) {
        const albumData = await this.addToAlbum(req, item);
        if (!albumData) return false;

        return this.addToGallery(req, item, albumData);
    }

    getAuthHeaders(req) {
        return {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Bearer ' + req.app.locals.imgur.token,
        };
    }

    validateResult(result) {
        return result !== undefined &&
            (result.status === 200 || result.status === 409) &&
            result.data !== undefined;
    }

    async addToAlbum(req, item) {
        const data = {
            image: item.src.replace('data:image/jpeg;base64,', ''),
            type: 'base64',
            name: item.name + '.jpg',
            title: item.name,
            album: req.app.locals.imgur.album
        };

        const request = await fetch('https://api.imgur.com/3/upload', {
            method: 'POST',
            headers: this.getAuthHeaders(req),
            body: querystring.stringify(data)
        });
        const result = await request.json();

        if (!this.validateResult(result)) {
            return console.error(JSON.stringify(result));
        }

        return {
            id: result.data.id,
            link: result.data.link
        };
    }

    async addToGallery(req, item, data) {
        const request = await fetch('https://api.imgur.com/3/gallery/image/' + data.id, {
            method: 'POST',
            headers: this.getAuthHeaders(req),
            body: querystring.stringify({ title: item.name })
        });

        const result = await request.json();
        if (!this.validateResult(result)) {
            console.error(JSON.stringify(result));
            return false;
        }

        return true;
    }
}

module.exports = new ImgurProvider();