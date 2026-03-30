const bcrypt = require('bcryptjs');
const { sequelize, User, Patient, Appointment, Treatment, Invoice } = require('../models');

const seedDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    // Sync all models (force: true will drop existing tables)
    await sequelize.sync({ force: true });
    console.log('Database synchronized.');

    // Create Users
    const adminPassword = await bcrypt.hash('admin123', 10);
    const dentistPassword = await bcrypt.hash('dentist123', 10);
    const assistantPassword = await bcrypt.hash('assistant123', 10);

    const admin = await User.create({ name: 'Admin Boss', email: 'admin@clinic.com', password_hash: adminPassword, role: 'admin' });
    const dentist = await User.create({ name: 'Dr. Karim', email: 'karim@clinic.com', password_hash: dentistPassword, role: 'dentist' });
    const assistant = await User.create({ name: 'Sarah', email: 'sarah@clinic.com', password_hash: assistantPassword, role: 'assistant' });

    // Create Patients (Arabic/French names)
    const patients = await Patient.bulkCreate([
      { first_name: 'Ahmed', last_name: 'Benali', email: 'ahmed@mail.com', phone: '0612345678', dob: '1985-05-12', gender: 'Male', address: '12 Rue de Paris', medical_notes: 'Allergic to Penicillin' },
      { first_name: 'Fatima', last_name: 'Zahra', email: 'fatima@mail.com', phone: '0623456789', dob: '1990-08-22', gender: 'Female', address: '34 Avenue Hassan II', medical_notes: 'Asthma' },
      { first_name: 'Ali', last_name: 'Haddad', email: 'ali@mail.com', phone: '0634567890', dob: '1975-12-05', gender: 'Male', address: '8 Rue des Fleurs', medical_notes: 'None' },
      { first_name: 'Yasmine', last_name: 'Chadli', email: 'yasmine@mail.com', phone: '0645678901', dob: '2000-01-30', gender: 'Female', address: '55 Blvd Mohammed V', medical_notes: 'Diabetes Type 2' },
      { first_name: 'Omar', last_name: 'Rhiwi', email: 'omar@mail.com', phone: '0656789012', dob: '1995-11-15', gender: 'Male', address: '12 Cite Al Amal', medical_notes: 'None' },
    ]);

    // Create Appointments
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const appointments = await Appointment.bulkCreate([
      { patient_id: patients[0].id, dentist_id: dentist.id, title: 'Checkup', start_time: new Date(today.setHours(9, 0, 0)), end_time: new Date(today.setHours(9, 30, 0)), status: 'scheduled' },
      { patient_id: patients[1].id, dentist_id: dentist.id, title: 'Cavity Filling', start_time: new Date(today.setHours(10, 0, 0)), end_time: new Date(today.setHours(11, 0, 0)), status: 'scheduled' },
      { patient_id: patients[2].id, dentist_id: dentist.id, title: 'Root Canal', start_time: new Date(tomorrow.setHours(14, 0, 0)), end_time: new Date(tomorrow.setHours(15, 30, 0)), status: 'scheduled' },
      { patient_id: patients[3].id, dentist_id: dentist.id, title: 'Teeth Whitening', start_time: new Date(today.setHours(15, 0, 0)), end_time: new Date(today.setHours(16, 0, 0)), status: 'completed' }
    ]);

    // Create Treatments
    const treatment1 = await Treatment.create({
      patient_id: patients[3].id,
      dentist_id: dentist.id,
      appointment_id: appointments[3].id,
      procedure_name: 'Teeth Whitening',
      description: 'Standard laser teeth whitening procedure.',
      cost: 1500.00,
      date: new Date()
    });

    // Create Invoices
    await Invoice.create({
      patient_id: patients[3].id,
      treatment_id: treatment1.id,
      amount: 1500.00,
      paid_amount: 500.00,
      status: 'partial',
      due_date: new Date(tomorrow.setDate(tomorrow.getDate() + 30))
    });

    console.log('Mock data seeded successfully!');
    process.exit(0);

  } catch (error) {
    console.error('Failed to seed DB:', error);
    process.exit(1);
  }
};

seedDatabase();
