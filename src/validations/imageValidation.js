// validations/imageValidation.js
const { z } = require('zod');

// Schema for transformation query parameters
const transformSchema = z.object({
    resize: z.string()
        .optional()
        .refine(val => !val || /^\d+x\d+$/.test(val), {
            message: "Resize must be in format: widthxheight (example: 800x600)"
        }),

    crop: z.string()
        .optional()
        .refine(val => !val || /^\d+,\d+,\d+,\d+$/.test(val), {
            message: "Crop must be in format: left,top,width,height (example: 100,100,400,300)"
        }),

    rotate: z.string()
        .optional()
        .refine(val => !val || /^\d+$/.test(val), {
            message: "Rotate must be a number (example: 90)"
        })
        .transform(val => val ? parseInt(val) : undefined),

    flip: z.enum(['true', 'false', '1', '0']).optional()
        .transform(val => val === 'true' || val === '1'),

    mirror: z.enum(['true', 'false', '1', '0']).optional()
        .transform(val => val === 'true' || val === '1'),

    grayscale: z.enum(['true', 'false', '1', '0']).optional()
        .transform(val => val === 'true' || val === '1'),

    sepia: z.enum(['true', 'false', '1', '0']).optional()
        .transform(val => val === 'true' || val === '1'),

    format: z.enum(['jpeg', 'jpg', 'png', 'webp']).optional().default('jpeg'),

    quality: z.string()
        .optional()
        .refine(val => !val || (parseInt(val) >= 1 && parseInt(val) <= 100), {
            message: "Quality must be between 1 and 100"
        })
        .transform(val => val ? parseInt(val) : 80)
});

module.exports = {
    transformSchema
};