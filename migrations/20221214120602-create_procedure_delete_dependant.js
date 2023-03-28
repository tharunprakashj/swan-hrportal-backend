module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.sequelize.query(
      `CREATE PROCEDURE deleteDependant(
        @member_id INTEGER,
        @effective_date DATE
         )
         AS
      BEGIN
      SET XACT_ABORT ON
      BEGIN TRANSACTION
      BEGIN TRY

      DECLARE @family_id INTEGER;

      DECLARE @company_id INTEGER;

      DECLARE @request_id INTEGER;

      DECLARE @profile_id INTEGER;

      SELECT TOP 1 @family_id = family_id FROM tbl_profiles WHERE profile_id = @member_id;

      SELECT @company_id = company_id FROM tbl_employees WHERE user_id = @family_id;

      SELECT @profile_id = profile_id FROM tbl_profiles WHERE family_id = @family_id AND relationship = 'PRIMARY';
      
      if exists( SELECT * FROM tbl_profiles WHERE profile_id = @member_id AND relationship = 'PRIMARY')
      BEGIN
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
        @profile_id,
        @company_id,
        8,
        3,
        0,
        @effective_date
      )
      select @request_id = scope_identity()
      END
      else
      BEGIN
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
        @profile_id,
        @company_id,
        8,
        4,
        0,
        @effective_date
      )
      select @request_id = scope_identity()
      END
      
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

      UPDATE tbl_profiles
      SET user_status = 'DELETED'
      WHERE profile_id = @member_id
      COMMIT TRANSACTION
      END TRY
      BEGIN CATCH
          ROLLBACK TRANSACTION
      END CATCH
END`,
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
