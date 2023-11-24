const mongoose = require('mongoose');

const recoveryPasswordSchema = new mongoose.Schema({
    slug: { 
        type: String, required: true 
    },
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
});

const RecoveryPassword = mongoose.model('RecoveryPassword', recoveryPasswordSchema);

module.exports = RecoveryPassword;
