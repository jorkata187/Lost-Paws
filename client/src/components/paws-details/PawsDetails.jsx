import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";

import pawService from "../../services/pawService";

export default function PawsDetails() {
    const navigate = useNavigate();
    const [paw, setPaw] = useState({});
    const { pawId } = useParams();

    useEffect(() => {
        pawService.getOne(pawId)
            .then(setPaw)
    }, [pawId]);

    const onDelete = async () => {
        const hasConfirm = confirm(`Are you sure want to delete ${paw.name}`);

        if (!hasConfirm) {
            return;
        }
        await pawService.delete(pawId);
        
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
                <div className="buttons">
                    <Link to={`/paws/${pawId}/edit`} className="button">Edit</Link>
                    <button 
                    onClick={onDelete}
                    className="button"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </section>
    );
}