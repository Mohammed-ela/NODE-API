const User = require('../model/user');
const RecoveryPassword = require('../model/recovery');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');
// import { MailtrapClient } from "mailtrap"
const mailPattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const passwordPattern = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;
let decoded;

module.exports = {
    checkAuthPayload: (req, res, next) => {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Les données sont manquante' });
        }

        req.email = email;
        req.password = password;
        next();
    },

    checkEmailPayload: (req, res, next) => {
        const { email } = req.body;
        if (!mailPattern.test(email)) {
            return res.status(400).json({ message: 'Format d\'e-mail invalide' });
        }

        next();
    },

    checkPasswordPayload: (req, res, next) => {
        const { password } = req;

        if (!passwordPattern.test(password)) {
            const errors = [];

            if (!/(?=.*?[A-Z])/.test(password)) {
                errors.push("Le mot de passe doit contenir au moins une lettre majuscule.");
            }
            if (!/(?=.*?[a-z])/.test(password)) {
                errors.push("Le mot de passe doit contenir au moins une lettre minuscule.");
            }
            if (!/(?=.*?[0-9])/.test(password)) {
                errors.push("Le mot de passe doit contenir au moins un chiffre.");
            }
            if (!/(?=.*?[#?!@$%^&*-])/.test(password)) {
                errors.push("Le mot de passe doit contenir au moins un caractère spécial.");
            }
            if (password.length < 8) {
                errors.push("Le mot de passe doit avoir au moins 8 caractères.");
            }

            return res.status(400).json({ message: "Votre mot de passe n'est pas conforme", errors });
        }

        next();
    },
    //-----------------------------------------------------------L'inscription ------------------------------------------------------------

    signupResponse: async (req, res) => {
        try {
            const { email, password } = req;
    
            // Vérifie si l'utilisateur existe déjà
            const existingUser = await User.findOne({ email });
            // si il trouve l'email en bdd
            if (existingUser) {
                return res.status(400).json({ message: 'Email existante veuillez vous connecter '});
            }
    
            // Si l'utilisateur n'existe pas, enregistre le nouvel utilisateur
            const newUser = new User({
                email,
                ingredients: [],
            });
    
            newUser.setPassword(password);
    
            const savedUser = await newUser.save();
    
            if (!savedUser) {
                return res.status(500).json({ message: "Erreur lors de l'enregistrement de l'utilisateur."});
            }
    

            res.status(201).json({ message: 'Utilisateur enregistré avec succès.'});
        } catch (error) {
            let status = 500;
            let message = 'Erreur inattendue.';
            if (error.message === 'Utilisateur déjà existant.') status = 400;
    
            console.error(new Date().toISOString(), 'controllers/admin-controllers.js > signupResponse > error ', error);
    
            return res.status(status).json({ message });
        }
    },

    //----------------------------------------------------------- LE LOGIN ------------------------------------------------------------
    signinResponse: async (req, res) => {
        //req sont les données du POST
        const { email, password } = req;

        try {       
            // Trouver l'utilisateur correspondant à l'e-mail
            const existingUser = await User.findOne({ email });

            if (!existingUser) {
                return res.status(401).json({ message: 'Adresse e-mail ou mot de passe incorrect' });
            }

            // Vérifier si le mot de passe est valide en fonction du mail qu'on a dans existingUser et du mdp qu'on hash
            const isPasswordValid = existingUser.passwordIsValid(password);
           // si mdp est pas valide avec le mail
            if (!isPasswordValid) {
                return res.status(401).json({ message: 'Adresse e-mail ou mot de passe incorrect' });
            }

            // je genere un token qui comprend l'ID utilisateur , le JWT en .env , et le temps d'expiration
            const token = jwt.sign({ userId: existingUser._id }, process.env.JWT_SECRET, { expiresIn: '24h' });

            res.status(200).json({ message: 'Connexion réussie', token });

        } catch (error) {
            console.error(new Date().toISOString(), 'controllers/admin-controllers.js > signinResponse > error ', error);
            return res.status(500).json({ message: 'Erreur lors de la connexion' });
        }
    },

    //----------------------------------------------------------- RECOVERY (envois mail) ------------------------------------------------------------
    recoveryResponse: async (req, res) => {
        try {
            const { email } = req.body;
            if (!email) {
                return res.status(400).json({ message: 'Veuillez saisir une adresse e-mail' });
            }

            // Vérifier si l'utilisateur existe
            const existingUser = await User.findOne({ email });

            if (!existingUser) {
                return res.status(404).json({ message: 'Adresse e-mail introuvable' });
            }

            // Générer un slug aléatoire
            const slug = uuidv4();

            // Enregistrer le slug dans la collection recoveryPassword
            const newRecoveryPassword = new RecoveryPassword({
                slug,
                userId: existingUser._id,
            });

            await newRecoveryPassword.save();

            // Construire le lien de récupération avec le slug
            const recoveryLink = `http://localhost:3000/admin/new-password/${slug}`;

            // Configuration de nodemailer
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                port: 587,
                auth: {
                    user: process.env.GMAIL_ACCOUNT,
                    pass: process.env.GMAIL_PASSWORD,
                },
                tls: {
                    rejectUnauthorized: false
                }
                // debug: true, 
                // logger: true
            });

            // Options du mail
            const mailOptions = {
                from: process.env.GMAIL_ACCOUNT,
                to: email,
                subject: 'Récupération de mot de passe',
                text: `Bonjour,\n\nCliquez sur le lien suivant pour réinitialiser votre mot de passe : ${recoveryLink}`,
            };

            // Envoi du mail
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error('Erreur lors de l\'envoi de l\'e-mail:', error);
                    return res.status(500).json({ message: 'Erreur lors de l\'envoi de l\'e-mail de récupération.' });
                }
                res.status(200).json({ message: 'Un lien de récupération a été envoyé à votre adresse e-mail.' });
            });
        } catch (error) {
            console.error(new Date().toISOString(), 'controllers/admin-controllers.js > recoveryResponse > error ', error);
            return res.status(500).json({ message: 'Erreur lors de la demande de récupération de mot de passe.', error });
        }
    },

    //----------------------------------------------------------- PASSWORD RESPONSE ------------------------------------------------------------  
    newPasswordResponse: async (req, res) => {
        try {
            const { slug } = req.params;
            const { newPassword } = req.body;
    
            // Rechercher le slug dans la collection recoveryPassword
            const recoveryEntry = await RecoveryPassword.findOne({ slug });
    
            if (!recoveryEntry) {
                return res.status(404).json({ message: 'La demande de modification de mot de passe est expirée ou invalide.' });
            }
    
            // Vérifier l'expiration du slug
            if (recoveryEntry.expireAt && recoveryEntry.expireAt < new Date()) {
                // Le slug est expiré
                return res.status(404).json({ message: 'La demande de modification de mot de passe a expiré.' });
            }
    
            // on verifie appartient bien à l'objet du modèle recovery si le slug correspond bien
            if (!(recoveryEntry instanceof RecoveryPassword)) {
                return res.status(500).json({ message: 'Erreur lors de la mise à jour du mot de passe.' });
            }
    
            // on cherche l'utilisateur en fonction du slug
            const user = await User.findById(recoveryEntry.userId);
    
            if (!user) {
                return res.status(404).json({ message: 'Utilisateur introuvable.' });
            }
    
            // MAJ du MDP
            user.setPassword(newPassword);
            await user.save();
    
            // On supprime le slug qu'on a utilisé
            await RecoveryPassword.deleteMany({ slug: recoveryEntry.slug });
    
            res.status(200).json({ message: 'Mot de passe mis à jour avec succès.' });
        } catch (error) {
            console.error(new Date().toISOString(), 'controllers/admin-controllers.js > newPasswordResponse > error ', error);
            return res.status(500).json({ message: 'Erreur lors de la mise à jour du mot de passe.', error });
        }
    },
    

    //----------------------------------------------------------- INGREDIENTS ------------------------------------------------------------  
    
    //----------------------------------------------------------- extraire info utilisateur ------------------------------------------------------------  
    
    extractUserInfo: async (req, res, next) => {
        try {
            const authorizationHeader = req.headers.authorization;

            if (!authorizationHeader) {
                return res.status(401).json({ message: 'Token manquant dans le HEADER, veuillez vous connectez' });
            }
            
            // on supprime le bearer une chaîne de caractères vide pour obtenir que le token
            const token = authorizationHeader.replace('Bearer ', '');
            
            decoded = jwt.verify(token, process.env.JWT_SECRET);
            next();

        } catch (error) {
            return res.status(401).json({ message: 'Token invalide', 'voici lerreur': error });
        }
    },
    

    //------------------------------------------- ADD BY ID USER
    AddIngredient: async (req, res) => {
        try {
            const { userId } = decoded; 
            const { ingredient } = req.body;
    
    
            // Vérifier si l'ingrédient existe déjà dans le tableau
            const user = await User.findById(userId); 

            if (!user) {
                return res.status(404).json({ message: 'Utilisateur introuvable' });
            }
    
            if (user.ingredients.includes(ingredient)) {
                return res.status(400).json({ message: 'Cet ingrédient existe déjà dans votre liste', 
                                                ingredients: `${user.ingredients}` 
            });
            }

            user.ingredients.push(ingredient);
            await user.save();
    
            res.status(200).json({ message: 'Ingrédient ajouté avec succès',
                                    ingredients: `${user.ingredients}` 
        
        
        });
        } catch (error) {
            console.error(new Date().toISOString(), 'controllers/admin-controllers.js > AddIngredient > error ', error);
            return res.status(500).json({ message: 'Erreur lors de l\'ajout de l\'ingrédient', error });
        }
    },
    
  
    //------------------------------------------- LISTE BY ID USER
    GetIngredient: async (req, res) => {
        try {
            const { userId } = decoded;
            const user = await User.findById(userId);
    
            if (!user) {
                return res.status(404).json({ message: 'Utilisateur introuvable' });
            }

                        // si tableau deja vide ?
            if (user.ingredients.length === 0) {
                return res.status(400).json({ message: 'Votre tableau d\'ingrédients est vide' });
            }

            res.status(200).json({ ingredients: `voici la liste de vos ingrédients : ${user.ingredients}` 
        });

        } catch (error) {
            console.error(new Date().toISOString(), 'controllers/admin-controllers.js > GetIngredient > error ', error);
            return res.status(500).json({ message: 'Erreur lors de la récupération des ingrédients', error });
        }
    },
    

    // DELETE BY ID USER
    DeleteIngredientbyid: async (req, res) => {
        try {
            const { userId } = decoded;
            const ingredientName = req.params.index; 

            // Trouver l'utilisateur
            const user = await User.findById(userId);

            if (!user) {
                return res.status(404).json({ message: 'Utilisateur introuvable' });
            }

            // Vérifier si l'ingrédient existe dans le tableau
            const ingredientIndex = user.ingredients.indexOf(ingredientName);
            if (ingredientIndex === -1) {
                return res.status(400).json({ message: 'Ingrédient introuvable dans la liste' });
            }

            // Supprimer l'ingrédient de l'array
            user.ingredients.splice(ingredientIndex, 1);
            await user.save();
            res.status(200).json({ message: `L'ingrédient ${ingredientName} a été supprimé avec succès`,
                                    ingredients: `${user.ingredients}` 
        });
        } catch (error) {
            console.error(new Date().toISOString(), 'controllers/admin-controllers.js > DeleteIngredientbyid > error ', error);
            return res.status(500).json({ message: `Erreur lors de la suppression de l'ingrédient "${ingredientName}"`, error });
        }
    },


    //------------------------------------------- DELETE ALL
    DeleteAllIngredient  : async (req,res) => {
        
        try {
            const { userId } = decoded; 
        
            // Trouver et mettre à jour l'utilisateur
            const user = await User.findByIdAndUpdate(userId, { $set: { ingredients: [] } }, { new: true });

            // si user introuvanble
            if (!user) {
            return res.status(404).json({ message: 'Utilisateur introuvable' });
            }

            // si tableau deja vide ?
            if (user.ingredients.length === 0) {
                return res.status(200).json({ message: 'Votre tableau d\'ingrédients est déjà vide' });
            }
            res.status(200).json({ message: 'Tous les ingrédients ont été supprimés avec succès',
                                    ingredients: `${user.ingredients}`  
        
        });
        } catch (error) {
            console.error(new Date().toISOString(), 'controllers/admin-controllers.js > DeleteAllIngredient > error ', error);
            return res.status(500).json({ message: 'Erreur lors de la suppression de tous les ingrédients', error });
        }
    
    },


};