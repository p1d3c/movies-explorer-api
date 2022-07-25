const BadRequest = require('../errors/BadRequest');
const Forbidden = require('../errors/Forbidden');
const NotFound = require('../errors/NotFound');
const Movie = require('../models/movie');

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
      next(new BadRequest('Ошибка валидации'));
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
      next(new NotFound('Фильм не найден'));
      return;
    }
    if (ownerId !== movieToDelete.owner.toString()) {
      next(new Forbidden('Чужие фильмы удалять нельзя'));
      return;
    }
    await Movie.findByIdAndRemove(req.params.movieId);
    res.send({ message: 'Фильм удален' });
  } catch (err) {
    if (err.name === 'CastError') {
      next(new BadRequest('Некорректный id фильма'));
      return;
    }
    next(err);
  }
};
