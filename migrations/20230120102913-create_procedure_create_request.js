module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.sequelize.query(
      `CREATE PROCEDURE createRequest(
        @family_id INTEGER,
        @request_status INTEGER,
        @request_type INTEGER,
        @request_createdby INTEGER,
        @request_id INTEGER OUTPUT
      )
      AS
      BEGIN
      SET XACT_ABORT ON
      BEGIN TRANSACTION
      BEGIN TRY

      DECLARE @member_id INTEGER
      SELECT @member_id = profile_id FROM tbl_profiles WHERE family_id = @family_id AND relationship ='PRIMARY'

      DECLARE @company_id INTEGER
      SELECT @company_id = company_id FROM tbl_employees WHERE user_id = @family_id AND role = 4



      INSERT into tbl_requests
      (
        family_id,
        member_id,
        company_id,
        request_status,
        request_type,
        request_createdby
      )
      values (
        @family_id,
        @member_id,
        @company_id,
        @request_status,
        @request_type,
        @request_createdby
      )

      select @request_id = scope_identity()

      IF @request_type = 1
        INSERT into tbl_request_forms(
          request_id,
          family_id,
          member_id
          )
          values (
          @request_id,
          @family_id,
          @member_id
          )

      
      
    
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
