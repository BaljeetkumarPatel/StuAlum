const { generateWithGemini } = require('../utils/gemini');
const { generateMockGrammar } = require('../utils/mockResponses');

const hasGeminiKey = !!process.env.GEMINI_API_KEY;

exports.checkGrammar = async (req, res, next) => {
    console.log(" Grammar API hit with text:", req.body.text);
    try {
        const { text } = req.body;
        if (!text || text.trim() === '') {
            return res.status(400).json({ error: 'Please provide some text.' });
        }

        if (!hasGeminiKey) {
            const mock = await generateMockGrammar(text);
            return res.json({ result: mock, warning: 'Something went wrong please try after some time!' });
        }

        const prompt = `Check grammar of the following text: "${text}"`;
        const corrected = await generateWithGemini(prompt);
        res.json({ result: corrected });
    } catch (error) {
        next(error);
    }
};
