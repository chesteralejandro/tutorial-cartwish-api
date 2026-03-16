const router = require('express').Router();

const authMiddleware = require('../../middlewares/auth.middleware');
const checkSeller = require('../../middlewares/checkSeller.middleware');

router.post('/', authMiddleware, checkSeller, (req, res) => {
	res.send('Seller is here');
});

module.exports = router;
