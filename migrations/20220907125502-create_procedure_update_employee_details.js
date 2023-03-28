module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */

    await queryInterface.sequelize.query(
      `CREATE PROCEDURE updateEmployee(
         @id INTEGER,
         @profile_id INTEGER,
         @employment_date DATE,
         @surname VARCHAR(50),
         @forename VARCHAR(50),
         @date_of_birth VARCHAR(50),
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
         @city int,
         @bank_id int,
         @bank_account_holder VARCHAR(50),
         @bank_account_number VARCHAR(50),
         @effective_insurance_date DATE,
         @insurance_end_date DATE
         )
         AS
      BEGIN
      SET XACT_ABORT ON
      BEGIN TRANSACTION
      BEGIN TRY
          UPDATE tbl_users
          SET 
          employment_date = @employment_date
          WHERE user_id = @id

          UPDATE tbl_profiles SET
          surname = @surname,
          forename =@forename,
          date_of_birth = @date_of_birth,
          child =@child,
          user_gender = @user_gender,
          is_mauritian = @is_mauritian,
          nic_no= @nic_no,
          passport_no= @passport_no,
          marital_status=@marital_status,
          phone_no_home=@phone_no_home,
          phone_no_mobile=@phone_no_mobile,
          phone_no_office=@phone_no_office,
          address_1= @address_1,
          address_2=@address_2,
          is_pensioner = @is_pensioner,
          card = @card,
          city = @city
          WHERE family_id = @id AND profile_id = @profile_id
          
          UPDATE tbl_user_bank_details SET
          bank_id = @bank_id,
          bank_account_holder = @bank_account_holder,
          bank_account_number = @bank_account_number,
          bank_details_updated_on = GETDATE()
          WHERE user_id = @id

          UPDATE tbl_insurance_details SET
          effective_insurance_date = @effective_insurance_date,
          member_insurance_updated_on = GETDATE(),
          insurance_end_date = @insurance_end_date
          WHERE family_id = @id AND member_id = @profile_id
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
