import { Link } from "react-router";

export default function PawListItem({
    _id,
    name,
    breed,
    age,
    imageUrl,
}) {
    return (
        <div className="col-md-3 arr">
            <div className="bg">
                <img src={imageUrl} />
                <span className="glyphicon glyphicon-heart pst" aria-hidden="true"></span>
                <div className="caption">
                    <h3>{name}</h3>
                    <p>Age: {age} years old</p>
                    <p>Breed: {breed}</p>
                    <p><Link to="/paws/{_id}/details" className="btn btn-danger" role="button">Details</Link></p>
                </div>
            </div>
        </div>
    );
}