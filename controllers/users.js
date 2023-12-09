const User = require("../models/user");

const getUsers = (req, res) => {
  User.find({})
    .then((users) => res.status(200).send(users))
    .catch((err) => res.status(500).send({ message: err.message }));
};

const getUser = (req, res) => {
  User.findById(req.params.userId)
    .then((user) => {
      if (!user) {
        return res.status(404).send({ message: "Пользователь не найден" });
      }
      return res.status(200).send(user);
    })
    .catch((err) => {
      if (err.name === "CastError") {
        return res
          .status(400)
          .send({ message: "Пользователь по указанному _id не найден" });
      }
      return res.status(500).send({ message: err.message });
    });
};

const createUser = (req, res) => {
  const userData = req.body;
  User.create(userData)
    .then((user) => res.status(200).send(user))
    .catch((err) => {
      if (err.name === "ValidationError") {
        return res.status(400).send({
          message: "Переданы некорректные данные при создании пользователя",
        });
      }
      return res.status(500).send({ message: err.message });
    });
};

const updateProfile = (req, res) => {
  const userData = req.body;
  const userId = req.user._id;
  if (userId) {
    return User.findByIdAndUpdate(userId, userData, {
      runValidators: true,
      new: true,
    })
      .then((user) => res.status(200).send(user))
      .catch((err) => {
        if (err.name === "ValidationError") {
          return res.status(400).send({
            message: "Переданы некорректные данные при обновлении профиля",
          });
        }
        return res.status(500).send({ message: err.message });
      });
  }
  return res
    .status(400)
    .send({ message: "Пользователь с указанным _id не найден" });
};

const updateAvatar = (req, res) => {
  const userData = req.body;
  const userId = req.user._id;
  const userAvatar = userData.avatar;
  if (userId) {
    return User.findByIdAndUpdate(
      userId,
      { avatar: userAvatar },
      {
        runValidators: true,
        new: true,
      }
    )
      .then((user) => res.status(200).send(user))
      .catch((err) => {
        if (err.name === "ValidationError") {
          return res.status(400).send({
            message: "Переданы некорректные данные при обновлении аватара",
          });
        }
        return res.status(500).send({ message: err.message });
      });
  }
  return res
    .status(404)
    .send({ message: "Пользователь с указанным _id не найден" });
};

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateProfile,
  updateAvatar,
};
