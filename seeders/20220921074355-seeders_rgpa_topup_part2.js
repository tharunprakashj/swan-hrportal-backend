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
    await queryInterface.bulkInsert('tbl_top_up_part2', [{
      plan_name: 'RGPA Top-Up Part 2 - Alternative 1 Rs 1M',
      annual_premium: 110,
      age_limit: true,
      above_75: 208,
    },
    {
      plan_name: 'RGPA Top-Up Part 2 - Alternative 2 Rs 2M',
      annual_premium: 140,
      age_limit: true,
      above_75: 0,
    },
    {
      plan_name: 'RGPA Top-Up Part 2 - Alternative 3 Rs 5M',
      annual_premium: 375,
      age_limit: true,
      above_75: 0,
    },
    {
      plan_name: 'RGPA Top-Up Part 2 - Alternative 4 Rs 10M',
      annual_premium: 541,
      age_limit: true,
      above_75: 0,
    },
    {
      plan_name: 'RGPA Top-Up Part 2 - Alternative 1 Rs 1M',
      annual_premium: 208,
      age_limit: false,
      above_75: 208,
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
    await queryInterface.bulkDelete('tbl_top_up_part2', null, {});
  },
};
