module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.sequelize.query(
      `CREATE PROCEDURE insertProfileRecord(
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
        @marital_status VARCHAR(50),
        @phone_no_home VARCHAR(50),
        @phone_no_mobile VARCHAR(50),
        @phone_no_office VARCHAR(50),
        @address_1 VARCHAR(100),
        @address_2 VARCHAR(100),
        @is_pensioner INTEGER,
        @card VARCHAR(50),
        @user_status VARCHAR(10)
      )
      AS
      BEGIN
      SET XACT_ABORT ON
      BEGIN TRANSACTION
      BEGIN TRY

      if exists(select * from tbl_profile_records WHERE request_id = @request_id AND member_id=@member_id)
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
          marital_status = @marital_status,
          phone_no_home = @phone_no_home,
          phone_no_mobile = @phone_no_mobile,
          phone_no_office = @phone_no_office,
          address_1 = @address_1,
          address_2 = @address_2,
          is_pensioner = @is_pensioner,
          card = @card
          WHERE request_id = @request_id AND member_id=@member_id
        END
      else 
        BEGIN
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
          @user_status
        )
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
