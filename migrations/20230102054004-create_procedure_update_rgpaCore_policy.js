module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.sequelize.query(
      `CREATE PROCEDURE updateChangePlan(
        @family_id INTEGER,
        @member_id INTEGER,
        @company_id INTEGER,
        @rgpa_basic INTEGER,
        @monthly_rgpa_amount INTEGER,
        @top_up_part1 INTEGER,
        @monthly_payment_part1 INTEGER,
        @top_up_part2 INTEGER,
        @monthly_payment_part2 INTEGER,
        @FSC_fee FLOAT,
        @monthly_premium FLOAT,
        @effective_date DATE
      )
      AS
      BEGIN
      SET XACT_ABORT ON
      BEGIN TRANSACTION
      BEGIN TRY

      INSERT into tbl_requests
      (
        family_id,
        member_id,
        company_id,
        request_status,
        request_type,
        request_confirmedby,
        effective_date
      )
      values (
        @family_id,
        @member_id,
        @company_id,
        8,
        5,
        0,
        @effective_date
      )

      DECLARE @request_id INTEGER;
      select @request_id = scope_identity()

      
      INSERT into tbl_request_forms
      (
        request_id,
        family_id,
        member_id
      )
      values (
        @request_id,
        @family_id,
        @member_id
      )

      INSERT INTO tbl_policy_records
      (
        request_id,
        family_id,
        member_id,
        rgpa_basic,
        monthly_rgpa_amount,
        top_up_part1,
        monthly_payment_part1,
        top_up_part2,
        monthly_payment_part2,
        FSC_fee,
        monthly_premium
      )
      VALUES
        (
          @request_id,
          @family_id,
          @member_id,
          @rgpa_basic,
          @monthly_rgpa_amount,
          @top_up_part1,
          @monthly_payment_part1,
          @top_up_part2,
          @monthly_payment_part2,
          @FSC_fee,
          @monthly_premium
        )

        UPDATE tbl_policy_details SET 
        rgpa_basic = @rgpa_basic,
        monthly_rgpa_amount = @monthly_rgpa_amount,
        top_up_part1 = @top_up_part1,
        monthly_payment_part1 = @monthly_payment_part1,
        top_up_part2 = @top_up_part2,
        monthly_payment_part2 = @monthly_payment_part2,
        FSC_fee = @FSC_fee,
        policy_updated_on = GETDATE(),
        monthly_premium = @monthly_premium
        WHERE family_id=@family_id AND member_id=@member_id
    
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
