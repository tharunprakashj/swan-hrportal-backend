module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */

    await queryInterface.sequelize.query(
      `CREATE PROCEDURE insertPolicyDetails(
        @family_id INTEGER,
        @member_id INTEGER,
        @rgpa_basic INTEGER,
        @monthly_rgpa_amount INTEGER,
        @top_up_part1 INTEGER,
        @monthly_payment_part1 INTEGER,
        @top_up_part2 INTEGER,
        @monthly_payment_part2 INTEGER,
        @FSC_fee FLOAT,
        @monthly_premium FLOAT,
        @policy_id INTEGER OUTPUT
         )
         AS
      BEGIN
      SET XACT_ABORT ON
      BEGIN TRANSACTION
      BEGIN TRY
        if exists(select * from tbl_policy_details WHERE family_id = @family_id AND member_id=@member_id )
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
          
        else
          INSERT INTO tbl_policy_details
          (
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

            select @policy_id = scope_identity()

            UPDATE tbl_requests SET policy_details = @policy_id
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

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  },
};
