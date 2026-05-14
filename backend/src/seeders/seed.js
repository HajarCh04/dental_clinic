const bcrypt = require('bcryptjs');
const { sequelize, User, Patient, Appointment, Treatment, Invoice } = require('../models');

const seedDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    await sequelize.sync({ force: true });
    console.log('Database synchronized.');

    // Create Users — only assistant and dentist roles
    const assistantPassword = await bcrypt.hash('assistant123', 10);
    const dentistPassword = await bcrypt.hash('dentist123', 10);

    const assistant = await User.create({ name: 'Assistante (Principale)', email: 'assistant@clinic.com', password_hash: assistantPassword, role: 'assistant' });
    const assistant2 = await User.create({ name: 'Imane', email: 'imane@clinic.com', password_hash: assistantPassword, role: 'assistant' });
    const assistant3 = await User.create({ name: 'Leila', email: 'leila@clinic.com', password_hash: assistantPassword, role: 'assistant' });
    const dentist = await User.create({ name: 'Dentiste', email: 'dentist@clinic.com', password_hash: dentistPassword, role: 'dentist' });

    // Create Patients (Professional list)
    const patients = await Patient.bulkCreate([
      { first_name: 'Ahmed', last_name: 'Benali', email: 'ahmed@mail.com', phone: '0612345678', dob: '1985-05-12', gender: 'Male', address: '12 Rue de Paris, Casablanca', medical_notes: 'Allergique à la Pénicilline', insurance_type: 'CNSS', insurance_id: '123456789' },
      { first_name: 'Fatima', last_name: 'Zahra', email: 'fatima@mail.com', phone: '0623456789', dob: '1990-08-22', gender: 'Female', address: '34 Avenue Hassan II, Rabat', medical_notes: 'Asthme', insurance_type: 'AMO', insurance_id: 'AMO-987654' },
      { first_name: 'Ali', last_name: 'Haddad', email: 'ali@mail.com', phone: '0634567890', dob: '1975-12-05', gender: 'Male', address: '8 Rue des Fleurs, Marrakech', medical_notes: 'Aucun', insurance_type: 'Aucune' },
      { first_name: 'Yasmine', last_name: 'Chadli', email: 'yasmine@mail.com', phone: '0645678901', dob: '2000-01-30', gender: 'Female', address: '55 Blvd Mohammed V, Tanger', medical_notes: 'Diabète Type 2', insurance_type: 'CNSS', insurance_id: '55667788' },
      { first_name: 'Omar', last_name: 'Rhiwi', email: 'omar@mail.com', phone: '0656789012', dob: '1995-11-15', gender: 'Male', address: '12 Cite Al Amal, Agadir', medical_notes: 'Hypertension légère', insurance_type: 'Aucune' },
      { first_name: 'Nadia', last_name: 'Boumediene', email: 'nadia@mail.com', phone: '0667890123', dob: '1988-03-18', gender: 'Female', address: '22 Rue Ibn Sina, Fez', medical_notes: 'Aucun', insurance_type: 'CNSS', insurance_id: '99887766' },
      { first_name: 'Rachid', last_name: 'Amrani', email: 'rachid@mail.com', phone: '0678901234', dob: '1992-07-25', gender: 'Male', address: '15 Avenue Al Massira, Kenitra', medical_notes: 'Aucun', insurance_type: 'AMO', insurance_id: 'AMO-112233' },
      { first_name: 'Samira', last_name: 'El Fassi', email: 'samira@mail.com', phone: '0689012345', dob: '1983-11-02', gender: 'Female', address: '8 Rue Moulay Ismail, Meknes', medical_notes: 'Allergie au latex', insurance_type: 'Aucune' },
      { first_name: 'Karim', last_name: 'Mansouri', email: 'karim@mail.com', phone: '0690123456', dob: '1991-04-10', gender: 'Male', address: '45 Rue Oued Sebou, Salé', medical_notes: 'Fumeur', insurance_type: 'CNSS', insurance_id: '44556611' },
      { first_name: 'Meryem', last_name: 'Alami', email: 'meryem@mail.com', phone: '0633445566', dob: '1998-09-15', gender: 'Female', address: '12 Blvd Anfa, Casablanca', medical_notes: 'Grossesse (6 mois)', insurance_type: 'AMO', insurance_id: 'AMO-778899' },
    ]);

    // Create Appointments across multiple days
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    const dayAfter = new Date(today); dayAfter.setDate(today.getDate() + 2);
    const nextWeek = new Date(today); nextWeek.setDate(today.getDate() + 5);

    const mkDate = (base, h, m) => { const d = new Date(base); d.setHours(h, m, 0, 0); return d; };

    const appointments = await Appointment.bulkCreate([
      // Today — Office appointments
      { patient_id: patients[0].id, dentist_id: dentist.id, title: 'Consultation Initiale', start_time: mkDate(today, 9, 0), end_time: mkDate(today, 9, 30), status: 'scheduled', location: 'office' },
      { patient_id: patients[1].id, dentist_id: dentist.id, title: 'Obturation (Carie)', start_time: mkDate(today, 10, 0), end_time: mkDate(today, 11, 0), status: 'scheduled', location: 'office' },
      { patient_id: patients[3].id, dentist_id: dentist.id, title: 'Blanchiment Dentaire', start_time: mkDate(today, 14, 0), end_time: mkDate(today, 15, 0), status: 'completed', location: 'office' },
      { patient_id: patients[5].id, dentist_id: dentist.id, title: 'Détartrage & Polissage', start_time: mkDate(today, 15, 30), end_time: mkDate(today, 16, 0), status: 'scheduled', location: 'office' },
      { patient_id: patients[9].id, dentist_id: dentist.id, title: 'Urgence : Douleur aigue', start_time: mkDate(today, 16, 30), end_time: mkDate(today, 17, 15), status: 'scheduled', location: 'office' },
      
      // Yesterday — Completed
      { patient_id: patients[4].id, dentist_id: dentist.id, title: 'Extraction Dentaire', start_time: mkDate(yesterday, 9, 0), end_time: mkDate(yesterday, 10, 0), status: 'completed', location: 'office' },
      { patient_id: patients[6].id, dentist_id: dentist.id, title: 'Pose de Couronne', start_time: mkDate(yesterday, 11, 0), end_time: mkDate(yesterday, 12, 30), status: 'completed', location: 'office' },
      
      // Tomorrow — Office
      { patient_id: patients[2].id, dentist_id: dentist.id, title: 'Dévitalisation (Canal)', start_time: mkDate(tomorrow, 14, 0), end_time: mkDate(tomorrow, 15, 30), status: 'scheduled', location: 'office' },
      { patient_id: patients[7].id, dentist_id: dentist.id, title: 'Consultation Orthodontie', start_time: mkDate(tomorrow, 10, 0), end_time: mkDate(tomorrow, 10, 30), status: 'scheduled', location: 'office' },
      
      // HOSPITAL OPERATIONS
      { patient_id: patients[2].id, dentist_id: dentist.id, title: 'Chirurgie Maxillo-faciale', start_time: mkDate(tomorrow, 8, 0), end_time: mkDate(tomorrow, 12, 0), status: 'scheduled', location: 'hospital', notes: 'CHU Mohammed VI - Bloc 3' },
      { patient_id: patients[8].id, dentist_id: dentist.id, title: 'Extraction Dents de Sagesse (Incluses)', start_time: mkDate(dayAfter, 7, 30), end_time: mkDate(dayAfter, 11, 0), status: 'scheduled', location: 'hospital', notes: 'Hôpital Militaire - AG requise' },
    ]);

    // Create Treatments
    const treatments = await Treatment.bulkCreate([
      { patient_id: patients[3].id, dentist_id: dentist.id, appointment_id: appointments[2].id, procedure_name: 'Blanchiment au Laser', description: 'Blanchiment professionnel haute intensité.', cost: 2500.00, date: today },
      { patient_id: patients[4].id, dentist_id: dentist.id, appointment_id: appointments[5].id, procedure_name: 'Extraction Simple', description: 'Extraction de la 26 sous anesthésie locale.', cost: 600.00, date: yesterday },
      { patient_id: patients[6].id, dentist_id: dentist.id, appointment_id: appointments[6].id, procedure_name: 'Couronne Céramo-métallique', description: 'Pose définitive sur la 14.', cost: 3800.00, date: yesterday },
      { patient_id: patients[0].id, dentist_id: dentist.id, appointment_id: null, procedure_name: 'Détartrage Complet', description: 'Scaling ultrasonique et polissage par aéro-polisseur.', cost: 500.00, date: new Date(today.getTime() - 7 * 86400000) },
      { patient_id: patients[1].id, dentist_id: dentist.id, appointment_id: null, procedure_name: 'Obturation Composite', description: 'Restauration esthétique sur la 46.', cost: 850.00, date: new Date(today.getTime() - 14 * 86400000) },
      { patient_id: patients[5].id, dentist_id: dentist.id, appointment_id: null, procedure_name: 'Traitement Parodontal', description: 'Surfaçage radiculaire quadrant supérieur droit.', cost: 1200.00, date: new Date(today.getTime() - 20 * 86400000) },
    ]);

    // Create Invoices
    await Invoice.bulkCreate([
      { patient_id: patients[3].id, treatment_id: treatments[0].id, amount: 2500.00, paid_amount: 1000.00, estimated_reimbursement: 1750.00, reste_a_charge: 750.00, status: 'partial', due_date: new Date(today.getTime() + 30 * 86400000), issued_date: today },
      { patient_id: patients[4].id, treatment_id: treatments[1].id, amount: 600.00, paid_amount: 600.00, estimated_reimbursement: 0.00, reste_a_charge: 600.00, status: 'paid', due_date: yesterday, issued_date: yesterday },
      { patient_id: patients[6].id, treatment_id: treatments[2].id, amount: 3800.00, paid_amount: 500.00, estimated_reimbursement: 3040.00, reste_a_charge: 760.00, status: 'partial', due_date: new Date(today.getTime() + 15 * 86400000), issued_date: yesterday },
      { patient_id: patients[0].id, treatment_id: treatments[3].id, amount: 500.00, paid_amount: 500.00, estimated_reimbursement: 350.00, reste_a_charge: 150.00, status: 'paid', due_date: new Date(today.getTime() - 7 * 86400000), issued_date: new Date(today.getTime() - 7 * 86400000) },
      { patient_id: patients[1].id, treatment_id: treatments[4].id, amount: 850.00, paid_amount: 850.00, estimated_reimbursement: 680.00, reste_a_charge: 170.00, status: 'paid', due_date: new Date(today.getTime() + 7 * 86400000), issued_date: new Date(today.getTime() - 14 * 86400000) },
    ]);

    console.log('Mock data seeded successfully!');
    console.log('');
    console.log('Login credentials:');
    console.log('  Assistant: assistant@clinic.com / assistant123');
    console.log('  Dentist:   dentist@clinic.com / dentist123');
    process.exit(0);

  } catch (error) {
    console.error('Failed to seed DB:', error);
    process.exit(1);
  }
};

seedDatabase();

