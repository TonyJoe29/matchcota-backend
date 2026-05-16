const chatModel = require('../models/chat.model');

const listConversations = async (req, res, next) => {
  try {
    const data = await chatModel.listConversations(req.user);
    res.json({ data });
  } catch (error) {
    next(error);
  }
};

const openSupportChat = async (req, res, next) => {
  try {
    const conversation = await chatModel.getOrCreateSupportConversation(req.user);
    res.status(201).json({ conversation });
  } catch (error) {
    next(error);
  }
};

const openAdoptionChat = async (req, res, next) => {
  try {
    const conversation = await chatModel.getOrCreateAdoptionConversation(
      req.params.requestId,
      req.user
    );
    res.status(201).json({ conversation });
  } catch (error) {
    next(error);
  }
};

const listMessages = async (req, res, next) => {
  try {
    const data = await chatModel.listMessages(req.params.id, req.user);
    res.json({ data });
  } catch (error) {
    next(error);
  }
};

const sendMessage = async (req, res, next) => {
  try {
    const message = await chatModel.sendMessage(req.params.id, req.user, req.body.message);
    res.status(201).json({ message });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listConversations,
  openSupportChat,
  openAdoptionChat,
  listMessages,
  sendMessage
};
