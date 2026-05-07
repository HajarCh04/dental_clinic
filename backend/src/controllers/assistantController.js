const { User } = require('../models');

exports.getAssistants = async (req, res) => {
  try {
    const assistants = await User.findAll({
      where: { role: 'assistant' },
      attributes: ['id', 'name', 'email', 'created_at']
    });
    res.json(assistants);
  } catch (error) {
    console.error('Error fetching assistants:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
