module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.sequelize.query(
      `CREATE PROCEDURE insertUpdateDocumentRecords(
        @request_id INTEGER,
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

    if exists(select * from tbl_uploaded_document_records WHERE request_id=@request_id AND member_id=@member_id AND document_type=@document_type)
      UPDATE tbl_uploaded_document_records SET 
      document_key = @document_key,
      document_format =@document_format,
      location = @location,
      document_record_updated_on = GETDATE()
      WHERE request_id=@request_id AND member_id=@member_id AND document_type=@document_type
    else
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
      VALUES
        (
          @request_id,
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
