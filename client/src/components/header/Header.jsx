import { useContext } from 'react';
import { Link } from 'react-router';

import UserContext from '../../contexts/UserContext';

export default function Header() {
    const { email } = useContext(UserContext);

    return (
        <div className="banner-background">
            <div className="container">
                <div className="nav-back">
                    <div className="navigation">
                        <nav className="navbar navbar-default">
                            <div className="navbar-header">
                                <button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1" aria-expanded="false">
                                    <span className="sr-only">Toggle navigation</span>
                                    <span className="icon-bar"></span>
                                    <span className="icon-bar"></span>
                                    <span className="icon-bar"></span>
                                </button>
                            </div>
                            <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
                                <ul className="nav navbar-nav">
                                    <li><Link to="/">HOME <span className="sr-only">(current)</span></Link></li>
                                    <li><Link to="/about">ABOUT</Link></li>
                                    <li className="dropdown">
                                        <Link to="#" className="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">PAWS<span className="caret"></span></Link>
                                        <ul className="dropdown-menu">
                                            <li><Link to="/paws">All Paws</Link></li>
                                            <li><Link to="#">Another action</Link></li>
                                            <li><Link to="#">Something else here</Link></li>
                                        </ul>
                                    </li>
                                    { email && (
                                        <li><Link to="/paws/create">CREATE POST</Link></li>   
                                    )}
                                    { email && (
                                        <li><Link to="/logout">LOGOUT</Link></li>
                                    )}
                                    { !email && (
                                        <li><Link to="/login">LOGIN</Link></li>
                                    )}
                                    { !email && (
                                        <li><Link to="/register">REGISTER</Link></li>
                                    )}
                                </ul>
                            </div>
                                <h2>{email}</h2>
                            <div className="clearfix"></div>
                            <div className="clearfix"></div>
                        </nav>
                        <div className="clearfix"></div>
                    </div>
                    <div className="logo">
                        <h1><Link to="/">LOST<span className="hlf"> PAWS</span></Link></h1>
                    </div>
                </div>
            </div>
        </div>
    );
}