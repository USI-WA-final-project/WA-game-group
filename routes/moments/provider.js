class MomentsProvider {

    constructor(name) {
        this.name = name;
    }

    async upload(req, item) {
        return false;
    }

    getAuthHeaders(req) {
    }

    get index() {
        return -1;
    }
}

module.exports = MomentsProvider;