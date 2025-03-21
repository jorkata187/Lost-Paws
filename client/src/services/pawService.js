import request from "../utils/request";

// const baseUrl = 'http://localhost:3030/data/paws';
const baseUrl = 'http://localhost:3030/jsonstore/paws';

export default {
    async getAll() {
        const result = await request.get(baseUrl);

        const pets = Object.values(result);

        return pets;
    },
     create(petData) {
        return request.post(baseUrl, petData);
    },
};