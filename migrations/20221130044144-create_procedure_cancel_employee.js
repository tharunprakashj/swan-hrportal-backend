module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.sequelize.query(
      `CREATE PROCEDURE removeRequestData(
        @member_id INTEGER,
        @family_id INTEGER
        )
         AS
      BEGIN
      SET XACT_ABORT ON
      BEGIN TRANSACTION
      BEGIN TRY

          UPDATE tbl_profiles
          SET
          child = NULL,
          is_mauritian = 0,
          nic_no = NULL,
          passport_no = NULL,
          marital_status = NULL,
          phone_no_home = NULL,
          phone_no_mobile = NULL,
          phone_no_office = NULL,
          address_1 = NULL,
          address_2 = NULL,
          is_pensioner = 0,
          card = NULL,
          updated_on = GETDATE()
          WHERE profile_id = @member_id

          UPDATE tbl_insurance_details
          SET
          effective_insurance_date = NULL,
          insurance_end_date = NULL,
          rgpa_basic = NULL,
          monthly_rgpa_amount = 0,
          top_up_part1 = NULL,
          monthly_payment_part1 = 0,
          top_up_part2 = NULL,
          monthly_payment_part2 = 0,
          FSC_fee = 0,
          monthly_premium = 0,
          member_insurance_updated_on = GETDATE()
          WHERE member_id = @member_id

          UPDATE tbl_policy_details
          SET
          rgpa_basic = NULL,
          monthly_rgpa_amount = 0,
          top_up_part1 = NULL,
          monthly_payment_part1 = 0,
          top_up_part2 = NULL,
          monthly_payment_part2 = 0,
          FSC_fee = 0,
          monthly_premium = 0,
          policy_updated_on = GETDATE()
          WHERE member_id = @member_id

          UPDATE tbl_user_bank_details
          SET
          bank_id = NULL,
          bank_account_holder= NULL,
          bank_account_number = NULL,
          bank_details_updated_on = GETDATE()
          WHERE user_id = @family_id

          DELETE FROM tbl_questionnarie_documents 
          WHERE member_id IN (@member_id)

          DELETE FROM tbl_questionnarie_answers 
          WHERE member_id IN (@member_id)

      COMMIT TRANSACTION
      END TRY
      BEGIN CATCH
      ROLLBACK TRANSACTION
      END CATCH
      END
      `,
    );
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  },
};
