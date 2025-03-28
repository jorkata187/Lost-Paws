import request from "../utils/request";

// const baseUrl = 'http://localhost:3030/data/paws';
const baseUrl = 'http://localhost:3030/jsonstore/paws';

export default {
    getOne(pawId) {
        return request.get(`${baseUrl}/${pawId}`);
    },
    create(pawData) {
        return request.post(baseUrl, pawData);
    },
    edit(pawId, pawData) {
        return request.put(`${baseUrl}/${pawId}`, { ...pawData, _id: pawId });
    },
    delete(pawId) {
        return request.delete(`${baseUrl}/${pawId}`);
    },
};