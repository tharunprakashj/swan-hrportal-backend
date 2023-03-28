module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.createTable('tbl_top_up_part2', {
      top_up_part2_id: {
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
      age_limit: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      above_75: {
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
    await queryInterface.dropTable('tbl_top_up_part2');
  },
};
