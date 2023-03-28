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
    await queryInterface.bulkInsert('tbl_relationships', [{
      relationship: 'PRIMARY',
    },
    {
      relationship: 'SPOUSE',
    },
    {
      relationship: 'LIVE_IN_PARTNER',
    },
    {
      relationship: 'CHILD',
    },
    {
      relationship: 'TERTIARY_STUDENT',
    },
    {
      relationship: 'PARENT',
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
    await queryInterface.bulkDelete('tbl_relationships', null, {});
  },
};
