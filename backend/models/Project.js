const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    deadline: { type: Date },
    status: {
      type: String,
      enum: ['planning', 'active', 'completed', 'on_hold'],
      default: 'active',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Project', projectSchema);
