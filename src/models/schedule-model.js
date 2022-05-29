const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');

autoIncrement.initialize(mongoose.connection);

const ScheduleSchema = new mongoose.Schema(
  {
    // auto incremented human readable task id other than _id of mongo
    scheduleId: {
      type: Number,
      required: true,
    },
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    workDate: {
      type: Date,
      required: true,
    },
    shiftLength: {
      type: Number, min: 0, max: 24, required: true,
    },
    // to soft delete schedules
    isDeleted: {
      type: Boolean,
      default: false,
    },
    // A task can be created by admin or self
    createdBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    strict: false,
    versionKey: false,
    bufferCommands: false,
    validateBeforeSave: true,
    timestamps: true,
  },
);

ScheduleSchema.plugin(autoIncrement.plugin, {
  model: 'Schedule',
  field: 'scheduleId',
  startAt: 1,
  incrementBy: 1,
});

module.exports = mongoose.model('Schedule', ScheduleSchema, 'schedules');
