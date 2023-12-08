const axios = require('axios');
const User = require('../model/user');
const jwt = require('jsonwebtoken');

module.exports = {
  // extraire le token de l'utilisateur
  extractUserInfo: async (req, res, next) => {
    try {
      const authorizationHeader = req.headers.authorization;


      if (!authorizationHeader) {
        return res.status(401).json({ message: 'Token manquant dans le HEADER, veuillez vous connecter' });
      }

      // on supprime le bearer une chaîne de caractères vide pour obtenir que le token
      const token = authorizationHeader.replace('Bearer ', '');


      decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Vérifier l'expiration du token
      const currentTimestamp = Math.floor(Date.now() / 1000);
      if (decoded.exp && decoded.exp < currentTimestamp) {
        return res.status(401).json({ message: 'Token expiré' });
      }

      // Ajouter les informations décodées à l'objet request
      req.decoded = decoded;

      next();
    } catch (error) {
      console.error("Erreur lors de la vérification du token :", error);
      return res.status(401).json({ message: 'Token invalide' });
    }
  },

  getRecipes: async (req, res) => {
    try {
      const { userId } = req.decoded;
  
      // Trouver l'utilisateur
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).json({ message: 'Utilisateur introuvable' });
      }
  
      // Récupérer la liste d'ingrédients de l'utilisateur
      const ingredients = user.ingredients.join(',');
  
      // Construire l'URL de la requête à l'API Edaman
      const apiUrl = `https://api.edamam.com/api/recipes/v2?app_id=${process.env.API_ID}&app_key=${process.env.API_KEY}&type=public&q=${ingredients}`;
  
      // Effectuer la requête à l'API Edaman
      const response = await axios.get(apiUrl);
  
      // Limiter le nombre de recettes à 20
      const maxRecipes = 20;
      const recipes = response.data.hits.slice(0, maxRecipes).map((hit) => ({
        recipeUrl: hit.recipe.url,
        thumbnail: hit.recipe.image,
      }));
  
      res.status(200).json({ recipes });
    } catch (error) {
      console.error(new Date().toISOString(), 'controllers/recipes-controllers.js > getRecipes > error ', error);
      return res.status(500).json({ message: 'Erreur lors de la récupération des recettes', error });
    }
  },
  
};
