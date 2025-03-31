import request from "../utils/request";

const baseUrl = 'http://localhost:3030/data/paws';

export default {
    getOne(pawId) {
        return request.get(`${baseUrl}/${pawId}`);
    },
    create(pawData, accessToken) {

        const options = {
            headers: {
                'X-Authorization': accessToken,
            }
        };
        return request.post(baseUrl, pawData, options);
    },
    edit(pawId, pawData) {
        return request.put(`${baseUrl}/${pawId}`, { ...pawData, _id: pawId });
    },
    delete(pawId) {
        return request.delete(`${baseUrl}/${pawId}`);
    },
};