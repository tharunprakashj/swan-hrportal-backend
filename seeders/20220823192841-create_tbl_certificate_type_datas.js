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
    await queryInterface.bulkInsert('tbl_document_type', [
      {
        document_type: 'BIRTH_CERTIFICATE',
      },
      {
        document_type: 'NATIONAL_IDENTITY_CARD',
      },
      {
        document_type: 'PASSPORT',
      },
      {
        document_type: 'CIVIL_MARRIAGE_CERTIFICATE',
      },
      {
        document_type: 'WRITTEN_PROOF',
      },
      {
        document_type: 'DISABILITY_MEDICAL_REPORT',
      },
      {
        document_type: 'ADOPTION_PAPER',
      },
      {
        document_type: 'PROOF_OF_ADDRESS',
      },
      {
        document_type: 'PAY_ROLL',
      },
      {
        document_type: 'XRAY_SCAN',
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
    await queryInterface.bulkDelete('tbl_document_type', null, {});
  },
};
