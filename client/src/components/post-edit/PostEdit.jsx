export default function PostEdit() {
    return (
        <section id="edit-page" className="auth">
            <form id="edit">
                <div className="container">

                    <h1>Edit Post</h1>
                    <label htmlFor="leg-title">Pet Name:</label>
                    <input type="text" id="title" name="title" />

                    <label htmlFor="category">Breed:</label>
                    <input type="text" id="category" name="category" />

                    <label htmlFor="levels">Age:</label>
                    <input type="text" id="maxLevel" name="maxLevel" />

                    <label htmlFor="game-img">Image:</label>
                    <input type="text" id="imageUrl" name="imageUrl" />

                    <label htmlFor="summary">Summary:</label>
                    <textarea name="summary" id="summary" ></textarea>
                    <input className="btn submit" type="submit" value="Edit Post" />

                </div>
            </form>
        </section>
    );
}