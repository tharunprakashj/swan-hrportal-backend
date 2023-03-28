module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.sequelize.query(
      `CREATE PROCEDURE updateProfileMasters(
        @request_id INTEGER,
        @user_status varchar(10),
        @request_type INTEGER,
        @family_id INTEGER
      )
      AS
      BEGIN
      SET NOCOUNT ON;
      SET XACT_ABORT ON;
      BEGIN TRANSACTION;
      BEGIN TRY

        BEGIN
        UPDATE profiles SET
          profiles.surname = records.surname,
          profiles.forename = records.forename,
          profiles.date_of_birth = records.date_of_birth,
          profiles.user_gender = records.user_gender,
          profiles.is_mauritian = records.is_mauritian,
          profiles.nic_no = records.nic_no,
          profiles.passport_no = records.passport_no,
          profiles.marital_status = records.marital_status,
          profiles.phone_no_home = records.phone_no_home,
          profiles.phone_no_mobile = records.phone_no_mobile,
          profiles.phone_no_office = records.phone_no_office,
          profiles.address_1 = records.address_1,
          profiles.address_2 = records.address_2,
          profiles.city = records.city,
          profiles.is_pensioner = records.is_pensioner,
          profiles.card = records.card,
          profiles.user_status = @user_status,
          profiles.updated_on = GETDATE()
          FROM tbl_profiles AS profiles
          JOIN tbl_profile_records AS records
          ON profiles.profile_id = records.member_id
          JOIN tbl_request_forms AS forms
          ON records.request_id = forms.request_id AND records.member_id = forms.member_id
          WHERE records.request_id = @request_id

          print 'Profile Update'

          END

          BEGIN
          UPDATE bank_details SET
           bank_details.bank_id = bank_records.bank_id,
           bank_details.bank_account_holder = bank_records.bank_account_holder,
           bank_details.bank_account_number = bank_records.bank_account_number,
           bank_details.bank_details_updated_on = GETDATE()
           FROM tbl_user_bank_details AS bank_details
           JOIN tbl_user_bank_records AS bank_records
           ON bank_details.user_id = bank_records.family_id
           WHERE bank_records.request_id = @request_id

           print 'Bank Update'
        END

        BEGIN
        UPDATE insurance_details SET
        insurance_details.effective_insurance_date = insurance_records.effective_insurance_date,
        insurance_details.insurance_end_date = insurance_records.insurance_end_date,
        insurance_details.member_insurance_updated_on = GETDATE()
         FROM tbl_insurance_details AS insurance_details
         JOIN tbl_insurance_records AS insurance_records
         ON insurance_records.member_id = insurance_records.member_id
         WHERE insurance_records.request_id = @request_id

         print 'Insurance Update'
      END

      IF @request_type = 1
        BEGIN
        UPDATE tbl_insurance SET
        insurance_status = 'ACTIVE'
        WHERE family_id = @family_id

        print 'Insurance Status Update'
        END



      

      COMMIT TRANSACTION
      END TRY
      BEGIN CATCH
      ROLLBACK TRANSACTION
      SELECT ERROR_NUMBER(), ERROR_MESSAGE();
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
