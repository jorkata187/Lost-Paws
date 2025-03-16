export default function Home() {
    return (
        <>
            <div className="banner-background">
                <div className="container">
                    <div className="banner-slider">
                        <div id="myCarousel" className="carousel slide" data-ride="carousel">
                            {/* <!-- Indicators --> */}
                            <ol className="carousel-indicators">
                                <li data-target="#myCarousel" data-slide-to="0" className="active"></li>
                                <li data-target="#myCarousel" data-slide-to="1"></li>
                                <li data-target="#myCarousel" data-slide-to="2"></li>
                            </ol>
                            {/* <!-- Wrapper for slides --> */}
                            <div className="carousel-inner" role="listbox">
                                <div className="item active">
                                    <img src="/images/1.jpg" alt="dog" className="img-responsive" />
                                    <div className="carousel-caption ch">
                                        <h3>Lorem ipsum dolor adipiscing elit. </h3>
                                        <p>Suspendisse ut ante eget ex maximus malesuada tincidunt eu ex.</p>
                                    </div>
                                </div>
                                <div className="item">
                                    <img src="/images/4.jpg" alt="cat" className="img-responsive" />
                                    <div className="carousel-caption ch">
                                        <h3>Praesent sit amet consequat ante.</h3>
                                        <p>Suspendisse ut ante eget ex maximus malesuada tincidunt eu ex.</p>
                                    </div>
                                </div>
                                <div className="item">
                                    <img src="/images/2.jpg" alt="wolfdog" className="img-responsive" />
                                    <div className="carousel-caption ch">
                                        <h3>Sed at ligula sed nibh rutrum pretium </h3>
                                        <p>Suspendisse ut ante eget ex maximus malesuada tincidunt eu ex.</p>
                                    </div>
                                </div>
                            </div>
                            {/* <!-- Controls --> */}
                            <a className="carousel-control left" href="#myCarousel" role="button" data-slide="prev">
                                <span className="glyphicon glyphicon-chevron-left" aria-hidden="true"></span>
                                <span className="sr-only">Previous</span>
                            </a>
                            <a className="carousel-control right" href="#myCarousel" role="button" data-slide="next">
                                <span className="glyphicon glyphicon-chevron-right" aria-hidden="true"></span>
                                <span className="sr-only">Next</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            {/* <!--header-ends--> */}

            {/* <!--content--> */}
            <div className="our-products">
                <div className="container">
                    <div className="products-gallery">
                        <h2>OUR-PRODUCTS</h2>
                        <div className="col-md-3 arr">
                            <div className="bg">
                                <img src="/images/b.jpg" alt="pet" className="img-responsive" />
                                <span className="glyphicon glyphicon-heart pst" aria-hidden="true"></span>
                                <div className="caption">
                                    <h3>Muffin Cat</h3>
                                    <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. </p>
                                    <p><a href="#" className="btn btn-danger" role="button">More</a></p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3 arr">
                            <div className="bg">
                                <img src="/images/c.jpg" alt="pet" className="img-responsive" />
                                <span className="glyphicon glyphicon-heart pst" aria-hidden="true"></span>
                                <div className="caption">
                                    <h3>Doggy</h3>
                                    <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. </p>
                                    <p><a href="#" className="btn btn-danger" role="button">More</a> </p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3 arr">
                            <div className="bg">
                                <img src="/images/d.jpg" alt="pet" className="img-responsive" />
                                <span className="glyphicon glyphicon-heart pst" aria-hidden="true"></span>
                                <div className="caption">
                                    <h3>Hamster</h3>
                                    <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. </p>
                                    <p><a href="#" className="btn btn-danger" role="button">More</a></p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3 arr">
                            <div className="bg">
                                <img src="/images/e.jpg" alt="pet" className="img-responsive" />
                                <span className="glyphicon glyphicon-heart pst" aria-hidden="true"></span>
                                <div className="caption">
                                    <h3>Lab Doggy</h3>
                                    <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. </p>
                                    <p><a href="#" className="btn btn-danger" role="button">More</a></p>
                                </div>
                            </div>
                        </div>
                        <div className="clearfix"></div>
                    </div>
                </div>
            </div>
            {/* <!--content-ends--> */}
            {/* <!--brand-logos--> */}
            <div className="brand-logo">
                <div className="container">
                    <div className="col-xs-6 col-md-3 brk3">
                        <a href=""><img src="/images/bd1.png" alt="" className="img-responsive" /></a>
                    </div>
                    <div className="col-xs-6 col-md-3 brk3">
                        <a href=""><img src="/images/bd2.png" alt="" className="img-responsive" /></a>
                    </div>
                    <div className="col-xs-6 col-md-3 brk3">
                        <a href=""><img src="/images/bd3.png" alt="" className="img-responsive" /></a>
                    </div>
                    <div className="col-xs-6 col-md-3 brk3">
                        <a href=""><img src="/images/bd4.png" alt="" className="img-responsive" /></a>
                    </div>
                    <div className="clearfix"></div>
                </div>
            </div>
            {/* <!--brand-ends--> */}
        </>
    );
}