import { Link, useNavigate, useParams } from "react-router";
import { useContext } from "react";

import { useDeletePaw, useGetOnePaw } from "../../api/pawApi";
import UserContext from "../../contexts/UserContext";

export default function PawsDetails() {
    const navigate = useNavigate();
    const { pawId } = useParams();
    const { paw } = useGetOnePaw(pawId);
    const { remove } = useDeletePaw();
    const { _id: userId } = useContext(UserContext);

    const isOwner = userId === paw._ownerId;

    const onDelete = async () => {
        const hasConfirm = confirm(`Are you sure want to delete ${paw.name}`);

        if (!hasConfirm) {
            return;
        }
        await remove(pawId);

        navigate('/paws');
    };

    return (
        <section id="game-details">
            <h1>Pet Details</h1>
            <div className="info-section">

                <div className="game-header">
                    <img className="game-img" src={paw.imageUrl} />
                    <h1>{paw.name}</h1>
                    <span className="levels">Age: {paw.age} years old</span>
                    <p className="type">Breed: {paw.breed}</p>
                </div>

                <p className="text">{paw.summary}</p>

                {/* <!-- Edit/Delete buttons ( Only for creator of this post )  --> */}
                {isOwner && (
                    <div className="buttons">
                        <Link to={`/paws/${pawId}/edit`} className="button">Edit</Link>
                        <button
                            onClick={onDelete}
                            className="button"
                        >
                            Delete
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
}