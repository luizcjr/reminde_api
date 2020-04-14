const mongoose = require('../../database');

const NotesSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    date: {
		type: String,
		required: true,
	},
	is_notified: {
		type: Boolean,
		default: false,
		required: false
	},
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        require: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Notes = mongoose.model('Notes', NotesSchema);

module.exports = Notes;