const mongoose = require('mongoose');

const RefreshTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: [true, 'Refresh token is required'],
        unique: [true, 'Refresh token must be unique'],
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' ,
        required: [true, 'Associated user is required']
    },
    expiresAt: {
        type: Date,
        required: [true, 'Expiration date is required']
    }
}, { timestamps: true });   

RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const RefreshToken = mongoose.model('RefreshToken', RefreshTokenSchema);
module.exports = RefreshToken;