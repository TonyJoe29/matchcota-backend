const router = require('express').Router();
const catalogsController = require('../controllers/catalogs.controller');

router.get('/:catalog', catalogsController.getCatalogByName);

module.exports = router;
