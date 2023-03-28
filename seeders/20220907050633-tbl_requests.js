module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    await queryInterface.bulkInsert('tbl_request_status', [{
      request_status: 'PENDING',
    },
    {
      request_status: 'HR_APPROVAL',
    },
    {
      request_status: 'SWAN_APPROVAL',
    },
    {
      request_status: 'HEALTH_ADMIN',
    },
    {
      request_status: 'HEALTH_UW',
    },
    {
      request_status: 'HEALTH_PROCESSOR',
    },
    {
      request_status: 'BACK_TO_HR',
    },
    {
      request_status: 'APPROVED',
    },
    {
      request_status: 'REJECTED',
    },
    {
      request_status: 'BACK_TO_EMPLOYEE',
    },
    ], {});
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('tbl_request_status', null, {});
  },
};
