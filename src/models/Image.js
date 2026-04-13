const mongoose = require('mongoose');

const ImageSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true

    },

    originalName: {
        type: String,
        required: true
    },

    filename: {
        type: String,
        required: true
    },

    filePath: {
        type: String,
        required: true
    },
    mimetype: {
        type: String,
        required: true
    },

    size: { 
        type: Number,
        required: true
    }
}, { timestamps: true });

const Image = mongoose.model('Image', ImageSchema);
module.exports = Image;
