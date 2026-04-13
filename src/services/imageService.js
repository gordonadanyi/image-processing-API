const sharp = require('sharp');
const fs = require('fs').promises;
const Image = require('../models/Image')


class ImageProcessingService {

        /**
     * Add text watermark to image
     */
    /**
     * Add text watermark - Improved version
     */
    async addWatermark(sharpImage, watermarkText, position = 'bottom-right', opacity = 0.8) {
        if (!watermarkText || watermarkText.trim() === '') {
            return sharpImage;
        }

        const { width, height } = await sharpImage.metadata();

        // Make font size proportional to image size
        const fontSize = Math.max(24, Math.floor(Math.min(width, height) * 0.07));

        // Create SVG for watermark
        const svgBuffer = Buffer.from(`
            <svg width="${width}" height="${height}">
                <text 
                    x="${this.getXPosition(position, width)}" 
                    y="${this.getYPosition(position, height)}" 
                    font-family="Arial Black, sans-serif" 
                    font-size="${fontSize}" 
                    font-weight="bold"
                    fill="#FFFFFF" 
                    opacity="${opacity}"
                    text-anchor="middle" 
                    dominant-baseline="middle"
                    style="text-shadow: 3px 3px 6px rgba(0,0,0,0.8);">
                    ${watermarkText}
                </text>
            </svg>
        `);

        return sharpImage.composite([{
            input: svgBuffer,
            gravity: this.getGravity(position),
            blend: 'over'
        }]);
    }

    getXPosition(position, width) {
        if (position.includes('left')) return width * 0.1;
        if (position.includes('right')) return width * 0.9;
        return width / 2; // center
    }

    getYPosition(position, height) {
        if (position.includes('top')) return height * 0.1;
        if (position.includes('bottom')) return height * 0.9;
        return height / 2;
    }

    getGravity(position) {
        const map = {
            'top-left': 'northwest',
            'top-center': 'north',
            'top-right': 'northeast',
            'center': 'center',
            'bottom-left': 'southwest',
            'bottom-center': 'south',
            'bottom-right': 'southeast'
        };
        return map[position] || 'southeast';
    }


    /**
     * Transform image based on query parameters
     * @param {Buffer} imageBuffer - Original image buffer
     * @param {Object} options - Transformation options from query
     * @returns {Promise<Buffer>} - Processed image buffer
     */

    async uploadImage(userId, file) {
        const newImage = await Image.create({
            user: userId,
            originalName: file.originalname,
            filename: file.filename,
            filePath: file.path,
            mimetype: file.mimetype,
            size: file.size
        });

        return {
            id: newImage._id,
            originalName: newImage.originalName,
            filename: newImage.filename,
            size: newImage.size,
            uploadedAt: newImage.createdAt
        };
    }

    async getUserImages(userId) {
        return await Image.find({ user: userId })
            .select('originalName filename mimetype size createdAt')
            .sort({ createdAt: -1 });
    }

    // Get Single Image Record
    async getImageById(imageId, userId) {
        const image = await Image.findOne({ _id: imageId, user: userId });
        if (!image) {
            throw new Error('Image not found or access denied');
        }
        return image;
    }

    async transformImage(imageBuffer, options = {}){
        let sharpImage = sharp(imageBuffer);

        const {
            resize,
            crop,
            rotate,
            flip,
            mirror,
            grayscale,
            sepia,
            format = 'jpeg',
            quality = 80
        } = options;


                // Watermark
                if (options.watermark) {
                    sharpImage = await this.addWatermark(
                        sharpImage, 
                        options.watermark, 
                        options.position || 'bottom-right', 
                        parseFloat(options.opacity) || 0.7
                    );
                }

        // Resize
        if (resize) {
            const [width, height] = resize.split('x').map(Number);
            if (!isNaN(width) && !isNaN(height)) {
                sharpImage = sharpImage.resize(width, height, {
                    fit: 'inside',
                    withoutEnlargement: true
                });
            }
        }

        // Crop
        if (crop) {
            const [left, top, width, height] = crop.split(',').map(Number);
            if (!isNaN(left) && !isNaN(top) && !isNaN(width) && !isNaN(height)) {
                sharpImage = sharpImage.extract({ left, top, width, height });
            }
        }

        // Rotate
        if (rotate && !isNaN(parseInt(rotate))) {
            sharpImage = sharpImage.rotate(parseInt(rotate));
        }

        // Flip & Mirror
        if (flip === 'true' || flip === true) sharpImage = sharpImage.flip();
        if (mirror === 'true' || mirror === true) sharpImage = sharpImage.flop();

        // Filters
        if (grayscale === 'true' || grayscale === true) {
            sharpImage = sharpImage.grayscale();
        }
        if (sepia === 'true' || sepia === true) {
            sharpImage = sharpImage.sepia();
        }

        // Format & Quality
        const outputFormat = format.toLowerCase();
        let outputOptions = { quality: parseInt(quality) };

        if (['jpeg', 'jpg'].includes(outputFormat)) {
            outputOptions = { quality: parseInt(quality), mozjpeg: true };
        } else if (outputFormat === 'webp') {
            outputOptions = { quality: parseInt(quality) };
        } else if (outputFormat === 'png') {
            outputOptions = { compressionLevel: 8 };
        }

        // Process and return buffer
        return await sharpImage
            .toFormat(outputFormat, outputOptions)
            .toBuffer();
    }

    /**
     * Get content type based on format
     */
    getContentType(format) {
        const outputFormat = format.toLowerCase();
        if (outputFormat === 'png') return 'image/png';
        if (outputFormat === 'webp') return 'image/webp';
        return 'image/jpeg'; // default
    }

    /**
     * Validate transformation options (basic)
     */
    validateOptions(options) {
        const errors = [];

        if (options.resize && !/^\d+x\d+$/.test(options.resize)) {
            errors.push('Invalid resize format. Use widthxheight (e.g. 800x600)');
        }

        if (options.crop && !/^\d+,\d+,\d+,\d+$/.test(options.crop)) {
            errors.push('Invalid crop format. Use left,top,width,height');
        }

        return errors;
    }

    async deleteImage(imageId, userId) {
        const image = await this.getImageById(imageId, userId);

        // Delete physical file
        await fs.unlink(image.filePath).catch(err => {
            console.warn('File deletion warning:', err.message);
        });

        // Delete from database
        await Image.deleteOne({ _id: image._id });

        return { message: 'Image deleted successfully' };
    }

}
module.exports = new ImageProcessingService();