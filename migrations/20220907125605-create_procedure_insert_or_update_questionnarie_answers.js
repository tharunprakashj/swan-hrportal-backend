module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */

    await queryInterface.sequelize.query(
      `CREATE PROCEDURE insertHealthAnswers(
        @family_id INTEGER,
        @member_id INTEGER,
        @question_id INTEGER,
        @first_consulting VARCHAR(50),
        @specify VARCHAR(50),
        @illness_duration VARCHAR(50),
        @doctor_name VARCHAR(50),
        @doctor_number VARCHAR(50),
        @doctor_address1 VARCHAR(50),
        @doctor_address2 VARCHAR(50),
        @expected_delivery_date DATE,
        @answer_status bit
         )
         AS
      BEGIN
      SET XACT_ABORT ON
      BEGIN TRANSACTION
      BEGIN TRY
        if exists(select * from tbl_questionnarie_answers WHERE family_id =@family_id AND member_id=@member_id AND question_id=@question_id )
          UPDATE tbl_questionnarie_answers SET 
          first_consulting = @first_consulting,
          specify = @specify,
          illness_duration = @illness_duration,
          doctor_name = @doctor_name,
          doctor_number = @doctor_number,
          doctor_address1 = @doctor_address1,
          doctor_address2 = @doctor_address2,
          expected_delivery_date = @expected_delivery_date,
          answer_status = @answer_status,
          answer_updated_on= GETDATE()
          WHERE member_id=@member_id AND question_id=@question_id 
        else
          INSERT INTO tbl_questionnarie_answers
          (
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
          VALUES
            (
            @family_id,
            @member_id,
            @question_id,
            @first_consulting,
            @specify,
            @illness_duration,
            @doctor_name,
            @doctor_number,
            @doctor_address1,
            @doctor_address2,
            @expected_delivery_date,
            @answer_status
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
