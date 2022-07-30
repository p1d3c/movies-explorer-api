const bcrypt = require('bcrypt');
const User = require('../models/user');
const BadRequest = require('../errors/BadRequest');
const Conflict = require('../errors/Conflict');
const Unauthorized = require('../errors/Unauthorized');
const { getToken } = require('../middlewares/auth');
const { SALT_ROUNDS, MONGO_DUPLICATE_KEY, userErrorMessages } = require('../utils/constants');

module.exports.getMyProfile = async (req, res, next) => {
  try {
    const { id } = req.user;
    const user = await User.findById(id);
    res.status(200).send({ data: user });
  } catch (err) {
    next(err);
  }
};

module.exports.updateUserProfile = async (req, res, next) => {
  const { name, email } = req.body;
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { name, email },
      { new: true, runValidators: true },
    );
    res.send({ data: updatedUser });
  } catch (err) {
    if (err.code === MONGO_DUPLICATE_KEY) {
      next(new Conflict(userErrorMessages.emailConflict));
      return;
    }
    if (err.name === 'ValidationError') {
      next(new BadRequest(`${Object.values(err.errors).map((error) => error.message).join(', ')}`));
      return;
    }
    if (err.name === 'CastError') {
      next(new BadRequest(userErrorMessages.userNotFound));
      return;
    }
    next(err);
  }
};

module.exports.createUser = async (req, res, next) => {
  const {
    email, password, name,
  } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user) {
      next(new Conflict(userErrorMessages.emailConflict));
      return;
    }
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    let newUser = await User.create({
      email, password: hash, name,
    });
    newUser = newUser.toObject();
    delete newUser.password;
    res.status(201).send({ data: newUser });
  } catch (err) {
    if (err.name === 'ValidationError') {
      next(new BadRequest(userErrorMessages.validationError));
      return;
    }
    next(err);
  }
};

module.exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      next(new Unauthorized(userErrorMessages.unauthorized));
      return;
    }
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      next(new Unauthorized(userErrorMessages.unauthorized));
      return;
    }

    const token = await getToken(user._id);

    res.send({ token });
  } catch (err) {
    if (err.name === 'ValidationError') {
      next(new BadRequest(userErrorMessages.unauthorized));
      return;
    }
    next(err);
  }
};
