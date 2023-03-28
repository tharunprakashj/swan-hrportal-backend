module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.createTable('tbl_rgpa_plans', {
      rgpa_basic_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      plan_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      basic_range: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      monthly_payable: {
        type: Sequelize.INTEGER,
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
    await queryInterface.dropTable('tbl_rgpa_plans');
  },
};
