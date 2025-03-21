import request from "../utils/request";

// const baseUrl = 'http://localhost:3030/data/paws';
const baseUrl = 'http://localhost:3030/jsonstore/paws';

export default {
    async getAll() {
        const result = await request.get(baseUrl);

        const paws = Object.values(result);

        return paws;
    },
     create(pawData) {
        return request.post(baseUrl, pawData);
    },
};