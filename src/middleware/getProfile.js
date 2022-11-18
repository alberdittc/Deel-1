const repository = require('../db/repository');

exports.getProfileById = async (req, res, next) => {
    const { profile_id } = req.headers
    try {
        const profile = await repository.getProfileById(profile_id);
        if (!profile) {
            return res.status(401).json('User authentication failed')
        }
        req.profile = profile.dataValues.id
    } catch(e) {
        return res.status(500).json('it could connect to DB')
    }
    next()
}