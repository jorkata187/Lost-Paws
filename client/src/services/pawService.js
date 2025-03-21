import request from "../utils/request";

// const baseUrl = 'http://localhost:3030/data/paws';
const baseUrl = 'http://localhost:3030/jsonstore/paws';

export default {
    async getAll() {
        const result = await request.get(baseUrl);

        const paws = Object.values(result);

        return paws;
    },
    getOne(pawId) {
        return request.get(`${baseUrl}/${pawId}`);
    },
     create(pawData) {
        return request.post(baseUrl, pawData);
    },
    delete(pawId) {
        return request.delete(`${baseUrl}/${pawId}`);
    },
};