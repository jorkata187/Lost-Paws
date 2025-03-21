import { Link } from "react-router";

export default function PawsDetails() {
   return (
    <section id="game-details">
    <h1>Pet Details</h1>
    <div className="info-section">

        <div className="game-header">
            <img className="game-img" src="" />
            <h1>pet</h1>
            <span className="levels">pet</span>
            <p className="type">pet</p>
        </div>

        <p className="text">pet</p>

        {/* <!-- Edit/Delete buttons ( Only for creator of this post )  --> */}
        <div className="buttons">
            <Link to="/posts/edit" className="button">Edit</Link>
            <Link className="button">
                Delete
            </Link>
        </div>
    </div>
</section>
    );
}