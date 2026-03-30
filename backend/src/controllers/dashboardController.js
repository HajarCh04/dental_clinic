const { Patient, Appointment, Invoice } = require('../models');
const { Op } = require('sequelize');

const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const totalPatients = await Patient.count();
    
    const todayAppointments = await Appointment.count({
      where: {
        start_time: {
          [Op.gte]: today,
          [Op.lt]: tomorrow
        }
      }
    });

    const revenueResult = await Invoice.sum('paid_amount');
    const totalRevenue = revenueResult || 0;

    const pendingInvoices = await Invoice.count({
      where: {
        status: {
          [Op.in]: ['unpaid', 'partial']
        }
      }
    });

    res.json({
      totalPatients,
      todayAppointments,
      totalRevenue,
      pendingInvoices
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching stats' });
  }
};

module.exports = { getDashboardStats };
