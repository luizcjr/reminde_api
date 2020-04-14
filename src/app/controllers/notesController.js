const expresss = require('express');
const router = expresss.Router();
const authMiddleware = require('../middlewares/auth');
const admin = require('firebase-admin');

const Notes = require('../models/notes');
const FCMToken = require('../models/FCMToken');

router.use(authMiddleware);

router.get('/', async (req, res) => {
    try {
        const notes = await Notes.find({user: req.userId});
    
        return res.send({notes});
    } catch(err) {
        return res.status(400).send({error: 'Erro ao listar lembretes. Tente novamente!'});
    }
})

router.get('/:noteId', async(req, res) => {
    try {
        const notes = await Notes.findById(req.params.noteId).populate(['user', 'notes']);

        return res.send({notes});
    } catch(err) {
        return res.status(400).send({error: 'Erro ao listar lembrete. Tente novamente!'});
    }
});

router.post('/', async(req,res)=>{
    try {
        const {title, description, date, is_notified} = req.body;

        const notes = await Notes.create({title, description, date, is_notified, user: req.userId});

        return res.send({notes});
    } catch(err) {
        return res.status(400).send({error: 'Erro ao criar novo Lembrete. Tente novamente!'});
    }
});

router.post('/notification', async (req, res) => {
	const {fcm_token, is_accepted} = req.body;

	/* Token is empty */
	if(!fcm_token){
		return res.status(400).json({"error" : "FCM token not provider"});
	}

	/* Token invalid */
	const message = {
        data: {
            title: 'Notification accept',
        },
        token: fcm_token
	};
	
	/* Mod simulate */
	admin.messaging().send(message, true).then( async (resp) => {
		
		const fcmNotify = await FCMToken.find({user_id: req.userId});

		/* User not fcm token for messagin */
		if(fcmNotify.length == 0){
			await FCMToken.create({token: fcm_token, user_id: req.userId})
			return res.json({"success": "FCM Notify create success"});
		}else{
			await FCMToken.update({user_id: req.userId}, { $set: 
				{token: fcm_token, is_accepted: is_accepted}
			});

			return res.json({"success": "FCM Notify update success"});
		}
    }).catch((err) => {
        return res.status(400).json({"error" : err.message});
    });

});

router.put('/:noteId', async(req, res) => {
    try {
        const {title, description, descriptionShort, author, isOpen} = req.body;

        const notes = await Notes.findByIdAndUpdate(
            req.params.noteId, {title, description, descriptionShort, author, isOpen}, {new:true});

        return res.send({notes});
    } catch(err) {
        return res.status(400).send({error: 'Erro ao alterar o lembrete. Tente novamente!'});
    }
});

router.delete('/:noteId', async(req, res) => {
    try {
        await Notes.findByIdAndRemove(req.params.noteId);

        return res.send({user});
    } catch(err) {
        return res.status(400).send({error: 'Erro ao deletar projeto. Tente novamente!'});
    }
});

module.exports = app => app.use('/notes', router);