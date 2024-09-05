module.exports = {
    PORT: process.env.PORT || 3000,
    SESSION_EXPIRY: 30 * 60 * 1000, // 30 minutes in milliseconds
    REMEMBER_ME_EXPIRY: 10 * 24 * 60 * 60 * 1000, // 10 days in milliseconds
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
};