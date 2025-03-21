import { useNavigate } from "react-router";

import petService from "../../services/pawService";

export default function PawsCreate() {
    const navigate = useNavigate();

    const submitAction = async (formData) => {
        const petData = Object.fromEntries(formData);

        await petService.create(petData);

        navigate('/paws');
    }

    return (
        <section id="create-page" className="auth">
            <form id="create" action={submitAction}>
                <div className="container">

                    <h1>Create Post</h1>
                    <label htmlFor="leg-title">Pet Name:</label>
                    <input type="text" id="title" name="name" placeholder="Your pet name..." />

                    <label htmlFor="category">Breed:</label>
                    <input type="text" id="category" name="breed" placeholder="Breed..." />

                    <label htmlFor="levels">Age:</label>
                    <input type="text" id="maxLevel" name="age" placeholder="Age..." />

                    <label htmlFor="game-img">Image:</label>
                    <input type="text" id="imageUrl" name="imageUrl" placeholder="Upload a photo..." />

                    <label htmlFor="summary">Summary:</label>
                    <textarea name="summary" id="summary"></textarea>
                    <input className="btn submit" type="submit" value="Create Post" />
                </div>
            </form>
        </section>
    );
}