module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.sequelize.query(
      `CREATE PROCEDURE deleteMember(
        @user_id INTEGER,
        @effective_date DATE
         )
         AS
      BEGIN
      SET XACT_ABORT ON
      BEGIN TRANSACTION
      BEGIN TRY

      DECLARE @member_id INTEGER;

      DECLARE @company_id INTEGER;

      SELECT @member_id = profile_id FROM tbl_profiles WHERE family_id = @user_id AND relationship != 'PRIMARY';

      SELECT @company_id = company_id FROM tbl_employees WHERE user_id = @user_id;

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
        @user_id,
        @member_id,
        @company_id,
        8,
        3,
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
        @user_id,
        @member_id
      )

      DELETE FROM tbl_employees
      WHERE user_id = @user_id;

      UPDATE tbl_profiles
      SET user_status = 'DELETED'
      WHERE family_id = @user_id;
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
