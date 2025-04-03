import { Link } from "react-router";

export default function ErrorPage() {
   return (
<>
    <div className="four-four">
        <div className="container">
            <h3>40<span className="hlf">4</span></h3>
            <p>Page not found.....!</p>
            <p><Link to="/" className="btn btn-danger" role="button">Back To Home</Link></p>
        </div>	
    </div>
</>
    );
}