module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.createTable('tbl_company_images', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      company_branch_id: {
        type: Sequelize.INTEGER,
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
        references: {
          model: 'tbl_company_branches',
          key: 'company_branch_id',
        },
      },
      company_image_key: {
        type: Sequelize.STRING,
      },
      company_image_format: {
        type: Sequelize.STRING,
      },
      company_image_location: {
        type: Sequelize.STRING,
      },
      company_image_created_on: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      company_image_updated_on: {
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
    await queryInterface.dropTable('tbl_company_images');
  },
};
