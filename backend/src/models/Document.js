const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Document = sequelize.define('Document', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  patient_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type_document: {
    type: DataTypes.ENUM('facture', 'ordonnance', 'feuille_de_soins', 'autre'),
    defaultValue: 'autre',
  },
  file_path: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  timestamps: true,
  createdAt: 'uploaded_at',
  updatedAt: false,
});

module.exports = Document;
