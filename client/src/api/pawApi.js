import { useContext, useEffect, useState } from "react";

import request from "../utils/request";
import UserContext from "../contexts/UserContext";

const baseUrl = 'http://localhost:3030/data/paws';

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
};

export const useGetOnePaw = (pawId) => {
    const [paw, setPaw] = useState({});

    useEffect(() => {
        request.get(`${baseUrl}/${pawId}`)
            .then(setPaw);
    }, [pawId]);

    return {
        paw,
    };
};

export const useEditPaw = () => {
    const { accessToken } = useContext(UserContext);

    const options = {
        headers: {
            'X-Authorization': accessToken,
        }
    };
    const edit = (pawId, pawData) =>
        request.put(`${baseUrl}/${pawId}`, { ...pawData, _id: pawId }, options);

    return {
        edit,
    }
};

export const useDeletePaw = () => {
    const { accessToken } = useContext(UserContext);

    const options = {
        headers: {
            'X-Authorization': accessToken,
        }
    };
    const remove = (pawId) =>
        request.delete(`${baseUrl}/${pawId}`, {}, options);

    return {
        remove,
    }
};

