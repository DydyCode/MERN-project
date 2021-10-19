const UserModel = require('../models/user.model');
const jwt = require('jsonwebtoken');
const { signUpErrors, signInErrors } = require('../utils/errors.utils');

module.exports.signUp = async (req, res) => {
    const { pseudo, email, password } = req.body;
    try {
        const user = await UserModel.create({ pseudo, email, password });
        res.status(201).json({ user: user._id });
    }
    catch (err) {
        const errors = signUpErrors(err) /* Appel de la fonction qui traite les erreurs de signUp */
        res.status(200).send({ errors }); /* Appel de la constante plus haut dans un OBJET */ 
    }
}

/* Expire dans 3jours */
const maxAge = 3 * 24 * 60 * 60 * 1000;

/* Fonction qui crée un token et ajoute a celui-ci une date d'expiration */
const createToken = (id) => {
    return jwt.sign({id}, process.env.TOKEN_SECRET, {
        expiresIn: maxAge
    })
};

/* Fonction qui test et compare les Token */
module.exports.signIn = async (req,res) => {
    const { email, password } = req.body; 

    try {
        const user = await UserModel.login(email, password); /* Stock l'user connecté qui est la constente de req.body */
        const token = createToken(user._id); /* Crée et ajoute un token dans l'index _id de l'user */
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge }) /* Ajoute le token dans les cookies */
        res.status(200).json({ user: user._id}) /* Retourne l'user._id */
    } catch (err){
        const errors = signInErrors(err);/* Appel de la fonction qui traite les erreurs de signIn */
        res.status(400).json({errors});/* Affiche de la constante plus haut dans un OBJET */ 
    }
}

/* Fonction qui supprime le token des cookies */
module.exports.logout = async (req,res) => {
    res.cookie('jwt', '', { maxAge: 1 }); /* Supprime le cookie en 1 milliseconde */
    res.redirect('/'); /* Permet à POSTMAN d'aboutir la requête */
}