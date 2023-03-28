module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.sequelize.query(
      `CREATE PROCEDURE updateTransferMember(
        @family_id INTEGER,
        @member_id INTEGER,
        @company_id INTEGER,
        @role INTEGER,
        @effective_date DATE
      )
      AS
      BEGIN
      SET XACT_ABORT ON
      BEGIN TRANSACTION
      BEGIN TRY

      DECLARE @company INTEGER;

      SELECT @company = company_id FROM tbl_employees WHERE user_id = @family_id

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
        @company,
        8,
        7,
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

      INSERT INTO tbl_employee_records
      (
        request_id,
        role,
        company_id,
        user_id
      )
      VALUES
      (
        @request_id,
        @role,
        @company_id,
        @family_id
      )

      UPDATE tbl_employees
      SET company_id = @company_id,
      role = @role
      WHERE user_id = @family_id

    
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
