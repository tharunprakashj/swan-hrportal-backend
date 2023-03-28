module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     *
     */
    await queryInterface.sequelize.query(
      `CREATE PROCEDURE addEmployee(
         @company_id int,
         @employee_id VARCHAR(10),
         @role INTEGER,
         @email_id VARCHAR(50),
         @password VARCHAR(50),
         @surname VARCHAR(50),
         @forename VARCHAR(50),
         @date_of_birth VARCHAR(50),
         @user_gender VARCHAR(50),
         @user_status VARCHAR(10),
         @relationship VARCHAR(20),
         @policy_no VARCHAR(20),
         @family_id int OUTPUT,
         @member_id int OUTPUT
         )
         AS
         BEGIN
        SET NOCOUNT ON;
        SET XACT_ABORT ON;
        BEGIN TRANSACTION;
        BEGIN TRY
            INSERT INTO tbl_users(
              employee_id,
              role,
              email_id,
              password
            )
            VALUES
            (
              @employee_id,
              @role,
              @email_id,
              @password
            )

            select @family_id = scope_identity()

            INSERT INTO dbo.tbl_profiles(
              family_id,
              surname,
              forename,
              date_of_birth,
              user_gender,
              user_status,
              relationship
            )
            VALUES
            (
              @family_id,
              @surname,
              @forename,
              @date_of_birth,
              @user_gender,
              @user_status,
              @relationship
            )
            select @member_id = scope_identity();

            INSERT into tbl_employees(
              company_id,
              user_id,
              role
            )
            values (
              @company_id,
              @family_id,
              @role
            )

            INSERT into tbl_user_bank_details(
              user_id,
              member_id

            )
            values (
              @family_id,
              @member_id

            )

            
            INSERT into tbl_policy_details( family_id,
              member_id)
              values(
                @family_id,
                @member_id)
                

                INSERT into tbl_insurance(
                  family_id,
                  policy_no,
                  insurance_status
                )
                values(
                  @family_id,
                  @policy_no,
                  'NOT ACTIVE'
                )
                DECLARE @insurance_id INTEGER;
                select @insurance_id = scope_identity()
  
              INSERT into tbl_insurance_details(
                insurance_id,
                family_id,
                member_id
              )
              values(
                @insurance_id,
                @family_id,
                @member_id
              )
  


            SELECT @family_id AS family_id, @member_id AS member_id
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
