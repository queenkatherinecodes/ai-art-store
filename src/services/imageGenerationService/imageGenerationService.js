const OpenAI = require("openai");
const fs = require('fs');
const https = require('https');
const path = require('path');
const config = require('../../config');
process.env.OPENAI_API_KEY = config.OPENAI_API_KEY;

const openai = new OpenAI();

// Define the path for storing images
const imagesDir = path.join(__dirname, '../../public/images');

function downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            if (res.statusCode === 200) {
                res.pipe(fs.createWriteStream(filepath))
                    .on('error', reject)
                    .once('close', () => resolve(filepath));
            } else {
                res.resume();
                reject(new Error(`Request Failed With a Status Code: ${res.statusCode}`));
            }
        });
    });
}

function sanitizeFilename(name) {
    return name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
}

async function generateImage(prompt) {
    try {
        const image = await openai.images.generate({ prompt: prompt, size: "256x256", model: "dall-e-2" });
        console.log(image.data);

        // Download the generated image
        const imageUrl = image.data[0].url;
        const filename = `${sanitizeFilename(prompt)}.png`;
        const filepath = path.join(imagesDir, filename);

        // Ensure the images directory exists
        fs.mkdirSync(imagesDir, { recursive: true });

        // Check if file already exists, if so, throw an error
        if (fs.existsSync(filepath)) {
            throw new Error('A product with this name already exists. Please use a different prompt.');
        }

        const downloadedPath = await downloadImage(imageUrl, filepath);

        return {
            apiResponse: image,
            localFilePath: downloadedPath,
            product: {
                id: path.parse(filepath).name,
                title: prompt,
                imageUrl: `/images/${filename}`
            }
        };
    } catch (error) {
        console.error("Error generating or downloading image:", error);
        throw error;
    }
}

module.exports = { generateImage };

// sanity check
// async function main() {
//     try {
//         const result = await generateImage("feminists destroying the patriarchy finally");
//         console.log("API Response:", result.apiResponse);
//         console.log("Image downloaded to:", result.localFilePath);
//     } catch (error) {
//         console.error("An error occurred:", error.message);
//     }
// }

// main();