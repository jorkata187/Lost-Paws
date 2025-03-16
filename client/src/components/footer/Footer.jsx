export default function Footer() {
    return (
        <div className="footer">
            <div className="container">
                <div className="col-md-6 mrg1">
                    <div className="col-md-4 brk4">
                        <div className="about">
                            <h4>ABOUT</h4>
                            <ul>
                                <li><a href="about.html">Company Info</a></li>
                                <li><a href="#">Sollution</a></li>
                                <li><a href="services.html">Services</a></li>
                                <li><a href="about.html">Team</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="col-md-4 brk4">
                        <div className="advice">
                            <h4>ADVICE</h4>
                            <ul>
                                <li><a href="#">Faqs</a></li>
                                <li><a href="#">Accounts</a></li>
                                <li><a href="contact.html">Contact</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="col-md-4 brk4">
                        <div className="join-in">
                            <h4>JOIN IN</h4>
                            <ul>
                                <li><a href="#">Forums</a></li>
                                <li><a href="#">Promotions</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="clearfix"></div>
                </div>
                <div className="col-md-3 brk5">
                    <div className="follow-us">
                        <h4>FOLLOW US</h4>
                        <ul>
                            <li><a href="#" className="fb"></a></li>
                            <li><a href="#" className="twt"></a></li>
                            <li><a href="#" className="gpls"></a></li>
                            <li><a href="#" className="pint"></a></li>
                            <li><a href="#" className="lnkdin"></a></li>
                        </ul>
                    </div>
                </div>
                <div className="col-md-3 brk5">
                    <div className="copy-rt">
                        <h4>COPYRIGHT</h4>
                        <p>Lost Paws Design by George Donchev</p>
                    </div>
                </div>
                <div className="clearfix"></div>
            </div>
        </div>
    );
}