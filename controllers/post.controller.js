const PostModel = require('../models/post.model');
const UserModel = require('../models/user.model');
const ObjectID = require('mongoose').Types.ObjectId;

module.exports.readPost = (req, res) => {
    PostModel.find((err, docs) => {
        if (!err) res.send(docs);
        else console.log('Error to get data: ' + err);
    })
}

module.exports.createPost = async (req, res) => { /* Fonction asynchrone */
    const newPost = new PostModel({
        posterId: req.body.posterId,
        message: req.body.message,
        video: req.body.video,
        likers: [], /* il n'y a pas de likes au départ donc tableau vide qu'on incrémentera plus tard */
        comments: [] /* il n'y a pas de commentaires au départ donc tableau vide qu'on incrémentera plus tard */
    });

    try {
        const post = await newPost.save(); /* await le newPost car asynchrone / méthode save  */
        return res.status(201).json(post);
    } catch (err) {
        return res.status(500).json(err)
    }
}

module.exports.updatePost = (req, res) => {
    if (!ObjectID.isValid(req.params.id))/* Test si l'id passé dans l'url est connu dans la base de données */
        return res.status(400).send("ID unknown : " + req.params.id);/* si inconu envois id inconnu et met fin à la fonction */

    const updatedRecord = {
        message: req.body.message
    }

    // PostModel.findByIdAndUpdate( /* Trouve et met a jour le post qui */
    //     req.params.id, /* correspond a l'id dans l'url */
    //     { $set: updatedRecord }, /* Met a jour la constante (req.body.message) */
    //     { new: true }, /* nouveau message true */
    //     (err, docs) => { /* docs = data */
    //         if (!err) res.send(docs);
    //         else console.log('Update error');
    //     }
    // )
    PostModel.findOne({ _id: req.params.id }) /* trouve l'id du post qui est passer dans l'url */
        .then(() => { /* retourne un callback*/
            const post = req.body.message; /* récupère le message  */

            PostModel.updateOne({ _id: req.params.id }, { ...post })/* met a jour le post corresponddant à l'id contenu dans l'url, puis modifie le message */
                .then(() => res.status(200).json({ post })) /* puis retourne le post si tout c'est bien passé */
                .catch(error => res.status(400).json({ error }));/* sinon balance l'erreur */
        })
}

module.exports.deletePost = (req, res) => {
    if (!ObjectID.isValid(req.params.id))/* Test si l'id passé dans l'url est connu dans la base de données */
        return res.status(400).send("ID unknown : " + req.params.id);/* si inconu envois id inconnu et met fin à la fonction */

    try {
        PostModel.remove({ _id: req.params.id }).exec(); /* Supprime le post correspondant a l'id de l'url */
        res.status(200).json({ message: "Post sucessfully deleted." });/* si tout s'est bien passer renvois le message */
    } catch (error) {
        return res.status(500).json({ message: error }); /* sinon affiche l'erreur */
    }
}

module.exports.likePost = async (req, res) => {
    if (!ObjectID.isValid(req.params.id))/* Test si l'id passé dans l'url est connu dans la base de données */
        return res.status(400).send("ID unknown : " + req.params.id);/* si inconu envois id inconnu */

    PostModel.findOne({ _id: req.params.id }) /* trouve l'id du post qui est passer dans l'url */
        .then((post) => { /* retourne un callback, et on stock le resultat */
            PostModel.updateOne({ _id: req.params.id }, { $addToSet: { likers: req.body.id } })/* met a jour le post correspondant à l'id contenu dans l'url. addtoset permet d'ajouter sans écrasé ce qui se trouve deja dans l'index likers du tableau du post */
                .then(() => res.status(200).json(post)) /* puis retourne le post sauf qu'on ne peut return qu'une fois une reponse donc on ne le fait pas à la fin*/
                .catch(error => res.status(400).json({ error }));/* sinon balance l'erreur */
        })
    UserModel.findOne({ _id: req.body.id }) /* trouve l'id de l'user qui est passer dans le corps de la requête */
        .then(() => { /* retourne un callback*/
            UserModel.updateOne({ _id: req.body.id }, { $addToSet: { likes: req.params.id } })/* met a jour l'user correspondant à l'id contenu dans l'url. addtoset permet d'ajouter sans écrasé ce qui se trouve deja dans l'index likes du tableau de l'user */
                // .then(() => res.status(200).json(user)) /* on ne peut pas retourner deux fois une reponse sinon l'app crash */
                .catch(error => res.status(400).json({ error }));/* sinon balance l'erreur */
        })
}

