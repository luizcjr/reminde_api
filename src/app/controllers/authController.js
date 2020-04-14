const expresss = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authConfig = require('../../config/auth');
const crypt = require('crypto');
const mailer = require('../../modules/mailer');

const User = require('../models/User');

const router = expresss.Router();

function generateToken(params = {}) {
    return jwt.sign(params, authConfig.secret, {
    expiresIn: 86400,
});
}

router.post('/register', async(req, res) => {
    const { email } = req.body;
    try {
        if(await User.findOne({email}))
            return res.status(400).send({error: 'E-mail já existente!' });

        const user = await User.create(req.body);

        user.password = undefined
        
        res.send({
            user,
            token:generateToken({id:user.id})
        });
    } catch(err) {
        return res.status(400).send({
            error: 'Registration failed'
        });
    }
});

router.post('/authenticate', async(req, res) => {
    const {email, password} = req.body;

    const user = await User.findOne({email}).select('+password');

    if(!user) 
        return res.status(400).send({error: 'Usuário não encontrado'});

    if(!await bcrypt.compare(password, user.password))
        return res.status(400).send({error: 'Senha inválida!'});

    user.password = undefined;

    res.send({
        user,
        token:generateToken({id:user.id})
    });
});

router.post('/forgot_password', async(req, res) => {
    const {email} = req.body;
    try {
        const user = await User.findOne({email});

        if(!user) 
        return res.status(400).send({error: 'Usuário não encontrado'});

        const token = crypt.randomBytes(3).toString('hex');
        const now = new Date();
        now.setHours(now.getHours() + 1);

        await User.findByIdAndUpdate(user.id, {
            '$set': {
                passwordResetToken: token,
                passwordResetExpires: now,
            }
        });

        mailer.sendMail({
            to: email,
            from: 'luiz_cjr@hotmail.com',
            subject: 'Recuperar senha',
            template: 'forgot_password',
            context: {token},
        }, (err) => {
            if(err) return res.status(400).send({error: 'Não foi possível enviar o e-mail com o token.'});

            return res.send({user, token:generateToken({id:user.id})});
        });
    } catch (err) {
        return res.status(400).send({error: 'Erro ao recuperar senha. Tente novamente!'});
    }
});

router.post('/reset_password', async(req, res) => {
    const {email, token, password} = req.body;

    try {
        const user = await User.findOne({email}).select('+passwordResetToken passwordResetExpires');

        if(!user) 
        return res.status(400).send({error: 'Usuário não encontrado'});

        if(token !== user.passwordResetToken) 
        return res.status(400).send({error: 'Token inválido!'});

        const now = new Date();
        if(now > user.passwordResteExpires)
        return res.status(400).send({error: 'Token expirado. Gere um novo!'});

        user.password = password;

        await user.save();

        res.send({user, token:generateToken({id:user.id})});
    } catch (err) {
        console.log(err);
        return res.status(400).send({error: 'Erro ao resetar senha. Tente novamente!'});
    }
});

module.exports = app => app.use('/auth', router);