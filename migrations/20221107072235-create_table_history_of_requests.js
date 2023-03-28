module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.createTable('tbl_request_histories', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      request_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      family_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      member_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      insurance_id: {
        type: Sequelize.INTEGER,
      },
      role: {
        type: Sequelize.INTEGER,
      },
      company_id: {
        type: Sequelize.INTEGER,
      },
      surname: {
        type: Sequelize.STRING,
      },
      forename: {
        type: Sequelize.STRING,
      },
      date_of_birth: {
        type: Sequelize.DATE,
      },
      relationship: {
        type: Sequelize.STRING,
      },
      child: {
        type: Sequelize.STRING,
      },
      user_gender: {
        type: Sequelize.STRING,
      },
      is_mauritian: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      nic_no: {
        type: Sequelize.STRING,
      },
      passport_no: {
        type: Sequelize.STRING,
      },
      marital_status: {
        type: Sequelize.STRING,
      },
      phone_no_home: {
        type: Sequelize.STRING,
      },
      phone_no_mobile: {
        type: Sequelize.STRING,
      },
      phone_no_office: {
        type: Sequelize.STRING,
      },
      address_1: {
        type: Sequelize.STRING,
      },
      address_2: {
        type: Sequelize.STRING,
      },
      is_pensioner: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      card: {
        type: Sequelize.STRING,
      },
      user_status: {
        type: Sequelize.ENUM('PENDING', 'ACTIVE', 'INACTIVE', 'CANCELED', 'DELETED'),
        defaultValue: 'ACTIVE',
      },
      bank_id: {
        type: Sequelize.INTEGER,
      },
      bank_account_holder: {
        type: Sequelize.STRING,
      },
      bank_account_number: {
        type: Sequelize.STRING,
      },
      rgpa_basic: {
        type: Sequelize.INTEGER,
      },
      monthly_rgpa_amount: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      top_up_part1: {
        type: Sequelize.INTEGER,
      },
      monthly_payment_part1: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      top_up_part2: {
        type: Sequelize.INTEGER,
      },
      monthly_payment_part2: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      FSC_fee: {
        type: Sequelize.FLOAT,
        defaultValue: 0,
      },
      monthly_premium: {
        type: Sequelize.FLOAT,
        defaultValue: 0,
      },
      request_status: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
      },
      request_type: {
        type: Sequelize.INTEGER,
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
      date_request_submitted: {
        type: Sequelize.DATE,
      },
      effective_insurance_date: {
        type: Sequelize.DATE,
      },
      insurance_end_date: {
        type: Sequelize.DATE,
      },
      created_on: {
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
    await queryInterface.dropTable('tbl_request_histories');
  },
};
