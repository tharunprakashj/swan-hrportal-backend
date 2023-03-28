module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.sequelize.query(
      `CREATE PROCEDURE migratingUser(
         @company_id int,
         @family_id int,
         @member_id int,
         @employee_id VARCHAR(10),
         @role INTEGER,
         @email_id VARCHAR(50),
         @password VARCHAR(50),
         @is_verified bit,
         @employment_date DATE,
         @surname VARCHAR(50),
         @forename VARCHAR(50),
         @date_of_birth DATE,
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
         @user_status VARCHAR(50),
         @city int,
         @bank_id int,
         @bank_account_holder VARCHAR(50),
         @bank_account_number VARCHAR(50),
         @request_type INTEGER,
         @request_confirmedby INTEGER,
         @date_request_confirmed DATE,
         @request_reason VARCHAR(100),
         @effective_insurance_date DATE,
         @insurance_end_date DATE,
         @policy_no VARCHAR(10),
         @rgpa_basic INTEGER,
         @monthly_rgpa_amount INTEGER,
         @top_up_part1 INTEGER,
         @monthly_payment_part1 INTEGER,
         @top_up_part2 INTEGER,
         @monthly_payment_part2 INTEGER,
         @FSC_fee FLOAT,
         @monthly_premium FLOAT
)
         AS
      BEGIN
      SET NOCOUNT ON;
      SET XACT_ABORT ON
        BEGIN TRANSACTION
        BEGIN TRY
        SET IDENTITY_INSERT tbl_users ON;
          INSERT INTO tbl_users(
            user_id,
            employee_id,
            role,
            email_id,
            is_verified,
            password,
            employment_date)
            VALUES
            (
              @family_id,
              @employee_id,
              @role,
              @email_id,
              @is_verified,
              @password,
              @employment_date
            )
        SET IDENTITY_INSERT tbl_users OFF;

        SET IDENTITY_INSERT tbl_profiles ON;
            INSERT INTO tbl_profiles(
              profile_id,
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
              user_status,
              city
            )
            VALUES
            (
              @member_id,
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
              @user_status,
              @city
            )
        SET IDENTITY_INSERT tbl_profiles OFF;

            INSERT INTO tbl_user_bank_details(
              user_id,
              bank_id,
              bank_account_holder,
              bank_account_number
            )
            VALUES (
              @family_id,
              @bank_id,
              @bank_account_holder,
              @bank_account_number
            )

            INSERT INTO tbl_employees(
              company_id,
              user_id,
              role
            )
            VALUES (
              @company_id,
              @family_id,
              @role
            )

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

              DECLARE @policy_details INTEGER;

              select @policy_details = scope_identity()

              INSERT INTO tbl_requests(
                family_id,
                member_id,
                company_id,
                request_status,
                request_type,
                request_confirmedby,
                date_request_confirmed,
                policy_details
              )
              VALUES (
                @family_id,
                @member_id,
                @company_id,
                8,
                @request_type,
                0,
                @date_request_confirmed,
                @policy_details
              )

              DECLARE @request_id INTEGER;
              select @request_id = scope_identity()

              
              INSERT INTO tbl_request_forms(
                request_id,
                family_id,
                member_id
              )
              VALUES (
                @request_id,
                @family_id,
                @member_id
              )


              INSERT INTO tbl_insurance(
                family_id,
                policy_no,
                insurance_status
              )
              VALUES(
                @family_id,
                @policy_no,
                'ACTIVE'
              )
              DECLARE @insurance_id INTEGER;
              select @insurance_id = scope_identity()

            INSERT INTO tbl_insurance_details(
              insurance_id,
              family_id,
              member_id,
              effective_insurance_date,
              insurance_end_date
            )
            VALUES(
              @insurance_id,
              @family_id,
              @member_id,
              @effective_insurance_date,
              @insurance_end_date
            )

            INSERT INTO tbl_profile_records(
              request_id,
              family_id,
              member_id,
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
              user_status,
              city
            )
            VALUES
            (
              @request_id,
              @family_id,
              @member_id,
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
              @user_status,
              @city
            )

            INSERT INTO tbl_user_bank_records(
              request_id,
              family_id,
              member_id,
              bank_id,
              bank_account_holder,
              bank_account_number
            )VALUES(
              @request_id,
              @family_id,
              @member_id,
              @bank_id,
              @bank_account_holder,
              @bank_account_number
            )

            INSERT INTO tbl_employee_records(
              request_id,
              company_id,
              user_id,
              role
            )
            VALUES(
              @request_id,
              @company_id,
              @family_id,
              @role
            )

            INSERT INTO tbl_policy_records(
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
            )VALUES(
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

            INSERT INTO tbl_insurance_records(
              request_id,
              insurance_id,
              family_id,
              member_id,
              effective_insurance_date,
              insurance_end_date
            )VALUES(
              @request_id,
              @insurance_id,
              @family_id,
              @member_id,
              @effective_insurance_date,
              @insurance_end_date
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
