import { Link } from 'react-router';

export default function Register() {
    return (
        <section id="register-page" className="content auth">
            <form id="register">
                <div className="container">
                    <h1>Register</h1>

                    <label htmlFor="email">Email:</label>
                    <input type="email" id="email" name="email" placeholder="Paws@gmail.com" />

                    <label htmlFor="pass">Password:</label>
                    <input type="password" name="password" id="register-password" />

                    <label htmlFor="con-pass">Confirm Password:</label>
                    <input type="password" name="repassword" id="confirm-password" />

                    <input className="btn submit" type="submit" value="Register" />

                    <p className="field">
                        <span>Already have profile click <Link href="/login">here</Link></span>
                    </p>
                </div>
            </form>
        </section>
    );
}