import { createContext } from "react";

const UserContext = createContext({
    email: '',
    userLoginHandler() {},
});

export default UserContext;