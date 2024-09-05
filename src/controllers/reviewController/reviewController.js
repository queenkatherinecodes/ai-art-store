const reviewGenerationService = require('../../services/reviewGenerationService/reviewGenerationService');

exports.getReview = async (req, res) => {
    try {
        const review = await reviewGenerationService.generateReview();
        res.json(review);
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate review' });
    }
};