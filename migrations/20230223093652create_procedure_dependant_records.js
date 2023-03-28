module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.sequelize.query(
      `CREATE PROCEDURE createDependants(
        @request_id INTEGER,
        @family_id INTEGER,
        @member_id INTEGER,
        @surname VARCHAR(50),
        @forename VARCHAR(50),
        @date_of_birth DATE,
        @relationship VARCHAR(50),
        @child VARCHAR(50),
        @user_gender VARCHAR(50),
        @is_mauritian INTEGER,
        @nic_no VARCHAR(50),
        @passport_no VARCHAR(50),
        @card VARCHAR(50),
        @user_status VARCHAR(10),
        @city INTEGER,
        @company_id INTEGER,
        @effective_insurance_date DATE,
        @insurance_end_date DATE,
        @insurance_status VARCHAR(50),
        @request_createdby INTEGER
        )
        AS
        BEGIN
        SET NOCOUNT ON;
        SET XACT_ABORT ON;
        BEGIN TRANSACTION;
        BEGIN TRY

        DECLARE @rgpa_basic INTEGER

        DECLARE @monthly_rgpa_amount INTEGER
  
        DECLARE @insurance_id INTEGER
    
        DECLARE @profile_id INTEGER
  
        SELECT @insurance_id = ins.insurance_id from tbl_insurance ins WHERE ins.family_id = @family_id

        SELECT @rgpa_basic = pol.rgpa_basic 
        FROM tbl_policy_details pol 
        LEFT JOIN tbl_profiles prof ON prof.profile_id = pol.member_id AND prof.relationship = 'PRIMARY'
        WHERE pol.family_id = @family_id;

        print 'rgpa basic'
        print @rgpa_basic

  
        SELECT @monthly_rgpa_amount = pol.monthly_rgpa_amount
        FROM tbl_policy_details pol 
        LEFT JOIN tbl_profiles prof ON prof.profile_id = pol.member_id AND prof.relationship = 'PRIMARY'
        WHERE pol.family_id = @family_id

        SELECT @profile_id = profile_id  FROM tbl_profiles
        WHERE family_id = @family_id AND relationship = 'PRIMARY'

    
        IF (@member_id IS NOT NULL) OR (LEN(@member_id) > 0)
            BEGIN

            UPDATE tbl_profile_records SET
            surname = @surname,
            forename = @forename,
            date_of_birth = @date_of_birth,
            relationship = @relationship,
            child = @child,
            user_gender = @user_gender,
            is_mauritian = @is_mauritian,
            nic_no = @nic_no,
            passport_no = @passport_no,
            card = @card,
            city = @city,
            updated_on = GETDATE()
            WHERE request_id = @request_id AND member_id=@member_id


            SELECT @member_id AS profile_id
          END
        ELSE 
          BEGIN
          INSERT into tbl_profiles
            (
              family_id,
              surname,
              forename,
              date_of_birth,
              user_gender,
              user_status,
              relationship

            )
            VALUES(
              @family_id,
              @surname,
              @forename,
              @date_of_birth,
              @user_gender,
              @user_status,
              @relationship
            )
            select @member_id = scope_identity()
            INSERT INTO tbl_policy_details
            ( 
              family_id,
              member_id
            )
            VALUES
            (
              @family_id,
              @member_id
            )

            INSERT INTO tbl_request_forms
            (
              family_id,
              member_id,
              request_id
            )
            VALUES
            (
              @family_id,
              @member_id,
              @request_id
            )

            INSERT INTO tbl_insurance_details
            (
              insurance_id,
              family_id,
              member_id
            )
            VALUES
            (
              @insurance_id,
              @family_id,
              @member_id
            )

            INSERT into tbl_profile_records
            (
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
              card,
              city,
              user_status
            )
            VALUES(
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
              @card,
              @city,
              @user_status
            )

            INSERT INTO tbl_policy_records
            ( 
              request_id,
              family_id,
              member_id,
              rgpa_basic,
              monthly_rgpa_amount
            )
            VALUES
            (
              @request_id,
              @family_id,
              @member_id,
              @rgpa_basic,
              @monthly_rgpa_amount
            )

            INSERT INTO tbl_insurance_records
            (
              request_id,
              insurance_id,
              family_id,
              member_id,
              effective_insurance_date,
              insurance_end_date
            )
            VALUES
            (
              @request_id,
              @insurance_id,
              @family_id,
              @member_id,
              @effective_insurance_date,
              @insurance_end_date
            )


            SELECT @member_id AS profile_id
        END

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
