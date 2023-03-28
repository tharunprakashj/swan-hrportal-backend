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
    await queryInterface.bulkInsert('tbl_request_types', [{
      request_type: 'ADD MEMBER',
    },
    {
      request_type: 'ADD DEPENDANT',
    },
    {
      request_type: 'DELETE MEMBER',
    },
    {
      request_type: 'DELETE DEPENDANT',
    },
    {
      request_type: 'CHANGE PLAN',
    },
    {
      request_type: 'CHANGE MEMBER',
    },
    {
      request_type: 'TRANSFER MEMBER',
    },
    {
      request_type: 'CHANGE SALARY BAND',
    },
    {
      request_type: 'CHANGE TOP UP',
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
    await queryInterface.bulkDelete('tbl_request_types', null, {});
  },
};
