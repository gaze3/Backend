module.exports = (Sequelize, DataTypes) => {
    const deleteBoards = Sequelize.define(
      'GazeDeleteBoards',
      {
        id: {
            type: DataTypes.INTEGER, 
            primaryKey: true,
            autoIncrement: true
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
        content: DataTypes.STRING,
        userId: DataTypes.INTEGER,
        lon: DataTypes.FLOAT,
        lat: DataTypes.FLOAT,
        imgUrl: DataTypes.STRING,
        categoryId: DataTypes.INTEGER,
        flag: DataTypes.BOOLEAN,
        radius: DataTypes.INTEGER,
      },
      {},
    );

    return deleteBoards;
  };