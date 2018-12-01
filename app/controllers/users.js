const express = require('express');

const {
  resultFormat,
} = require('../helpers/formHelper');
const {
  isLoggedIn,
  isNotLoggedIn,
} = require('../middlewares/checkLogin');
const usersServices = require('../services/usersServices');
const {
  users,
} = require('../models');

const router = express.Router();

router.get('/', isLoggedIn, async (req, res) => {
  try {
    const user = await users.findAll({});
    res.json(resultFormat(true, null, user));
  } catch (error) {
    res.json(resultFormat(false, error.message, error));
  }
});

router.post('/', isNotLoggedIn, async (req, res) => {
  try {
    const exUsers = await usersServices.usersFindOneUserName(req.body);
    if (exUsers) {
      res.json(resultFormat(false, '이미 가입 된 유저 name 입니다.'));
      return;
    }
    await usersServices.createUser(req.body);
    res.json(resultFormat(true, null));
  } catch (error) {
    res.json(resultFormat(false, error.message));
  }
});

router.put('/', isLoggedIn, async (req, res) => {
  try {
    await usersServices.updateUser(req.user, req.body);
  } catch (error) {
    res.json(resultFormat(false, error.message));
    return;
  }
  res.json(resultFormat(true, null));
});

router.delete('/', isLoggedIn, async (req, res) => {
  try {
    await usersServices.deleteUser(req.user);
  } catch (error) {
    res.json(resultFormat(false, error.message));
    return;
  }
  res.json(resultFormat(true, null));
});

router.get('/:id', isLoggedIn, async (req, res) => {
  try {
    const user = await users.findOne({ where: { id: req.params.id } });
    res.json(resultFormat(true, null, user));
  } catch (error) {
    res.json(resultFormat(false, error.message));
  }
});

module.exports = router;
