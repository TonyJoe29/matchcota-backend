const router = require('express').Router();
const petsController = require('../controllers/pets.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const {
  createPetValidator,
  updatePetValidator,
  listPetsValidator
} = require('../validators/pet.validator');

router.post('/', authMiddleware, createPetValidator, validate, petsController.createPet);
router.get('/', listPetsValidator, validate, petsController.listPets);
router.get('/my', authMiddleware, petsController.myPets);
router.get('/:id', petsController.getPet);
router.put('/:id', authMiddleware, updatePetValidator, validate, petsController.updatePet);
router.delete('/:id', authMiddleware, petsController.deletePet);

module.exports = router;
