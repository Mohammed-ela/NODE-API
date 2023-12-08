const express = require('express');
const { extractUserInfo,getRecipes } = require('../controllers/recipes-controllers');

exports.router = (() => {
const router = express.Router();

router
  .route('/receipes')
  .get(
    extractUserInfo,
    getRecipes
  );

  return router;

})()