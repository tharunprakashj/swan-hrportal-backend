module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.sequelize.query(
      `CREATE PROCEDURE updatePolicyMasters(
        @request_id INTEGER      )
      AS
      BEGIN
      SET NOCOUNT ON;
      SET XACT_ABORT ON;
      BEGIN TRANSACTION;
      BEGIN TRY

        BEGIN
          UPDATE policy_details SET 
           policy_details.rgpa_basic = policy_records.rgpa_basic,
           policy_details.monthly_rgpa_amount = policy_records.monthly_rgpa_amount,
           policy_details.top_up_part1 = policy_records.top_up_part1,
           policy_details.monthly_payment_part1 = policy_records.monthly_payment_part1,
           policy_details.top_up_part2 = policy_records.top_up_part2,
           policy_details.monthly_payment_part2 = policy_records.monthly_payment_part2,
           policy_details.FSC_fee = policy_records.FSC_fee,
           policy_details.monthly_premium = policy_records.monthly_premium,
           policy_details.policy_updated_on = GETDATE()
           FROM tbl_policy_details AS policy_details
           JOIN tbl_policy_records AS policy_records
           ON policy_details.member_id = policy_records.member_id
           JOIN tbl_request_forms AS forms
           ON policy_records.request_id = forms.request_id AND policy_records.member_id = forms.member_id
           WHERE policy_records.request_id = @request_id

           print 'Policy Update'

        END

      COMMIT TRANSACTION
      END TRY
      BEGIN CATCH
      ROLLBACK TRANSACTION
      SELECT ERROR_NUMBER(), ERROR_MESSAGE();
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
