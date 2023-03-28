module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.sequelize.query(
      `CREATE PROCEDURE insertRgpaDependant(
        @request_id INTEGER,
        @family_id INTEGER,
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
        @company_id INTEGER,
        @effective_insurance_date DATE,
        @insurance_end_date DATE,
        @request_reason VARCHAR(100),
        @request_confirmedby INTEGER,
        @date_request_confirmed DATE,
        @request_type INTEGER,
        @rgpa_basic INTEGER,
        @monthly_rgpa_amount INTEGER,
        @top_up_part1 INTEGER,
        @monthly_payment_part1 INTEGER,
        @top_up_part2 INTEGER,
        @monthly_payment_part2 INTEGER,
        @FSC_fee INTEGER,
        @monthly_premium INTEGER
      )
      AS
      BEGIN
      SET XACT_ABORT ON
      BEGIN TRANSACTION
      BEGIN TRY

      DECLARE @member_id INTEGER

      DECLARE @insurance_id INTEGER


	    SELECT @insurance_id = ins.insurance_id from tbl_insurance ins WHERE ins.family_id = @family_id

      SELECT @rgpa_basic = pol.rgpa_basic 
      FROM tbl_policy_details pol 
      LEFT JOIN tbl_profiles prof ON prof.profile_id = pol.member_id AND prof.relationship = 'PRIMARY'
      WHERE pol.family_id = @family_id

      IF (@request_id IS NOT NULL) OR (LEN(@request_id) > 0)
          BEGIN
          INSERT into tbl_profiles
          (
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
            card,
            user_status
          )
          VALUES(
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
            @card,
            'ACTIVE'
          )
          select @member_id = scope_identity()
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
            member_id,
            effective_insurance_date,
            insurance_end_date
          )
          VALUES
          (
            @insurance_id,
            @family_id,
            @member_id,
            @effective_insurance_date,
            @insurance_end_date
          )
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
          relationship,
          child,
          user_gender,
          is_mauritian,
          nic_no,
          passport_no,
          card,
          user_status
        )
        VALUES(
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
          @card,
          'ACTIVE'
        )
        select @member_id = scope_identity()
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
        INSERT INTO tbl_requests
        (
          family_id,
          member_id,
          company_id,
          request_type,
          request_status,
          request_reason,
          request_confirmedby,
          date_request_confirmed
        )
        VALUES
        (
          @family_id,
          @member_id,
          @company_id,
          @request_type,
          8,
          @request_reason,
          0,
          @date_request_confirmed
        )
        select @request_id = scope_identity()
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
            member_id,
            effective_insurance_date,
            insurance_end_date
          )
          VALUES
          (
            @insurance_id,
            @family_id,
            @member_id,
            @effective_insurance_date,
            @insurance_end_date
          )
      END
      SELECT @member_id AS profile_id,@request_id AS request_id
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
