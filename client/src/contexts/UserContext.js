import { createContext } from "react";

const UserContext = createContext({
    _id: '',
    email: '',
    accessToken: '',
    userLoginHandler() {},
    userLogoutHandler() {},
});

export default UserContext;