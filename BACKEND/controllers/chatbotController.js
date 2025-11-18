const { handleChatQuery } = require('../services/chatbotService');

exports.chatbotController = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Message cannot be empty.'
      });
    }

    const result = await handleChatQuery({
      message,
      userId,
      role
    });

    return res.json({
      success: true,
      reply: result.reply,
      intent: result.intent,
      type: result.type || null, 
      data: result.data || null,
      dbData: result.dbData || null,
      actionResult: result.actionResult || null
    });

  } catch (err) {
    console.error('Chatbot Controller Error:', err.message);
    res.status(500).json({
      success: false,
      error: 'Internal server error.'
    });
  }
};
