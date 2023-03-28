module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.sequelize.query(
      `CREATE PROCEDURE updateMastersDocuments(
        @request_id INTEGER
      )
      AS
      BEGIN
      SET XACT_ABORT ON
      BEGIN TRANSACTION
      BEGIN TRY

      DECLARE @document_count INTEGER;
      DECLARE @question_document_count INTEGER;
      DECLARE @i INTEGER = 0;
      DECLARE @j INTEGER = 0;
      DECLARE @member_id INTEGER;
      DECLARE @document_type INTEGER;
      DECLARE @question_id INTEGER;

      SELECT @document_count = COUNT(*) FROM tbl_uploaded_document_records WHERE request_id = @request_id;

      WHILE @i < @document_count
        BEGIN
          SELECT @member_id= member_id, @document_type = document_type 
          FROM tbl_uploaded_document_records WHERE request_id = @request_id ORDER BY member_id OFFSET @i ROWS FETCH NEXT 1 ROWS ONLY
          SET @i = @i + 1
          IF EXISTS(SELECT id FROM tbl_uploaded_documents WHERE member_id = @member_id AND document_type = @document_type)
            BEGIN
            UPDATE doc SET
            document_key = docrec.document_key,
            document_format = docrec.document_format,
            location = docrec.location,
            document_updated_on = GETDATE()
            FROM tbl_uploaded_documents doc
            JOIN tbl_uploaded_document_records docrec ON docrec.member_id = doc.member_id AND docrec.document_type = doc.document_type
            WHERE docrec.request_id = @request_id AND docrec.member_id = @member_id AND docrec.document_type = @document_type
            END
          ELSE
            BEGIN
              INSERT INTO tbl_uploaded_documents
              (
                member_id,
                family_id,
                document_key,
                document_type,
                document_format,
                location
              )
              SELECT
              member_id,
              family_id,
              document_key,
              document_type,
              document_format,
              location
              FROM tbl_uploaded_document_records WHERE request_id = @request_id AND member_id = @member_id AND document_type = @document_type
            END
        END

      SELECT @question_document_count = COUNT(*) FROM tbl_questionnarie_document_records WHERE request_id = @request_id;
      
      WHILE @j < @question_document_count
        BEGIN
          SELECT @member_id=member_id, @question_id=question_id
          FROM tbl_questionnarie_document_records WHERE request_id = @request_id ORDER BY member_id OFFSET @j ROWS FETCH NEXT 1 ROWS ONLY
          SET @j =@j + 1
          IF EXISTS (SELECT * FROM tbl_questionnarie_documents WHERE member_id = @member_id and question_id = @question_id)
            BEGIN
                UPDATE quesdoc SET
                document_key = quesdocrec.document_key,
                document_format = quesdocrec.document_format,
                location = quesdocrec.location,
                questionnarie_document_updated_on = GETDATE()
                FROM tbl_questionnarie_documents quesdoc
                JOIN tbl_questionnarie_document_records quesdocrec ON quesdocrec.member_id = quesdoc.member_id AND quesdocrec.question_id = quesdoc.question_id
                WHERE quesdocrec.request_id = @request_id AND quesdocrec.member_id = @member_id AND quesdocrec.question_id = @question_id
            END
          ELSE
            BEGIN
              INSERT INTO tbl_questionnarie_documents
              (
                question_id,
                member_id,
                family_id,
                document_key,
                document_type,
                document_format,
                location
              )
              SELECT
              question_id,
              member_id,
              family_id,
              document_key,
              document_type,
              document_format,
              location
              FROM tbl_questionnarie_document_records WHERE request_id = @request_id AND member_id = @member_id AND question_id = @question_id
            END
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
