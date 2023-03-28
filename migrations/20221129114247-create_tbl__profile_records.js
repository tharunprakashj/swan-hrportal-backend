module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.createTable('tbl_profile_records', {
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
      family_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      member_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
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
        type: Sequelize.ENUM('PRIMARY', 'SPOUSE', 'LIVE_IN_PARTNER', 'CHILD', 'TERTIARY_STUDENT', 'PARENT'),
      },
      child: {
        type: Sequelize.STRING,
      },
      user_gender: {
        type: Sequelize.ENUM('MALE', 'FEMALE', 'OTHERS'),
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
        type: Sequelize.ENUM('MARRIED', 'WIDOWED', 'DIVORCED', 'SINGLE'),
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
      city: {
        type: Sequelize.INTEGER,
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
        references: {
          model: 'tbl_city',
          key: 'city_id',
        },
      },
      is_pensioner: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      card: {
        type: Sequelize.ENUM('Digital', 'Physical'),
      },
      user_status: {
        type: Sequelize.ENUM('PENDING', 'ACTIVE', 'INACTIVE', 'REJECTED', 'DELETED', 'DECEASED'),
        defaultValue: 'ACTIVE',
      },
      created_on: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_on: {
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
    await queryInterface.dropTable('tbl_profile_records');
  },
};
