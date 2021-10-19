const express = require('express');
const bodyParer = require('body-parser');
const cookieParser = require('cookie-parser');
const userRoutes = require('./routes/user.routes');
const postRoutes = require('./routes/post.routes');
require('dotenv').config({path: './config/.env'});
require('./config/dataBase');
const {checkUser, requireAuth } = require('./middleware/auth.middleware');
const app = express();

app.use(bodyParer.json());
app.use(bodyParer.urlencoded({extended: true}));
app.use(cookieParser());

// jwt
app.get('*', checkUser ); /* A chaque requête de toute les routes (*) vérifie le token de l'user  */
app.get('/jwtid', requireAuth, (req, res) => {
    res.status(200).send(res.locals.user._id)
});
// routes
app.use('/api/user', userRoutes);
app.use('/api/post', postRoutes);

// server a la fin 
app.listen(process.env.PORT, () => {
    console.log(`Listening on port ${process.env.PORT}`);
})
