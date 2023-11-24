const express = require('express')

const {
    checkAuthPayload , 
    checkEmailPayload , 
    checkPasswordPayload,
    signupResponse,
    signinResponse,
    recoveryResponse,
    newPasswordResponse,
    extractUserInfo,
    AddIngredient,
    DeleteAllIngredient,
    DeleteIngredientbyid,
    GetIngredient

} = require('../controllers/admin-controllers')

exports.router = (() => {
    const router = express.Router()
    // ---------------------------------------------------------------Inscription
    router
    .route('/signup/')
    .post(
        checkAuthPayload,
        checkEmailPayload,
        checkPasswordPayload,
        signupResponse,
    )

    // ----------------------------------------------------------------Login
    router
    .route('/signin/')
    .post(
        checkAuthPayload,
        checkEmailPayload,
        signinResponse,
    )


    // ----------------------------------------------------------------Recovery
    router
    .route('/recovery-password/')
    .post(
        checkEmailPayload,
        recoveryResponse,
    )

    // ----------------------------------------------------------------Response
    router
   
    .route ('/new-password/:slug')
    .post(
        newPasswordResponse,
    )
    // ----------------------------------------------------------------Ingredients
    router
    .route('/ingredients')  // Utilisé pour ajouter des ingrédients
    .post(
        extractUserInfo,
        AddIngredient
    );
  
  router
    .route('/ingredients')  // Utilisé pour obtenir tous les ingrédients
    .get(
        extractUserInfo,
        GetIngredient,
    );
  
  router
    .route('/ingredients/:index')  // Utilisé pour supprimer un ingrédient par index
    .delete(
        extractUserInfo,
        DeleteIngredientbyid,
    );
  
  router
    .route('/ingredients')  // Utilisé pour supprimer tous les ingrédients
    .delete(
        extractUserInfo,
        DeleteAllIngredient,
    );
    
    return router
    
})()