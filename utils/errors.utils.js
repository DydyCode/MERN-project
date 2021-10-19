module.exports.signUpErrors = (err) => {
    let errors = { pseudo: '', email: '', password: '' } /* Création d'un tableau qu'on acrémente suivant l'erreur, qu'on pourra récupérer pour le front */

    if (err.message.includes('pseudo')) /* Si l'erreur concerne le pseudo */
        errors.pseudo = "Pseudo incorrect ou déjà pris"; /* Dans le tableau errors, dans l'index pseudo on ajoute le messaege suivant */

    if (err.message.includes('email')) /* Si l'erreur concerne le pseudo */
        errors.email = "Email incorrect"; /* Dans le tableau errors, dans l'index email on ajoute le messaege suivant */

    if (err.message.includes('password')) /* Si l'erreur concerne le pseudo */
        errors.password = "Le mot de passe doit faire 6 caractères minimum"; /* Dans le tableau errors, dans l'index password on ajoute le messaege suivant */
    
    if (err.code === 11000 && Object.keys(err.keyValue)[0].includes('pseudo')) 
        /* Le statut d'erreur 11.000 correspond au cas ou quelque chose est déja utilisé */
        /* && On pointe ensuite la clé pour vérifié que sa valeur concerne le pseudo */
        errors.email = "Cet email est déjà enregistré"; /* Dans le tableau errors, dans l'index email on ajoute le messaege suivant */

    if (err.code === 11000 && Object.keys(err.keyValue)[0].includes('email')) 
        /* Le statut d'erreur 11.000 correspond au cas ou quelque chose est déja utilisé */
        /* && On pointe ensuite la clé pour vérifié que sa valeur concerne l'email */
        errors.email = "Cet email est déjà enregistré"; /* Dans le tableau errors, dans l'index email on ajoute le messaege suivant */

    return errors; /* La fonction retourne le tableau errors */
}

module.exports.signInErrors = (err) => {
    let errors = { email: '', password: ''}/* Création d'un tableau qu'on acrémente suivant l'erreur, qu'on pourra récupérer pour le front */

    if (err.message.includes('email')) /* Si l'erreur concerne l'email */
        errors.email  = "Email inconnu"; /* Dans le tableau errors, dans l'index email on ajoute le messaege suivant */

    if (err.message.includes('password')) /* Si l'erreur concerne le password */
        errors.password = "Le mot de passe ne correspond pas"; /* Dans le tableau errors, dans l'index password on ajoute le messaege suivant */

    return errors; /* La fonction retourne le tableau errors */
}