const router = require('express').Router();
const { getMyProfile, updateUserProfile } = require('../controllers/users');

router.get('/me', getMyProfile);
router.patch('/me', updateUserProfile);

module.exports = router;
