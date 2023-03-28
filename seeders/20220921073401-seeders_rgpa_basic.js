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
    await queryInterface.bulkInsert('tbl_rgpa_plans', [{
      plan_name: 'RGPA Basic Cover',
      basic_range: 'Rs 1 - 65000',
      monthly_payable: 410,

    },
    {
      plan_name: 'RGPA Basic Cover',
      basic_range: 'Rs 65001 - 110000',
      monthly_payable: 1200,
    },
    {
      plan_name: 'RGPA Basic Cover',
      basic_range: 'Rs 110001 - 300000',
      monthly_payable: 1680,
    },
    {
      plan_name: 'RGPA Basic Cover',
      basic_range: 'Rs 300001 - ABOVE',
      monthly_payable: 2150,
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
    await queryInterface.bulkDelete('tbl_rgpa_plans', null, {});
  },
};
