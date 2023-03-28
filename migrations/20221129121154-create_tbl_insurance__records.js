module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.createTable('tbl_insurance_records', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      request_id: {
        type: Sequelize.INTEGER,
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        references: {
          model: 'tbl_requests',
          key: 'request_id',
        },
        allowNull: false,
      },
      insurance_id: {
        type: Sequelize.INTEGER,
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
        references: {
          model: 'tbl_insurance',
          key: 'insurance_id',
        },
        allowNull: false,
      },
      family_id: {
        type: Sequelize.INTEGER,
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
        references: {
          model: 'tbl_users',
          key: 'user_id',
        },
        allowNull: false,
      },
      member_id: {
        type: Sequelize.INTEGER,
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
        references: {
          model: 'tbl_profiles',
          key: 'profile_id',
        },
        allowNull: false,
      },
      effective_insurance_date: {
        type: Sequelize.DATE,
      },
      insurance_end_date: {
        type: Sequelize.DATE,
      },

      member_insurance_created_on: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      member_insurance_updated_on: {
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
    await queryInterface.dropTable('tbl_insurance_records');
  },
};
