export default function PostCreate() {
    return (
        <section id="create-page" className="auth">
            <form id="create">
                <div className="container">

                    <h1>Create Post</h1>
                    <label htmlFor="leg-title">Pet Name:</label>
                    <input type="text" id="title" name="title" placeholder="Your pet name..." />

                    <label htmlFor="category">Breed:</label>
                    <input type="text" id="category" name="category" placeholder="Breed..." />

                    <label htmlFor="levels">Age:</label>
                    <input type="text" id="maxLevel" name="maxLevel" placeholder="Age..." />

                    <label htmlFor="game-img">Image:</label>
                    <input type="text" id="imageUrl" name="imageUrl" placeholder="Upload a photo..." />

                    <label htmlFor="summary">Summary:</label>
                    <textarea name="summary" id="summary"></textarea>
                    <input className="btn submit" type="submit" value="Create Game" />
                </div>
            </form>
        </section>
    );
}