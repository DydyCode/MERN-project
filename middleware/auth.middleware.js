const jwt = require('jsonwebtoken');
const UserModel = require('../models/user.model');

/* Middleware qui vérifie le token de l'utilisateur */
module.exports.checkUser = (req, res, next) => {
    const token = req.cookies.jwt; /* Récupère le token dans les cookies */
    if(token) { /* Si l'user a un token alors.. */
        jwt.verify(token, process.env.TOKEN_SECRET, async (err, decodedToken) => { /* Vérifie le token de l'user avec la clé dans le fichier .env */
            if(err) { /* Si il y a une erreur alors.. */
                res.locals.user = null; /* l'user n'éxiste pas */
                res.cookie('jwt', '', {maxAge: 1}); /* Supprime son token dans la milliseconde */
                next(); /* Passe a la suite de le middleware */
            } else { /* Si il n'y a pas d'erreur */
                let user = await UserModel.findById(decodedToken.id); /* Trouve l'id de l'user par rapport au userModel */
                res.locals.user = user; /* Ajoute l'user */
                next(); /* Passe a la suite de la middleware */
            }
        })
    } else  { /* Si il n'y a pas de token */
        res.locals.user = null; /* L'utilisateur n'existe pas */
        next(); /* Passe a la suite de la middleware */
    }
}

/* Middleware qui vérifie si l'utilisateur est connecté */
module.exports.requireAuth = (req, res, next) => {
    const token = req.cookies.jwt; 
    if(token) { /* Si il y a un token dans les cookies  alors ...*/
        jwt.verify(token, process.env.TOKEN_SECRET, async (err, decodedToken) => {/* Vérifie avec la clé si c'est un token connu */
            if(err) { /* si il y a une erreur, log la */
                console.log(err);
            } else { /* Sinon lg le id de l'utilisateur trouvé */
                console.log(decodedToken.id);
                next(); /* Passe a la suite de la middleware */
            }
        });
    } else {
        console.log('No token'); /* Si il n'y a pas de token */
    }
}