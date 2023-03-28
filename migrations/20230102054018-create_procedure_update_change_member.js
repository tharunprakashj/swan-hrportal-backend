module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.sequelize.query(
      `CREATE PROCEDURE updateChangeMember(
        @family_id INTEGER,
        @member_id INTEGER,
        @company_id INTEGER,
        @surname VARCHAR(50),
        @forename VARCHAR(50),
        @date_of_birth DATE,
        @relationship VARCHAR(50),
        @child VARCHAR(50),
        @user_gender VARCHAR(50),
        @is_mauritian INTEGER,
        @nic_no VARCHAR(50),
        @passport_no VARCHAR(50),
        @marital_status VARCHAR(50),
        @phone_no_home VARCHAR(50),
        @phone_no_mobile VARCHAR(50),
        @phone_no_office VARCHAR(50),
        @address_1 VARCHAR(100),
        @address_2 VARCHAR(100),
        @is_pensioner INTEGER,
        @card VARCHAR(50),
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
        6,
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
        @marital_status,
        @phone_no_home,
        @phone_no_mobile,
        @phone_no_office,
        @address_1,
        @address_2,
        @is_pensioner,
        @card,
        'ACTIVE'
      )

      UPDATE tbl_profiles SET
      surname = @surname,
      forename = @forename,
      date_of_birth = @date_of_birth,
      relationship = @relationship,
      child = @child,
      user_gender = @user_gender,
      is_mauritian = @is_mauritian,
      nic_no = @nic_no,
      passport_no = @passport_no,
      marital_status = @marital_status,
      phone_no_home = @phone_no_home,
      phone_no_mobile = @phone_no_mobile,
      phone_no_office = @phone_no_office,
      address_1 = @address_1,
      address_2 = @address_2,
      is_pensioner = @is_pensioner,
      card = @card
      WHERE profile_id=@member_id

    
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
