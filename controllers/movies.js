const BadRequest = require('../errors/BadRequest');
const Forbidden = require('../errors/Forbidden');
const NotFound = require('../errors/NotFound');
const Movie = require('../models/movie');
const { movieErrorMessages, movieResponseMessages } = require('../utils/constants');

module.exports.getMovies = async (req, res, next) => {
  try {
    const movies = await Movie.find({});
    res.send({ data: movies });
  } catch (err) {
    next(err);
  }
};

module.exports.createMovie = async (req, res, next) => {
  const {
    country, director, duration,
    year, description, image, trailerLink,
    nameRU, nameEN, thumbnail, movieId,
  } = req.body;
  const owner = req.user.id;
  try {
    const newMovie = await Movie.create({
      country,
      director,
      duration,
      year,
      description,
      image,
      trailerLink,
      nameRU,
      nameEN,
      thumbnail,
      movieId,
      owner,
    });
    res.status(201).send({ newMovie });
  } catch (err) {
    if (err.name === 'ValidationError') {
      next(new BadRequest(movieErrorMessages.validationError));
      return;
    }
    next(err);
  }
};

module.exports.deleteMovie = async (req, res, next) => {
  const ownerId = req.user.id;
  try {
    const movieToDelete = await Movie.findById(req.params.movieId);
    if (!movieToDelete) {
      next(new NotFound(movieErrorMessages.movieNotFound));
      return;
    }
    if (ownerId !== movieToDelete.owner.toString()) {
      next(new Forbidden(movieErrorMessages.forbiddenDelete));
      return;
    }
    await Movie.findByIdAndRemove(req.params.movieId);
    res.send({ message: movieResponseMessages.successDelete });
  } catch (err) {
    if (err.name === 'CastError') {
      next(new BadRequest(movieErrorMessages.validationError));
      return;
    }
    next(err);
  }
};
