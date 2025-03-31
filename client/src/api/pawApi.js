import { useContext } from "react";

import request from "../utils/request";
import UserContext from "../contexts/UserContext";

const baseUrl = 'http://localhost:3030/data/paws';

export default {
    getOne(pawId) {
        return request.get(`${baseUrl}/${pawId}`);
    },
    edit(pawId, pawData) {
        return request.put(`${baseUrl}/${pawId}`, { ...pawData, _id: pawId });
    },
    delete(pawId) {
        return request.delete(`${baseUrl}/${pawId}`);
    },
};



export const useCreatePaw = () => {
    const { accessToken } = useContext(UserContext);

    const options = {
        headers: {
            'X-Authorization': accessToken,
        }
    };
    const create = (pawData) =>
        request.post(baseUrl, pawData, options);

    return {
        create
    }
}