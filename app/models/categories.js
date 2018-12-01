module.exports = (Sequelize, DataTypes) => {
  const categories = Sequelize.define(
    'Gazecategories',
    {
      id: {
          type: DataTypes.INTEGER, 
          primaryKey: true,
          autoIncrement: true
      },
      name: DataTypes.STRING,
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    },
    {},
  );

  return categories;
};