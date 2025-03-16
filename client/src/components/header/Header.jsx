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
                                    <li><a href="index.html">HOME <span className="sr-only">(current)</span></a></li>
                                    <li><a href="about.html">ABOUT</a></li>
                                    <li className="dropdown">
                                        <a href="gallery.html" className="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">GALLERY<span className="caret"></span></a>
                                        <ul className="dropdown-menu">
                                            <li><a href="gallery.html">Action</a></li>
                                            <li><a href="gallery.html">Another action</a></li>
                                            <li><a href="gallery.html">Something else here</a></li>
                                        </ul>
                                    </li>
                                    <li><a href="pages.html">PAGES</a></li>
                                    <li><a href="404.html " className="active">BLOG</a></li>
                                    <li><a href="contact.html">CONTACT</a></li>
                                </ul>
                            </div>
                            <div className="clearfix"></div>
                            <div className="clearfix"></div>
                        </nav>
                        <div className="clearfix"></div>
                    </div>
                    <div className="logo">
                        <h1><a href="index.html">PET<span className="hlf"> KENNEL</span></a></h1>
                    </div>
                </div>
            </div>
        </div>
    );
}