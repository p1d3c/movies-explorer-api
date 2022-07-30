const router = require('express').Router();
const { getMyProfile, updateUserProfile } = require('../controllers/users');
const { validateUpdateUser } = require('../utils/validations');

router.get('/me', getMyProfile);
router.patch('/me', validateUpdateUser, updateUserProfile);

module.exports = router;
