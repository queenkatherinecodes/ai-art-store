const OpenAI = require('openai');
const config = require('../../config');
process.env.OPENAI_API_KEY = config.OPENAI_API_KEY;

const openai = new OpenAI();

async function generateReview() {
    const messages = [{
        role: 'system',
        content: 'Generate a review for an AI-generated artwork store. The review should include: - A randomly generated name (e.g., "John Doe"). - A randomly generated number of stars out of 5. - A short quote reviewing the AI-generated artwork store. Format the response as a JSON object with "name", "stars", and "quote" fields.',
    }];

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: messages,
            max_tokens: 150,
            temperature: 0.7,
        });

        const reviewText = response.choices[0].message.content.trim();
        const review = JSON.parse(reviewText);

        return review;
    } catch (error) {
        console.error('Error generating review:', error);
        return null;
    }
}

module.exports = { generateReview };