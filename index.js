const app = require('./src/app');
const config = require('./src/config');
const persistenceService = require('./src/services/persistenceService/persist');
const PORT = config.PORT || 3000;

async function startServer() {
    await persistenceService.initializeUsers();

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

startServer().catch(console.error);