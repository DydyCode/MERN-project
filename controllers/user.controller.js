const UserModel = require('../models/user.model');
const ObjectID = require('mongoose').Types.ObjectId; /* Controlle a chaque fois que l'id est reconnu par la base de données */

module.exports.getAllUsers = async (req, res) => {
    const users = await UserModel.find().select("-password"); /* Trouve tout les utilisateur et prend tout, sauf les password */
    res.status(200).json(users);
}

module.exports.userInfo = (req, res) => {
    // console.log(req.params); /* req.body = le corps, les input. req.params = dans l'url */
    if (!ObjectID.isValid(req.params.id)) /* Test si l'id passé dans l'url est connu dans la base de données */
        return res.status(400).send('ID unknown : ' + req.params.id) /* si inconu envois id inconnu */
    UserModel.findById(req.params.id, (err, docs) => { /* trouve un id dans la BDD qui correspond au paramétre de l'url */
        if (!err) res.send(docs) /* si il n'y a pas d'erreur envois le docs = les donées */
        else console.log('ID unknown :' + err) /* sinon utilisateur inconnu + affiche l'erreur */
    }).select('-password'); /* Retire le password */
};

module.exports.updateUser = async (req, res) => {
    if (!ObjectID.isValid(req.params.id))/* Test si l'id passé dans l'url est connu dans la base de données */
        return res.status(400).send("ID unknown : " + req.params.id);/* si inconu envois id inconnu */

    UserModel.findOne({ _id: req.params.id }) /* trouve l'id de l'user qui est passer dans l'url */
        .then(user => { /* retourne un callback*/
            const userObject = { ...req.body }; /* récupère les modifications du corps de la requete*/

            UserModel.updateOne({ _id: req.params.id }, { ...userObject, _id: req.params.id })/* met a jour l'user de l'id contenu dans l'url, par l'objet des modifs */
                .then(() => res.status(200).json({ user })) /* puis retourne l'user */
                .catch(error => res.status(400).json({ error }));/* sinon balance l'erreur */
        })
};

module.exports.deleteUser = async (req, res) => {
    if (!ObjectID.isValid(req.params.id))/* Test si l'id passé dans l'url est connu dans la base de données */
        return res.status(400).send("ID unknown : " + req.params.id);/* si inconu envois id inconnu */

    try {
        await UserModel.remove({ _id: req.params.id }).exec(); /* attend  l'di de l'user, une fois que tu l'a execute la fonction remove */
        res.status(200).json({ message: "Sucessfully deleted." });/* si tout s'est bien passer renvois le message */
    } catch (error) {
        return res.status(500).json({ message: error }); /* sinon affiche l'erreur */
    }
}

module.exports.follow = async (req, res) => {
    if (!ObjectID.isValid(req.params.id) || !ObjectID.isValid(req.body.idToFollow))/* Test si l'id passé dans l'url est connu dans la base de données */
        return res.status(400).send("ID unknown : " + req.params.id);/* si inconu envois id inconnu */

    UserModel.findOne({ _id: req.params.id }) /* trouve l'id de l'user qui est passer dans l'url */
        .then((user) => { /* retourne un callback, et on stock le resultat */
            UserModel.updateOne({ _id: req.params.id }, { $addToSet: { following: req.body.idToFollow } })/* met a jour l'user correspondant à l'id contenu dans l'url. addtoset permet d'ajouter sans écrasé ce qui se trouve deja dans l'index following du tableau de l'user */
                .then(() => res.status(200).json(user)) /* puis retourne l'user sauf qu'on ne peut return qu'une fois une reponse donc on ne le fait pas à la fin*/
                .catch(error => res.status(400).json({ error }));/* sinon balance l'erreur */
        })
    UserModel.findOne({ _id: req.body.idToFollow }) /* trouve l'id de l'user qui est passer dans l'url */
        .then((user) => { /* retourne un callback*/
            UserModel.updateOne({ _id: req.body.idToFollow }, { $addToSet: { followers: req.params.id } })/* met a jour l'user correspondant à l'id contenu dans le corps de la requête . addtoset permet d'ajouter sans écrasé ce qui se trouve deja dans l'index followers du tableau de l'user */
                // .then(() => res.status(200).json(user)) /* on ne peut pas retourner deux fois une reponse sinon l'app crash */
                .catch(error => res.status(400).json({ error }));/* sinon balance l'erreur */
        })
}

module.exports.unfollow = async (req, res) => {
    if (!ObjectID.isValid(req.params.id) || !ObjectID.isValid(req.body.idToUnfollow))/* Test si l'id passé dans l'url est connu dans la base de données */
        return res.status(400).send("ID unknown : " + req.params.id);/* si inconu envois id inconnu */

    UserModel.findOne({ _id: req.params.id }) /* trouve l'id de l'user qui est passer dans l'url */
        .then((user) => { /* retourne un callback*/
            UserModel.updateOne({ _id: req.params.id }, { $pull: { following: req.body.idToUnfollow } }) /* met a jour l'user correspondant à l'id contenu dans l'url. pull permet de retiré ce qui se trouve dans l'index following du tableau de l'user */
                .then(() => res.status(200).json(user)) /* puis retourne l'user sauf qu'on ne peut return qu'une fois une reponse donc on ne le fait pas à la fin*/
                .catch(error => res.status(400).json({ error }));/* sinon balance l'erreur */
        })
    UserModel.findOne({ _id: req.body.idToUnfollow }) /* trouve l'id de l'user qui est passer dans l'url */
        .then(() => { /* retourne un callback*/
            UserModel.updateOne({ _id: req.body.idToUnfollow }, { $pull: { followers: req.params.id } }) /* met a jour l'user correspondant à l'id contenu dans le corps de la requête. pull permet de retiré ce qui se trouve dans l'index followers du tableau de l'user */
                // .then(() => res.status(200).json(user)) /* on ne peut pas retourner deux fois une reponse sinon l'app crash */
                .catch(error => res.status(400).json({ error }));/* sinon balance l'erreur */
        })
}