module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.createTable('tbl_questionnarie_answers_temp', {
      answer_id: {
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
      question_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      first_consulting: {
        type: Sequelize.DATE,
      },
      specify: {
        type: Sequelize.STRING,
      },
      illness_duration: {
        type: Sequelize.STRING,
      },
      doctor_name: {
        type: Sequelize.STRING,
      },
      doctor_number: {
        type: Sequelize.STRING,
      },
      doctor_address1: {
        type: Sequelize.STRING,
      },
      doctor_address2: {
        type: Sequelize.STRING,
      },
      expected_delivery_date: {
        type: Sequelize.DATE,
        defaultValue: null,
      },
      answer_status: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      answer_temp_created_on: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      answer_temp_updated_on: {
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
    await queryInterface.dropTable('tbl_questionnarie_answers_temp');
  },
};
