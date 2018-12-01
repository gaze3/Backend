const Aigle = require('aigle');
const _ = require('lodash');

const {
  users,
  deleteUsers,
  boards,
} = require('../models');

module.exports = {

  usersFindOneUserName: ({
    email,
  }) => users.findOne({
    where: {
      email,
    },
  }),
  createUser: async ({
    email,
    password,
    keywords,
  }, ) => {
    await users.create({
      email,
      password,
      keywords,
    });
  },

  updateUser: async ({
    id,
  }, {
    email,
    nickName,
    password,
    keywords,
  }, ) => {
    await users.update({
      email,
      nickName,
      password,
      keywords,
    }, {
      where: {
        id,
      },
    });
  },

  deleteUser: async ({
    id,
  }) => {
    Aigle.mixin(_);
    const user = await users.findOne({
      where: {
        id,
      },
    });

    boardLists = await boards.findAll({
      where: {
        userId: id,
      }
    });

    Aigle.forEach(boardLists, async board => {
      await deleteUsers.create({
        id: board.id,
        content: board.content,
        imageUrl: board.imageUrl,
        lon: board.lon,
        lat: board.lat,
        categoryId: board.categoryId,
      });

      await boards.destroy({
        where: {
          id: board.id,
        }
      })
    })

    await deleteUsers.create({
      id: user.id,
      nickName: user.nickName,
      email: user.email,
      password: user.password,
      keywords: user.keywords,
      nickName: user.nickName,
    });
    await users.destroy({
      where: {
        id,
      },
    });
  },
};