module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.createTable('tbl_insurance_details', {
      insurance_details_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      insurance_id: {
        type: Sequelize.INTEGER,
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
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
      rgpa_basic: {
        type: Sequelize.INTEGER,
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
        references: {
          model: 'tbl_rgpa_plans',
          key: 'rgpa_basic_id',
        },
      },
      monthly_rgpa_amount: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
      top_up_part1: {
        type: Sequelize.INTEGER,
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
        references: {
          model: 'tbl_top_up_part1',
          key: 'top_up_part1_id',
        },
      },
      monthly_payment_part1: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
      top_up_part2: {
        type: Sequelize.INTEGER,
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
        references: {
          model: 'tbl_top_up_part2',
          key: 'top_up_part2_id',
        },
      },
      monthly_payment_part2: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
      FSC_fee: {
        type: Sequelize.FLOAT,
        defaultValue: 0,
        allowNull: false,
      },

      monthly_premium: {
        type: Sequelize.FLOAT,
        defaultValue: 0,
        allowNull: false,
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
    await queryInterface.dropTable('tbl_insurance_details');
  },
};
