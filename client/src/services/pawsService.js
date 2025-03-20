const baseUrl = 'http://localhost:3030/data/paws';

export default {
    async create(petData) {
        const response = await fetch(baseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(petData),
        });

        const result = await response.json();

        return result;
    }
};