const { GoogleGenerativeAI } = require('@google/generative-ai');

const chatController = async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey || apiKey === 'mock-key') {
       await new Promise(resolve => setTimeout(resolve, 1000));
       return res.json({ reply: `Echo: ${message} (Mock Gemini Response)` });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent(message);
    const response = await result.response;
    const reply = response.text();

    res.json({ reply });
  } catch (error) {
    console.error('Error connecting to Gemini:', error);
    res.status(500).json({ error: 'Failed to fetch response from Gemini AI' });
  }
};

module.exports = { chatController };