module.exports.unLikePost = async (req, res) => {
    if (!ObjectID.isValid(req.params.id))/* Test si l'id passé dans l'url est connu dans la base de données */
        return res.status(400).send("ID unknown : " + req.params.id);/* si inconu envois id inconnu et met fin à la fonction */

    PostModel.findOne({ _id: req.params.id }) /* trouve l'id du post qui est passer dans l'url */
        .then((post) => { /* retourne un callback, et on stock le resultat */
            PostModel.updateOne({ _id: req.params.id }, { $pull: { likers: req.body.id } })/* met a jour le post correspondant à l'id contenu dans l'url. pull permet retiré ce qui se trouve dans l'index likers du tableau du post */
                .then(() => res.status(200).json(post)) /* puis retourne le post sauf qu'on ne peut return qu'une fois une reponse donc on ne le fait pas à la fin*/
                .catch(error => res.status(400).json({ error }));/* sinon balance l'erreur */
        })
    UserModel.findOne({ _id: req.body.id }) /* trouve l'id de l'user qui est passer dans le corps de la requête */
        .then(() => { /* retourne un callback*/
            UserModel.updateOne({ _id: req.body.id }, { $pull: { likes: req.params.id } })/* met a jour l'user correspondant à l'id contenu dans l'url. pull permet de retiré se trouve dans l'index likes du tableau de l'user */
                // .then(() => res.status(200).json(user)) /* on ne peut pas retourner deux fois une reponse sinon l'app crash */
                .catch(error => res.status(400).json({ error }));/* sinon balance l'erreur */
        })
}

/****************************** COMMENTS *****************************/

module.exports.commentPost = (req, res) => {
    if (!ObjectID.isValid(req.params.id))/* Test si l'id passé dans l'url est connu dans la base de données */
        return res.status(400).send("ID unknown : " + req.params.id);/* si inconu envois id inconnu et met fin à la fonction */

    PostModel.findOne({ _id: req.params.id }) /* trouve l'id du post qui est passer dans l'url */
        .then((comment) => { /* retourne un callback, et on stock le resultat */
            PostModel.updateOne(
                { _id: req.params.id },
                {
                    $push: { /* push permet d'ajouter un tableau dans le tableau du post, sans effacer ce qu'il contient déja si il n'est pas vide */
                        comments: {
                            commenterId: req.body.commenterId,
                            commenterPseudo: req.body.commenterPseudo,
                            text: req.body.text,
                            timestamp: new Date().getTime() /* Fonction JS pour récupérer l'heure qu'il est au moment de la modification */
                        }
                    }
                }
            )
                .then(() => res.status(200).json(comment)) /* puis retourne le commentaire */
                .catch(error => res.status(400).json({ error }));/* sinon balance l'erreur */
        })
}

module.exports.editCommentPost = (req, res) => {
    if (!ObjectID.isValid(req.params.id))/* Test si l'id passé dans l'url est connu dans la base de données */
        return res.status(400).send("ID unknown : " + req.params.id);/* si inconu envois id inconnu et met fin à la fonction */

    try {
        return PostModel.findById(
            req.params.id,
            (err, docs) => {
                const theComment = docs.comments.find((comment) => comment._id.equals(req.body.commentId))
                if (!theComment) return res.status(404).send('Comment not found')
                theComment.text = req.body.text;

                return docs.save((err) => {
                    if (!err) return res.status(200).send(docs);
                    return res.status(500).send(err)
                })
            }
        )
    } catch (err) {
        return res.status(400).send(err)
    }

}

module.exports.deleteCommentPost = (req, res) => {
    if (!ObjectID.isValid(req.params.id))/* Test si l'id passé dans l'url est connu dans la base de données */
        return res.status(400).send("ID unknown : " + req.params.id);/* si inconu envois id inconnu et met fin à la fonction */

    try {
        return PostModel.findByIdAndUpdate(
            req.params.id,
            {
                $pull: {
                    comments: {
                        _id: req.body.commentId
                    }
                }
            },
            { new: true },
            (err, docs) => {
                if (!err) return res.send(docs);
                else return res.status(400).send(err);
            }
        )
    } catch (err) {
        return res.status(400).send(err);
    }
}