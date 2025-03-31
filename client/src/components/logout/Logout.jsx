import { useContext, useEffect } from "react";
import { Navigate } from "react-router";

import request from "../../utils/request";
import UserContext from "../../contexts/UserContext";

export default function Logout() {
    const { accessToken, userLogoutHandler } = useContext(UserContext);

    useEffect(() => {
        if (!accessToken) {
            return;
        };

        const options = {
            headers: {
                'X-Authorization': accessToken,
            }
        }
        request.get('http://localhost:3030/users/logout', null, options)
            .then(() => {
                userLogoutHandler();
            })
    }, [accessToken, userLogoutHandler]);

    return <Navigate to='/' />
}