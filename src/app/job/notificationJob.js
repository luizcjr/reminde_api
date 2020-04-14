const schedule = require('node-schedule');

const admin = require('firebase-admin');

const FCMToken = require('../models/FCMToken');

const Notes = require('../models/notes');

const ObjectId = require('mongodb').ObjectID;

const serviceAccount = require('../../config/reminder-b798f-firebase-adminsdk-p3h8o-fd69e6caf2.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://reminder-b798f.firebaseio.com"
});

/* every 8 second */
schedule.scheduleJob('*/8 * * * * *', () => {

    FCMToken.find({}, async (err, fcmtokens) => {
        if(fcmtokens.length > 0){
            fcmtokens.forEach(async (fcm) => {
                await Notes.find({user_id: fcm.user_id}, async (err, notes) => {  
                    if(notes.length > 0){
                        notes.forEach((notes) => {
                            if(fcm.is_accepted){
                                if(new Date().toLocaleString('pt-Br') == new Date(notes.date).toLocaleString('pt-Br')){
                                    if(notes.is_notified){
                                        var message = {
                                            data: {
                                                title: notes.title,
                                                body: notes.description == null ? "Tarefa programada para hoje" : notes.description,
                                                id: ObjectId(notes._id).toString()
                                            },
                                            token: fcm.token
                                        };
                                        
                                        admin.messaging().send(message).then(async (resp) => {
                                            await Notes.findOneAndUpdate({_id: notes._id}, {is_notified: false});
                                            console.log("Notify-s", resp);
                                        }).catch((err) => {
                                            console.log("Notify-e", err);
                                        });
                                    }
                                }
                            }
                        });
                    }
                });
            });
        }
    });;
});