const mongoose = require('mongoose');
const { isEmail } = require('validator'); /* Appel d'une fonction de validator */
const bcrypt = require('bcrypt');
const userSchema = new mongoose.Schema(
    {
        pseudo: {
            type: String,
            required: true,
            minlength: 3,
            maxlength: 55,
            unique: true,
            trim: true /* Supprime les espaces si il y en as */
        },
        email: {
            type: String,
            required: true,
            validate: [isEmail], /* Fonction de validator qui valide l'email */
            lowercase: true, /* Pas de majuscules dans les adresses mail */
            unique: true,
            trim: true
        },
        password: {
            type: String,
            required: true,
            max: 1024,
            minlength: 6 /* PAS DE CAMELCASE */
        },
        picture: {
            type: String,
            default: "./uploads/profil/random-user.png"
        },
        bio: {
            type: String,
            max: 1024,
        },
        followers: {
            type: [String]
        },
        following: {
            type: [String]
        },
        likes: {
            type: [String]
        },
    },
    {
        timestamps: true,/* Enregistre quand le compte est crée. Il faut le mettre a la fin du model. */
    }
);

// play fonction before save into display : 'block'

/* fonction asynchrone qui attend d'avoir le password */
userSchema.pre("save", async function(next) { /* Pas de fonction félché pour utilisé le .this */
    const salt = await bcrypt.genSalt(); /* AWAIT bcrypt génére une série de caracté pour "salé" le mdp */
    this.password = await bcrypt.hash(this.password, salt); /* attend d'avoir le password pour le hash */
});

/* Fonction asynchrone qui compare le mdp entrée avec celui dans le BDD */
userSchema.statics.login = async function(email, password) { /* Pas de fonction fléché pour utilisé le .this*/
    const user = await this.findOne({ email }); /* Trouve l'user qui correspond a l'email entrée et stock le dans user*/
    if (user) {
        const auth = await bcrypt.compare(password, user.password); /* Test si le mdp est bon */
        if (auth) { /* Si le mdp est bon return user */
            return user;
        }
        throw Error('Incorrect password'); /* Sinon mdp incorrect (Throw arrête immédiatement le déroulement de la fonction) */
    }
    throw Error('Incorrect email'); /* Si tu trouve pas d'user avec cet email alors email incorrect */
}

const UserModel = mongoose.model('user', userSchema);

module.exports = UserModel;