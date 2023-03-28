module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */

    await queryInterface.sequelize.query(
      `CREATE PROCEDURE createProfiles(
        @family_id int,
        @company_id int,
        @surname VARCHAR(50),
        @forename VARCHAR(50),
        @date_of_birth VARCHAR(50),
        @relationship VARCHAR(50),
        @child VARCHAR(50),
        @user_gender VARCHAR(50),
        @is_mauritian bit,
        @nic_no VARCHAR(50),
        @passport_no VARCHAR(50),
        @marital_status VARCHAR(50),
        @phone_no_home VARCHAR(50),
        @phone_no_mobile VARCHAR(50),
        @phone_no_office VARCHAR(50),
        @address_1 VARCHAR(50),
        @address_2 VARCHAR(50),
        @is_pensioner bit,
        @card VARCHAR(50),
        @request_type INTEGER,
        @effective_insurance_date DATE,
        @policy_no VARCHAR(10),
        @user_status VARCHAR(10)
)
        AS
     BEGIN
     SET NOCOUNT ON;
     SET XACT_ABORT ON
       BEGIN TRANSACTION
       BEGIN TRY
         
           INSERT INTO dbo.tbl_profiles(
             family_id,
             surname,
         forename,
         date_of_birth,
         relationship,
         child,
         user_gender,
         is_mauritian,
         nic_no,
         passport_no,
         marital_status,
         phone_no_home,
         phone_no_mobile,
         phone_no_office,
         address_1,
         address_2,
         is_pensioner,
         card,
         user_status
           )
           VALUES
           (
             @family_id,
             @surname,
             @forename,
             @date_of_birth,
             @relationship,
             @child,
             @user_gender,
             @is_mauritian,
             @nic_no,
             @passport_no,
             @marital_status,
             @phone_no_home,
             @phone_no_mobile,
             @phone_no_office,
             @address_1,
             @address_2,
             @is_pensioner,
             @card,
             @user_status
           )
           DECLARE @profile_id INTEGER;
           select @profile_id = scope_identity()


           INSERT into tbl_policy_details( family_id,
             member_id)
             values(
               @family_id,
               @profile_id)


       DECLARE @policy_details INTEGER;
             select @policy_details = scope_identity()

             INSERT into tbl_requests(
               family_id,
               member_id,
               company_id,
               request_type,
               policy_details
             )
             values (
               @family_id,
               @profile_id,
               @company_id,
               @request_type,
               @policy_details
             )

             DECLARE @request_id INTEGER;
             select @request_id = scope_identity()

             
             INSERT into tbl_request_forms(
               request_id,
               family_id,
               member_id
             )
             values (
               @request_id,
               @family_id,
               @profile_id
             )

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
             member_id,
             effective_insurance_date,
             monthly_rgpa_amount,
             monthly_payment_part1,
             monthly_payment_part2,
             FSC_fee,
             monthly_premium
           )
           values(
             @insurance_id,
             @family_id,
             @profile_id,
             @effective_insurance_date,
             0,
             0,
             0,
             0,
             0
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

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  },
};
