const User = require('../models/Users');

const topUpWallet = async (req, res) => {
  const { userId, amount } = req.body;

  // Admin check
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }

  if (!userId || !amount || amount <= 0) {
    return res.status(400).json({ message: 'Invalid userId or amount' });
  }

  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: 'User not found' });

  user.walletPoints += amount;
  await user.save();

  res.status(200).json({ message: 'Wallet topped up', walletPoints: user.walletPoints });
};

module.exports = { topUpWallet };
