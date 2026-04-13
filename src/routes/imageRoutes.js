const express = require('express');
const imageRouter = express.Router();
const { uploadImage, getImages, deleteImage, getSingleImage, transformImage } = require('../controllers/imageController');
const authenticateToken = require('../middleware/authMiddleware');
const {idValidator,validate, uploadValidator} = require('../middleware/validate')
const upload = require('../config/multer');

imageRouter.post('/upload', authenticateToken, upload.single('image'),uploadValidator,uploadImage);

imageRouter.get('/', authenticateToken, getImages);

imageRouter.get('/:id', authenticateToken, idValidator,validate,getSingleImage);

imageRouter.get('/:id/transform', authenticateToken,idValidator,validate, transformImage);

imageRouter.delete('/:id', authenticateToken,idValidator,validate,deleteImage);

module.exports = imageRouter;
