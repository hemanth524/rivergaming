const Message = require('../models/Message');

const sendMessage = async (req, res) => {
  const { content } = req.body;
  if (!content) return res.status(400).json({ message: 'Message content required' });

  const message = new Message({ user: req.user._id, content });
  await message.save();
  await message.populate('user', 'name'); // populate user name

  // Emit to all clients via Socket.IO
  const io = req.app.get('io');
  io.emit('receiveMessage', message); // send the whole message including populated user

  res.status(201).json({ message: 'Message sent', data: message });
};

const getMessages = async (req, res) => {
  const messages = await Message.find().populate('user', 'name').sort({ timestamp: 1 });
  res.status(200).json({ messages });
};

module.exports = { sendMessage, getMessages };
