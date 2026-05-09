const { getCatalog } = require('../models/catalog.model');

const getCatalogByName = async (req, res, next) => {
  try {
    const data = await getCatalog(req.params.catalog);
    res.json({ data });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCatalogByName
};
