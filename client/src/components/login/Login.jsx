import { useContext, useActionState } from 'react';
import { Link, useNavigate } from 'react-router';

import UserContext from '../../contexts/UserContext';
import request from '../../utils/request';

export default function Login() {
    const { userLoginHandler } = useContext(UserContext);

    const navigate = useNavigate();

    const loginHandler = async (previousState, formData) => {
        const values = Object.fromEntries(formData);

        const email = values.email;
        const password = values.password;

        if (!email || !password) {
            return alert('Email and password are required!')
        };

        const userData = await request.post('http://localhost:3030/users/login', { email, password });

        if (!userData) {
            return alert('Email or password is incorrect!');
        }
        userLoginHandler(userData);
        navigate('/');
        return values;
    };

    const [values, loginAction, isPending] = useActionState(loginHandler, { email: '', password: '' });

    return (
        <section id="login-page" className="auth">
            <form id="login" action={loginAction}>

                <div className="container">
                    <h1>Login</h1>
                    <label htmlFor="email">Email:</label>
                    <input type="email" id="email" name="email" placeholder="Paws@gmail.com" />

                    <label htmlFor="login-pass">Password:</label>
                    <input type="password" id="login-password" name="password" />
                    <input type="submit" className="btn submit" value="Login" disabled={isPending} />
                    <p className="field">
                        <span>Don't have profile click <Link to="/register">here</Link></span>
                    </p>
                </div>
            </form>
        </section>
    );
}