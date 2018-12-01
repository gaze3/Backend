// "use strict";
// const Sequelize = require('sequelize');

module.exports = (Sequelize, DataTypes) => {
  const deleteUsers = Sequelize.define(
    'GazeDeleteUsers',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
      content: DataTypes.STRING,
      userId: DataTypes.INTEGER,
      lon: DataTypes.FLOAT,
      lat: DataTypes.FLOAT,
      imgUrl: DataTypes.STRING,
    }, {},
  );
  // Users.associate = (models) => {
  //   // associations can be defined here
  // };
  return deleteUsers;
};
