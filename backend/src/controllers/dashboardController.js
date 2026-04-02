const { Patient, Appointment, Invoice, Treatment, User } = require('../models');
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
        start_time: { [Op.gte]: today, [Op.lt]: tomorrow }
      }
    });

    const revenueResult = await Invoice.sum('paid_amount');
    const totalRevenue = revenueResult || 0;

    const pendingInvoices = await Invoice.count({
      where: { status: { [Op.in]: ['unpaid', 'partial'] } }
    });

    // Recent appointments for admin dashboard
    const recentAppointments = await Appointment.findAll({
      include: [
        { model: Patient, as: 'patient', attributes: ['first_name', 'last_name'] },
        { model: User, as: 'dentist', attributes: ['name'] }
      ],
      order: [['start_time', 'DESC']],
      limit: 5
    });

    // Recent patients
    const recentPatients = await Patient.findAll({
      order: [['created_at', 'DESC']],
      limit: 5
    });

    res.json({
      totalPatients,
      todayAppointments,
      totalRevenue,
      pendingInvoices,
      recentAppointments,
      recentPatients
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching stats' });
  }
};

const getDentistStats = async (req, res) => {
  try {
    const dentistId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // My appointments today
    const myTodayAppointments = await Appointment.findAll({
      where: {
        dentist_id: dentistId,
        start_time: { [Op.gte]: today, [Op.lt]: tomorrow }
      },
      include: [
        { model: Patient, as: 'patient', attributes: ['first_name', 'last_name', 'phone'] }
      ],
      order: [['start_time', 'ASC']]
    });

    // My total patients (distinct)
    const myPatientCount = await Appointment.count({
      where: { dentist_id: dentistId },
      distinct: true,
      col: 'patient_id'
    });

    // My completed today
    const completedToday = await Appointment.count({
      where: {
        dentist_id: dentistId,
        status: 'completed',
        start_time: { [Op.gte]: today, [Op.lt]: tomorrow }
      }
    });

    // My recent treatments
    const myRecentTreatments = await Treatment.findAll({
      where: { dentist_id: dentistId },
      include: [
        { model: Patient, as: 'patient', attributes: ['first_name', 'last_name'] }
      ],
      order: [['created_at', 'DESC']],
      limit: 5
    });

    res.json({
      myTodayAppointments,
      myPatientCount,
      completedToday,
      todayTotal: myTodayAppointments.length,
      myRecentTreatments
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching dentist stats' });
  }
};

module.exports = { getDashboardStats, getDentistStats };
