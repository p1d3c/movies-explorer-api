const allowedCors = [

];

const limiterSettings = {
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
};

module.exports = {
  allowedCors,
  limiterSettings,
};
