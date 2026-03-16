const router = require('express').Router();

const authMiddleware = require('../../middlewares/auth.middleware');
const checkRole = require('../../middlewares/checkRole.middleware');

router.post('/', authMiddleware, checkRole('seller'), (req, res) => {
	res.send('Seller is here');
});

module.exports = router;
