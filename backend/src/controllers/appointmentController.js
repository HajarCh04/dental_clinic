const { Appointment, Patient, User } = require('../models');

const getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.findAll({
      include: [
        { model: Patient, as: 'patient', attributes: ['first_name', 'last_name'] },
        { model: User, as: 'dentist', attributes: ['name'] }
      ]
    });
    res.json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error retrieving appointments' });
  }
};

const createAppointment = async (req, res) => {
  try {
    const { patient_id, dentist_id, title, start_time, end_time, status, notes } = req.body;
    const appointment = await Appointment.create({
      patient_id, dentist_id, title, start_time, end_time, status, notes
    });
    res.status(201).json(appointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error creating appointment' });
  }
};

const updateAppointment = async (req, res) => {
  try {
    const appt = await Appointment.findByPk(req.params.id);
    if (!appt) return res.status(404).json({ message: 'Appointment not found' });

    await appt.update(req.body);
    res.json(appt);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating appointment' });
  }
};

const deleteAppointment = async (req, res) => {
  try {
    const appt = await Appointment.findByPk(req.params.id);
    if (!appt) return res.status(404).json({ message: 'Appointment not found' });
    
    await appt.destroy();
    res.json({ message: 'Appointment cancelled' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error deleting appointment' });
  }
};

module.exports = {
  getAppointments, createAppointment, updateAppointment, deleteAppointment
};
