import { createContext } from "react";

const UserContext = createContext({
    _id: '',
    email: '',
    accessToken: '',
    userLoginHandler() {},
});

export default UserContext;