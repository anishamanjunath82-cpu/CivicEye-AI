const sharp = require('sharp');

/**
 * Enhances an image for better feature detection.
 * @param {Buffer} inputBuffer 
 * @returns {Promise<{enhancedBuffer: Buffer, metadata: Object}>}
 */
async function enhanceImage(inputBuffer) {
    try {
        const image = sharp(inputBuffer);
        const metadata = await image.metadata();

        const enhancedBuffer = await image
            .normalize() // contrast normalization
            .gamma(1.8) // valid sharp gamma (1.0 to 3.0)
            .sharpen({ sigma: 1.5 }) // sharpen edges
            .modulate({
                brightness: 1.25,
                saturation: 1.2
            })
            .jpeg({ quality: 85 })
            .toBuffer();

        return {
            enhancedBuffer,
            metadata: {
                width: metadata.width,
                height: metadata.height,
                appliedFilters: ['normalize', 'gamma(1.8)', 'sharpen', 'modulate']
            }
        };
    } catch (error) {
        console.error("Image enhancement failed:", error);
        return { enhancedBuffer: inputBuffer, metadata: { error: 'Enhancement failed' } };
    }
}

/**
 * Aggressively enhances a night-time or low-light image.
 * @param {Buffer} inputBuffer 
 * @returns {Promise<{enhancedBuffer: Buffer, metadata: Object}>}
 */
async function enhanceNightImage(inputBuffer) {
    try {
        const image = sharp(inputBuffer);
        const metadata = await image.metadata();

        const enhancedBuffer = await image
            .normalize()
            .gamma(2.2) // Higher gamma correction
            .sharpen({ sigma: 2.0 }) // Stronger sharpening
            .modulate({
                brightness: 1.4,
                saturation: 1.15
            })
            .jpeg({ quality: 85 })
            .toBuffer();

        return {
            enhancedBuffer,
            metadata: {
                width: metadata.width,
                height: metadata.height,
                appliedFilters: ['normalize', 'gamma(2.2)', 'strong_sharpen', 'modulate']
            }
        };
    } catch (error) {
        console.error("Night image enhancement failed:", error);
        return { enhancedBuffer: inputBuffer, metadata: { error: 'Enhancement failed' } };
    }
}

module.exports = { enhanceImage, enhanceNightImage };
