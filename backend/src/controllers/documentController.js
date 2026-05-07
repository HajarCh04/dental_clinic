const { Document } = require('../models');
const fs = require('fs');
const path = require('path');

exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier reçu' });
    }
    
    const { patient_id, title, type_document } = req.body;
    
    if (!patient_id) {
      return res.status(400).json({ message: 'ID patient manquant' });
    }

    const doc = await Document.create({
      patient_id,
      title: title || req.file.originalname,
      type_document: type_document || 'autre',
      file_path: `/uploads/${req.file.filename}`
    });

    res.status(201).json(doc);
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ message: 'Erreur lors du téléchargement' });
  }
};

exports.getPatientDocuments = async (req, res) => {
  try {
    const documents = await Document.findAll({
      where: { patient_id: req.params.id },
      order: [['uploaded_at', 'DESC']]
    });
    res.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ message: 'Erreur du serveur' });
  }
};

exports.deleteDocument = async (req, res) => {
  try {
    const doc = await Document.findByPk(req.params.id);
    if (!doc) {
      return res.status(404).json({ message: 'Document introuvable' });
    }
    
    // Remove file from disk
    const fullPath = path.join(__dirname, '../../public', doc.file_path);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
    
    await doc.destroy();
    res.json({ message: 'Document supprimé' });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression' });
  }
};
