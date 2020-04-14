const expresss = require('express');
const router = expresss.Router();
const authMiddleware = require('../middlewares/auth');

const User = require('../models/User');

router.use(authMiddleware);

router.get('/:id', async(req, res) => {
    try {
        const user = await User.findById(req.params.id).populate(['user']);

        return res.send({user});
    } catch(err) {
        return res.status(400).send({error: 'Erro ao listar usuários. Tente novamente!'});
    }
});

router.put('/:id', async(req, res) => {
    try {
        const {name, email} = req.body;

        const user = await User.findByIdAndUpdate(
            req.params.id, {name, email}, {new:true});

        return res.send({user});
    } catch(err) {
        console.log(err);
        return res.status(400).send({error: 'Erro ao alterar o usuário. Tente novamente!'});
    }
});

module.exports = app => app.use('/user', router);

