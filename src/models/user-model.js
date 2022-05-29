const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const autoIncrement = require('mongoose-auto-increment');
const Config = require('../utilities/config');
const LoggerService = require('../utilities/logger');
const { userRoles } = require('./constants');

const logger = new LoggerService('models/user-model');

const emailRegex = /^([\w-.]+@([\w-]+\.)+[\w-]{2,4})?$/;
autoIncrement.initialize(mongoose.connection);

const UserSchema = new mongoose.Schema(
  {
    // auto incremented human readable user id other than _id of mongo
    userId: {
      type: Number,
      required: true,
    },
    userName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: [emailRegex, 'Please enter a valid email address'],
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    // Assuming a user can have a single role at a time
    role: {
      type: String,
      enum: Object.values(userRoles),
      default: userRoles.USER,
    },
    createdBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      default: null,
    },
    // to soft delete users
    isDeleted: {
      type: Boolean,
      default: false,
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

/**
 * This is the middleware to hash user password, It will be called before saving any new record
 */
UserSchema.pre('save', function preSave(next) {
  // eslint-disable-next-line no-use-before-define
  User.findOne({ email: this.email }, 'email', async (error, result) => {
    if (error) {
      next(new Error(error));
    } else if (result) {
      next(new Error(`${this.email} already exists, please login`));
    } else if (this.password && this.isNew) {
      const hash = await bcrypt.hash(this.password, Config.get('BCRYPT_SALT_FACTOR', 10));
      this.password = hash;
      next();
    } else {
      next();
    }
  });
});

UserSchema.methods.isValidPassword = async function isValidPassword(password) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (error) {
    logger.error('error while comparing password >> ', { error });
    throw error;
  }
};

UserSchema.plugin(autoIncrement.plugin, {
  model: 'User',
  field: 'userId',
  startAt: 1,
  incrementBy: 1,
});

const User = mongoose.model('User', UserSchema, 'users');

module.exports = User;
