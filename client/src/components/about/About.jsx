export default function About() {
    return (
        <>
    <div className="about-pg">
    <h3>about us</h3>
    <div className="container">
            <div className="col-md-6 lt">
                <div className="choose-us">
                    <h3>why choose us?</h3>
                    <ul>
                        <li className="text-ul">
                            <span className="one"></span>
                            <div className="folt">
                            <h4>Lorem Ipsum is simply dummy text</h4>
                            <p>Lorem Ipsum has been the industry's standard dummy </p>
                            </div>
                            <div className="clearfix"></div>
                        </li>
                        <li className="text-ul">
                            <span className="two"></span>
                            <div className="folt">
                            <h4>Lorem Ipsum is simply dummy text</h4>
                            <p>Lorem Ipsum has been the industry's standard dummy </p>
                            </div>
                            <div className="clearfix"></div>
                        </li>
                        <li className="text-ul">
                            <span className="three"></span>
                            <div className="folt">
                            <h4>Lorem Ipsum is simply dummy text</h4>
                            <p>Lorem Ipsum has been the industry's standard dummy </p>
                            </div>
                            <div className="clearfix"></div>
                        </li>
                    </ul>
                <div className="clear"></div>
                </div>
            </div>
            <div className="col-md-6 lt">
                <div className="few-words">
                    <h3>A few words about us.</h3>
                        <div className="few-text">
                            <img src="./images/gift.jpg" alt="" title="" className="img-responsive" />
                            <div className="flt">
                            <h4>Lorem Ipsum is simply dummy text</h4>
                            <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Aldus PageMaker including versions of Lorem Ipsum.</p>
                            </div>
                            <div className="clearfix"></div>
                        </div>
                    <p><a href="#" className="btn btn-danger" role="button">More</a> </p>
                </div>
            </div>
        <div className="clearfix"></div>
    </div>
</div>
<div className="test-our">
    <div className="container">
        <div className="col-md-4 lt">
            <div className="testmonials">
                <h3>testimonials</h3>
                    <div className="box">
                        <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. </p>
                    </div>
                <div className="links">
                <p>john doe</p>
                <a href="#">http://demolink.org</a>
                </div>
                    <div className="box">
                        <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. </p>
                    </div>
                <div className="links">
                <p>john doe</p>
                <a href="#">http://demolink.org</a>
                </div>
            </div>
        </div>
        <div className="col-md-8 lt">
            <div className="our-team">
                <h3>our team</h3>
                <div className="col-md-3 txt">
                    <img src="./images/entrepreneur.jpg" alt="" title="" className="img-responsive" />
                        <h4>Robert jhonson</h4>
                    <p>Lorem Ipsum is simply dummy text printing.</p>
                </div>
                <div className="col-md-3 txt">
                    <img src="./images/man.jpg" alt="" title="" className="img-responsive" />
                        <h4>Bear grylls</h4>
                    <p>Lorem Ipsum is simply dummy text printing.</p>
                </div>
                <div className="col-md-3 txt">
                    <img src="./images/people.jpg" alt="" title="" className="img-responsive" />
                        <h4>john doe</h4>
                    <p>Lorem Ipsum is simply dummy text printing.</p>
                </div>
                <div className="col-md-3 txt">
                    <img src="./images/portrait.jpg" alt="" title="" className="img-responsive" />
                          <h4>Ema stone</h4>
                    <p>Lorem Ipsum is simply dummy text printing.</p>
                </div>
                <div className="clearfix"></div>
            </div>
        </div>
        <div className="clearfix"></div>
    </div>    
</div>
</>
    );
}