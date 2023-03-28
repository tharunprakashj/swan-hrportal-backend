module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.sequelize.query(
      `CREATE PROCEDURE insertUpdateQuestionDocumentRecords(
        @request_id INTEGER,
        @question_id INTEGER,
        @family_id INTEGER,
        @member_id INTEGER,
        @document_key VARCHAR(200),
        @document_type INTEGER,
        @document_format VARCHAR(100),
        @location VARCHAR(200)
      )
      AS
      BEGIN
      SET XACT_ABORT ON
      BEGIN TRANSACTION
      BEGIN TRY

    if exists(select * from tbl_questionnarie_document_records WHERE request_id=@request_id AND member_id=@member_id AND document_type=@document_type AND question_id=@question_id)
      UPDATE tbl_questionnarie_document_records SET 
      document_key = @document_key,
      document_format =@document_format,
      location = @location,
      questionnarie_document_updated_on= GETDATE()
      WHERE request_id=@request_id AND member_id=@member_id AND document_type=@document_type AND question_id=@question_id
    else
      INSERT INTO tbl_questionnarie_document_records
      (
        request_id,
        question_id,
        family_id,
        member_id,
        document_key,
        document_type,
        document_format,
        location
      )
      VALUES
        (
          @request_id,
          @question_id,
          @family_id,
          @member_id,
          @document_key,
          @document_type,
          @document_format,
          @location
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
