const mongoose = require('mongoose')
	Schema = mongoose.Schema;

const MessageSchema = new Schema({
	conversationID: {
		type: Schema.Types.ObjectId,
		required: true
	},
	body: {
		type: String
		required: true
	},
	author:{
		type: Schema.Types.ObjectId,
		ref: 'User'
	}
},
 {
 	timestamps: true // createdAt will be the time stamp
 });
module.exports = mongoose.model('Message', MessageSchema);