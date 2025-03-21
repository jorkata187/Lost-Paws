import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

import pawService from "../../services/pawService";

export default function PawsEdit() {
    const navigate = useNavigate();
    const { pawId } = useParams();
    const [paw, setPaw] = useState({});

    useEffect(() => {
        pawService.getOne(pawId)
            .then(setPaw);
    }, [pawId]);

    const formAction = async (formData) => {
        const pawData = Object.fromEntries(formData);

        await pawService.edit(pawId, pawData);

        navigate(`/paws/${pawId}/details`);
    }

    return (
        <section id="edit-page" className="auth">
            <form id="edit" action={formAction}>
                <div className="container">

                    <h1>Edit Post</h1>
                    <label htmlFor="leg-title">Pet Name:</label>
                    <input type="text" id="title" name="name" defaultValue={paw.name}/>

                    <label htmlFor="category">Breed:</label>
                    <input type="text" id="category" name="breed" defaultValue={paw.breed}/>

                    <label htmlFor="levels">Age:</label>
                    <input type="text" id="maxLevel" name="age" defaultValue={paw.age}/>

                    <label htmlFor="game-img">Image:</label>
                    <input type="text" id="imageUrl" name="imageUrl" defaultValue={paw.imageUrl}/>

                    <label htmlFor="summary">Summary:</label>
                    <textarea name="summary" id="summary" defaultValue={paw.summary}></textarea>
                    <input className="btn submit" type="submit" value="Edit Post" />

                </div>
            </form>
        </section>
    );
}