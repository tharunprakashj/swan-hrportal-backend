module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.sequelize.query(
      `CREATE PROCEDURE insertDuplicateRecords(
        @request_id INTEGER,
        @family_id INTEGER
        )
        AS
        BEGIN
        SET NOCOUNT ON;
        SET XACT_ABORT ON;
        BEGIN TRANSACTION;
        BEGIN TRY

        INSERT INTO tbl_profile_records
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
          city,
          is_pensioner,
          card,
          user_status
        )
        SELECT
        @request_id,
        family_id,
        profile_id,
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
        city,
        is_pensioner,
        card,
        user_status
        FROM tbl_profiles
        WHERE family_id = @family_id;

        INSERT INTO tbl_employee_records
        (
          request_id,
          role,
          company_id,
          user_id
        )
        SELECT
        @request_id,
        role,
        company_id,
        user_id
        FROM tbl_employees
        WHERE user_id = @family_id;

        INSERT INTO tbl_insurance_records
        (
          request_id,
          insurance_id,
          family_id,
          member_id,
          effective_insurance_date,
          insurance_end_date
        )
        SELECT
        @request_id,
        insurance_id,
        family_id,
        member_id,
        effective_insurance_date,
        insurance_end_date
        FROM tbl_insurance_details
        WHERE family_id = @family_id;

        INSERT INTO tbl_policy_records
        (
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
        )
        SELECT
        @request_id,
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
        FROM tbl_policy_details
        WHERE family_id = @family_id;

        INSERT INTO tbl_questionnarie_answers_temp
        (
          request_id,
          family_id,
          member_id,
          question_id,
          first_consulting,
          specify,
          illness_duration,
          doctor_name,
          doctor_number,
          doctor_address1,
          doctor_address2,
          expected_delivery_date,
          answer_status
        )
        SELECT
        @request_id,
        family_id,
        member_id,
        question_id,
        first_consulting,
        specify,
        illness_duration,
        doctor_name,
        doctor_number,
        doctor_address1,
        doctor_address2,
        expected_delivery_date,
        answer_status
        FROM tbl_questionnarie_answers
        WHERE family_id = @family_id;

        INSERT INTO tbl_questionnarie_document_records
        (
          request_id,
          question_id,
          member_id,
          family_id,
          document_key,
          document_type,
          document_format,
          location
        )
        SELECT
        @request_id,
        question_id,
        member_id,
        family_id,
        document_key,
        document_type,
        document_format,
        location
        FROM tbl_questionnarie_documents
        WHERE family_id = @family_id;

        INSERT INTO tbl_uploaded_document_records
        (
          request_id,
          family_id,
          member_id,
          document_key,
          document_type,
          document_format,
          location
        )
        SELECT
        @request_id,
        family_id,
        member_id,
        document_key,
        document_type,
        document_format,
        location
        FROM tbl_uploaded_documents
        WHERE family_id = @family_id;

        INSERT INTO tbl_user_bank_records
        (
          request_id,
          family_id,
          bank_id,
          bank_account_holder,
          bank_account_number
        )
        SELECT
        @request_id,
        user_id,
        bank_id,
        bank_account_holder,
        bank_account_number
        FROM tbl_user_bank_details
        WHERE user_id = @family_id;

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
