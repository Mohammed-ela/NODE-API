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
    expireAt: { 
        type: Date, 
        default: Date.now, 
        expires: 3600 // 1h
    }
});

const RecoveryPassword = mongoose.model('RecoveryPassword', recoveryPasswordSchema);

module.exports = RecoveryPassword;
