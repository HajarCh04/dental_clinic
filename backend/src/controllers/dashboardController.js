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

    const recentAppointments = await Appointment.findAll({
      include: [
        { model: Patient, as: 'patient', attributes: ['first_name', 'last_name'] },
        { model: User, as: 'dentist', attributes: ['name'] }
      ],
      order: [['start_time', 'DESC']],
      limit: 5
    });

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

    const myPatientCount = await Appointment.count({
      where: { dentist_id: dentistId },
      distinct: true,
      col: 'patient_id'
    });

    const completedToday = await Appointment.count({
      where: {
        dentist_id: dentistId,
        status: 'completed',
        start_time: { [Op.gte]: today, [Op.lt]: tomorrow }
      }
    });

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

const getAnalytics = async (req, res) => {
  try {
    // We will do straightforward JS aggregation for compatibility.
    // 1. Patient growth (last 6 months)
    const patients = await Patient.findAll({ attributes: ['created_at'] });
    const growthMap = {};
    patients.forEach(p => {
      const month = new Date(p.created_at).toLocaleString('default', { month: 'short' });
      growthMap[month] = (growthMap[month] || 0) + 1;
    });
    const patientGrowth = Object.entries(growthMap).map(([name, count]) => ({ name, patients: count }));

    // 2. Revenue breakdown (last 6 months)
    const invoices = await Invoice.findAll({ attributes: ['paid_amount', 'issued_date'] });
    const revenueMap = {};
    invoices.forEach(inv => {
      const month = new Date(inv.issued_date || new Date()).toLocaleString('default', { month: 'short' });
      revenueMap[month] = (revenueMap[month] || 0) + Number(inv.paid_amount);
    });
    const revenueTrend = Object.entries(revenueMap).map(([name, total]) => ({ name, revenue: total }));

    // 3. Most common treatments
    const treatments = await Treatment.findAll({ attributes: ['procedure_name'] });
    const treatmentMap = {};
    treatments.forEach(t => {
      treatmentMap[t.procedure_name] = (treatmentMap[t.procedure_name] || 0) + 1;
    });
    const commonTreatments = Object.entries(treatmentMap)
      .map(([name, count]) => ({ name, value: count }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // top 5

    res.json({
      patientGrowth,
      revenueTrend,
      commonTreatments
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching analytics' });
  }
};

module.exports = { getDashboardStats, getDentistStats, getAnalytics };
