module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.createTable('tbl_relationships', {
      relationship_id: {
        allowNull: false,
        autoIncrement: true,
        type: Sequelize.INTEGER,
      },
      relationship: {
        allowNull: false,
        type: Sequelize.STRING,
        primaryKey: true,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.dropTable('tbl_relationships');
  },
};
