const mongoose = require('mongoose');

const otherDocSchema = new mongoose.Schema({
  name: String,
  fileURL: String
});

const uploadedDocSchema = new mongoose.Schema({
  key: String,
  label: String,
  url: String,
  uploadedAt: Date
});

const requiredDocSchema = new mongoose.Schema({
  key: String,
  label: String
});

const employeeDocumentsSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  experienceLevel: { type: String, enum: ['fresher','experienced'], default: 'fresher' },
  requiredDocs: [requiredDocSchema],
  uploadedDocs: [uploadedDocSchema],
  otherDocs: [otherDocSchema],
  signatureURL: String,
  completionPercent: { type: Number, default: 0 },
  aadharVerified: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('EmployeeDocuments', employeeDocumentsSchema);
