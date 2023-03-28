module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.createTable('tbl_bank_list', {
      bank_code: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      bank_name: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      account_no_length: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      bank_created_on: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      bank_updated_on: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
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
    await queryInterface.dropTable('tbl_bank_list');
  },
};
