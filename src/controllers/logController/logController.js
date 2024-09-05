const persistenceService = require('../../services/persistenceService/persist');

exports.log = async(req, res) => {
    const {user, activity } = req.body;
    if (!user || !activity) {
        return res.status(400).json({ message: 'User and activity are required.' });
    }
    const log = await persistenceService.logActivity(user, activity);
    if (log) {
        return res.status(200).json({message: 'Success logging activity'});
    }
}