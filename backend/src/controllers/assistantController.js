const { User } = require('../models');
const bcrypt = require('bcryptjs');

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

exports.createAssistant = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if email already exists
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé.' });
    }

    const password_hash = await bcrypt.hash(password || 'assistant123', 10);
    
    const assistant = await User.create({
      name,
      email,
      password_hash,
      role: 'assistant'
    });

    res.status(201).json({
      id: assistant.id,
      name: assistant.name,
      email: assistant.email,
      role: assistant.role
    });
  } catch (error) {
    console.error('Error creating assistant:', error);
    res.status(500).json({ message: 'Erreur lors de la création de l\'assistante' });
  }
};

exports.updateAssistant = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const assistant = await User.findOne({ where: { id: req.params.id, role: 'assistant' } });

    if (!assistant) {
      return res.status(404).json({ message: 'Assistante non trouvée' });
    }

    if (name) assistant.name = name;
    if (email) {
      const existing = await User.findOne({ where: { email } });
      if (existing && existing.id !== assistant.id) {
        return res.status(400).json({ message: 'Email déjà utilisé' });
      }
      assistant.email = email;
    }
    
    if (password) {
      assistant.password_hash = await bcrypt.hash(password, 10);
    }

    await assistant.save();
    res.json({
      id: assistant.id,
      name: assistant.name,
      email: assistant.email,
      role: assistant.role
    });
  } catch (error) {
    console.error('Error updating assistant:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour' });
  }
};

exports.deleteAssistant = async (req, res) => {
  try {
    const assistant = await User.findOne({ where: { id: req.params.id, role: 'assistant' } });
    if (!assistant) {
      return res.status(404).json({ message: 'Assistante non trouvée' });
    }

    await assistant.destroy();
    res.json({ message: 'Assistante supprimée avec succès' });
  } catch (error) {
    console.error('Error deleting assistant:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression' });
  }
};
