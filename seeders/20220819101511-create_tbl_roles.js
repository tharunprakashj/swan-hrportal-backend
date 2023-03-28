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
    await queryInterface.bulkInsert('tbl_roles', [{
      role_type: 'GROUP_HR',
    },
    {
      role_type: 'SUB_HR',
    },
    {
      role_type: 'HR_EXECUTIVE',
    },
    {
      role_type: 'EMPLOYEE',
    },
    {
      role_type: 'SWAN_ADMIN',
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
    await queryInterface.bulkDelete('tbl_roles', null, {});
  },
};
