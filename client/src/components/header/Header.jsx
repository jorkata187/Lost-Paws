import { Link } from 'react-router'

export default function Header() {
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
                                            <li><Link to="/paws">Action</Link></li>
                                            <li><Link to="#">Another action</Link></li>
                                            <li><Link to="#">Something else here</Link></li>
                                        </ul>
                                    </li>
                                    <li><Link to="/paws/create">CREATE POST</Link></li>
                                    <li><Link to="/login">LOGIN</Link></li>
                                    <li><Link to="/register">REGISTER</Link></li>
                                    <li><Link to="/logout">LOGOUT</Link></li>
                                </ul>
                            </div>
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