# API Ingredient

API Ingredient est un service qui permet aux utilisateurs de gérer leur liste d'ingrédients et de recevoir des recommandations de recettes basées sur ces ingrédients.

## Table des matières

- [Introduction](#introduction)
- [Fonctionnalités](#fonctionnalités)
- [Technologies utilisées](#technologies-utilisées)
- [Installation](#installation)
- [Configuration](#configuration)
- [Utilisation](#utilisation)
- [Exemples d'API](#exemples-dapi)
- [Contributions](#contributions)
- [Licence](#licence)

## Introduction

L'API Ingredient offre un moyen simple et sécurisé pour les utilisateurs de gérer leur liste d'ingrédients, d'ajouter de nouveaux ingrédients, de supprimer des ingrédients, et de recevoir des recommandations de recettes en fonction de leur liste d'ingrédients.

## Fonctionnalités

- **Inscription et Connexion :** Les utilisateurs peuvent s'inscrire et se connecter en utilisant leur adresse e-mail et un mot de passe sécurisé.

- **Gestion des Ingrédients :** Les utilisateurs peuvent ajouter, supprimer, afficher tous les ingrédients et supprimer tous les ingrédients de leur liste.

- **Recommandations de Recettes :** Les utilisateurs peuvent obtenir des recommandations de recettes basées sur leur liste d'ingrédients.

## Technologies utilisées

- Node.js
- Express.js
- MongoDB
- JWT (JSON Web Token) pour l'authentification
- Axios pour les requêtes HTTP
- Nodemailer pour l'envoi d'e-mails
- ...

## Installation

1. Clonez ce dépôt sur votre machine locale.
2. Exécutez `npm install` pour installer les dépendances.

## Configuration

1. Créez un fichier `.env` à la racine du projet et configurez les variables d'environnement nécessaires (base de données, clés API, etc.).

2. Assurez-vous d'avoir une instance MongoDB en cours d'exécution et accessible.

## Utilisation

1. Exécutez `npm start` pour démarrer le serveur.

2. Accédez à l'API à l'adresse `http://localhost:3000` (ou le port que vous avez configuré).

## Exemples d'API

- **Inscription :**
  --http
  POST /signup/
  Content-Type: application/json

  {
    "email": "utilisateur@example.com",
    "password": "MotDePasse123"
  }

- **Ajout d'ingrédient :**


  --http

POST /ingredients
Authorization: Bearer <votre_token>
Content-Type: application/json

{
  "ingredient": "Tomate"
}
- **Recommandations de Recettes :**


  --http

GET /recipes
Authorization: Bearer <votre_token>