const userModel = require('../models/user.model');

const getProfile = async (req, res) => {
  res.json({ user: req.user });
};

const updateProfile = async (req, res, next) => {
  try {
    const vivienda = req.body.vivienda || {};
    const estiloVida = req.body.estilo_vida || {};
    const entorno = req.body.entorno_y_experiencia || {};

    const user = await userModel.updateProfile(req.user.id, {
      name: req.body.name || req.body.nombre,
      birth_date: req.body.birth_date || req.body.fecha_nacimiento,
      location: req.body.location || req.body.ubicacion,
      profile_photo_url: req.body.profile_photo_url || req.body.foto_perfil,
      occupation: req.body.occupation || req.body.ocupacion,
      housing_type: req.body.housing_type || vivienda.tipo_vivienda,
      available_space_type: req.body.available_space_type || vivienda.tipo_espacio_disponible,
      available_space_m2: req.body.available_space_m2 || vivienda.espacio_disponible_m2,
      daily_available_hours:
        req.body.daily_available_hours || estiloVida.tiempo_disponible_horas_dia,
      monthly_income_mxn: req.body.monthly_income_mxn || estiloVida.ingreso_mensual_mxn,
      pet_experience:
        req.body.pet_experience || entorno.experiencia_previa_mascotas,
      current_pets: req.body.current_pets || entorno.mascotas_actuales,
      has_children_under_12:
        req.body.has_children_under_12 ?? entorno.hijos_menores_12_anios
    });

    res.json({
      message: 'Perfil actualizado correctamente.',
      user
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile
};
