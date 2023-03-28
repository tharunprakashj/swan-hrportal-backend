module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.createTable('tbl_top_up_part1', {
      top_up_part1_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      plan_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      annual_premium: {
        type: Sequelize.INTEGER,
        allowNull: false,
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
    await queryInterface.dropTable('tbl_top_up_part1');
  },
};
