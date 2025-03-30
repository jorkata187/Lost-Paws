import { useContext, useActionState } from 'react';
import { Link, useNavigate } from 'react-router';

import UserContext from '../../contexts/UserContext';
import request from '../../utils/request';


export default function Register() {
    const { userLoginHandler } = useContext(UserContext);

    const navigate = useNavigate();

    const registerHandler = async (previousState, formData) => {
        const values = Object.fromEntries(formData);

        const email = values.email;
        const password = values.password;
        const repassword = values.repassword;

        if (password !== repassword) {
            alert('Passwords mismatch!');
            return;
        };

        const userData = await request.post('http://localhost:3030/users/register', { email, password });

        userLoginHandler(userData);

        navigate('/');

        return values;
    };

    const [values, registerAction, isPending] = useActionState(registerHandler, { email: '', password: '' });

    return (
        <section id="register-page" className="content auth">
            <form id="register" action={registerAction}>
                <div className="container">
                    <h1>Register</h1>

                    <label htmlFor="email">Email:</label>
                    <input type="email" id="email" name="email" placeholder="Paws@gmail.com" />

                    <label htmlFor="pass">Password:</label>
                    <input type="password" name="password" id="register-password" />

                    <label htmlFor="con-pass">Confirm Password:</label>
                    <input type="password" name="repassword" id="confirm-password" />

                    <input className="btn submit" type="submit" value="Register" disabled={isPending} />

                    <p className="field">
                        <span>Already have profile click <Link to="/login">here</Link></span>
                    </p>
                </div>
            </form>
        </section>
    );
}