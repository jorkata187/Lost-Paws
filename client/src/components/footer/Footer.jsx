import {Link} from'react-router'

export default function Footer() {
    return (
        <div className="footer">
            <div className="container">
                <div className="col-md-6 mrg1">
                    <div className="col-md-4 brk4">
                        <div className="about">
                            <h4>ABOUT</h4>
                            <ul>
                                <li><Link href="/about">Company Info</Link></li>
                                <li><Link to="#">Sollution</Link></li>
                                <li><Link to="#">Services</Link></li>
                                <li><Link to="#">Team</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="col-md-4 brk4">
                        <div className="advice">
                            <h4>ADVICE</h4>
                            <ul>
                                <li><Link to="#">Faqs</Link></li>
                                <li><Link to="#">Accounts</Link></li>
                                <li><Link href="#">Contact</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="col-md-4 brk4">
                        <div className="join-in">
                            <h4>JOIN IN</h4>
                            <ul>
                                <li><Link to="#">Forums</Link></li>
                                <li><Link to="#">Promotions</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="clearfix"></div>
                </div>
                <div className="col-md-3 brk5">
                    <div className="follow-us">
                        <h4>FOLLOW US</h4>
                        <ul>
                            <li><Link to="#" className="fb"></Link></li>
                            <li><Link to="#" className="twt"></Link></li>
                            <li><Link to="#" className="gpls"></Link></li>
                            <li><Link to="#" className="pint"></Link></li>
                            <li><Link to="#" className="lnkdin"></Link></li>
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