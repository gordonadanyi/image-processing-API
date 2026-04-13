const Image = require('../models/Image');
const path = require('path');
const {formatResponse} = require('../utils/response')
const ImageProcessingService = require('../services/imageService')
const {transformSchema} = require('../validations/imageValidation')
const fs = require('fs/promises');

// Upload image controller
const uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json(formatResponse(false, null, 'No file uploaded'));
        }

        const imageData = await ImageProcessingService.uploadImage(req.user._id, req.file);
        res.status(201).json(formatResponse(true, imageData, 'Image uploaded successfully'));
    } catch (error) {
        res.status(500).json(formatResponse(false, null, error.message));
    }
};

const getImages = async (req, res) => {
    try {
        const images = await ImageProcessingService.getUserImages(req.user._id);
        res.json(formatResponse(true, { count: images.length, images }, 'Images fetched successfully'));
    } catch (error) {
        res.status(500).json(formatResponse(false, null, error.message));
    }
};

const getSingleImage = async (req, res) => {
    try {
        const image = await ImageProcessingService.getImageById(req.params.id, req.user._id);
        res.set('Content-Type', image.mimetype);
        res.sendFile(path.resolve(image.filePath));
    } catch (error) {
        res.status(404).json(formatResponse(false, null, error.message));
    }
};

const transformImage = async (req, res) => {
    try {
        const { id } = req.params;
        const options = req.query;

        // === VALIDATION STEP ===
        const validationResult = transformSchema.safeParse(options);

        if (!validationResult.success) {
            const errorMessages = validationResult.error.errors
                .map(err => err.message)
                .join('. ');

            return res.status(400).json(formatResponse(
                false, 
                null, 
                `Invalid transformation parameters: ${errorMessages}`
            ));
        }

        // If validation passes, get the clean validated data
        const validatedOptions = validationResult.data;

        // Find image
        const imageRecord = await Image.findOne({ _id: id, user: req.user._id });
        if (!imageRecord) {
            return res.status(404).json(formatResponse(false, null, 'Image not found'));
        }

        // Read original image
        const imageBuffer = await fs.readFile(imageRecord.filePath);

        // Process image using service
        const transformedBuffer = await ImageProcessingService.transformImage(imageBuffer, validatedOptions);

        // Send response
        const contentType = ImageProcessingService.getContentType(validatedOptions.format || 'jpeg');
        res.set('Content-Type', contentType);
        res.send(transformedBuffer);

    } catch (error) {
        console.error("Transform Error:", error);
        res.status(500).json(formatResponse(false, null, 'Server error while transforming image'));
    }
};

const deleteImage = async (req, res) => {
    try {
        await ImageProcessingService.deleteImage(req.params.id, req.user._id);
        res.json(formatResponse(true, null, 'Image deleted successfully'));
    } catch (error) {
        const status = error.message.includes('not found') ? 404 : 500;
        res.status(status).json(formatResponse(false, null, error.message));
    }
};


module.exports = {
    uploadImage,
    getImages,
    getSingleImage,
    transformImage,
    deleteImage
};
                