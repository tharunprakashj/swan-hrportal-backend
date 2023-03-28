module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.createTable('tbl_requests', {
      request_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      family_id: {
        type: Sequelize.INTEGER,
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        references: {
          model: 'tbl_users',
          key: 'user_id',
        },
        allowNull: false,
      },
      member_id: {
        type: Sequelize.INTEGER,
        onDelete: 'No Action',
        onUpdate: 'No Action',
        references: {
          model: 'tbl_profiles',
          key: 'profile_id',
        },
        allowNull: false,
      },
      request_status: {
        type: Sequelize.INTEGER,
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
        references: {
          model: 'tbl_request_status',
          key: 'request_status_id',
        },
        defaultValue: 1,
        allowNull: false,
      },
      // request_type: {
      //   type: Sequelize.ENUM('ADD MEMBER', 'ADD DEPENDANT', 'DELETE MEMBER', 'DELETE DEPENDANT', 'CHANGE PLAN'),
      // },
      request_type: {
        type: Sequelize.INTEGER,
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
        references: {
          model: 'tbl_request_types',
          key: 'request_type_id',
        },
        allowNull: false,
      },
      request_createdby: {
        type: Sequelize.INTEGER,
      },
      request_submitedby: {
        type: Sequelize.INTEGER,
      },
      request_confirmedby: {
        type: Sequelize.INTEGER,
      },
      requested_by: {
        type: Sequelize.INTEGER,
      },
      request_reason: {
        type: Sequelize.STRING,
      },
      assigned_to: {
        type: Sequelize.INTEGER,
      },
      company_id: {
        type: Sequelize.INTEGER,
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
        references: {
          model: 'tbl_company_branches',
          key: 'company_branch_id',
        },
        allowNull: false,
      },
      date_request_submitted: {
        type: Sequelize.DATE,
      },
      date_request_confirmed: {
        type: Sequelize.DATE,
      },
      effective_date: {
        type: Sequelize.DATE,
      },
      policy_details: {
        type: Sequelize.INTEGER,
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
        references: {
          model: 'tbl_policy_details',
          key: 'plan_cover_id',
        },
      },
      request_created_on: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      request_updated_on: {
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
    await queryInterface.dropTable('tbl_requests');
  },
};
