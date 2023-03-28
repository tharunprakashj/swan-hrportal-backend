module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.sequelize.query(
      `CREATE PROCEDURE updateQuestionnaireMasters(
        @request_id INTEGER
      )
      AS
      BEGIN
      SET XACT_ABORT ON
      BEGIN TRANSACTION
      BEGIN TRY

      DECLARE @members_count INTEGER
      SELECT @members_count = COUNT(*) from tbl_request_forms where request_id = @request_id;
      print 'members Count'
      print @members_count
      DECLARE @i int =0;
      WHILE @i < @members_count
        BEGIN
          DECLARE @member_id INTEGER
          SELECT @member_id = member_id from tbl_request_forms where request_id = @request_id ORDER BY member_id OFFSET @i ROWS FETCH NEXT 1 ROWS ONLY
          SET @i = @i + 1
          DECLARE @ans_count INTEGER
          SELECT @ans_count =  COUNT(*) from tbl_questionnarie_answers_temp where request_id = @request_id AND member_id = @member_id;
          print 'Answers count';
          print @ans_count;

          DECLARE @Counter int = 0

          WHILE @Counter < @ans_count
          BEGIN
              DECLARE @question_id INTEGER;
              SELECT @question_id = question_id from tbl_questionnarie_answers_temp where request_id = @request_id AND member_id = @member_id ORDER BY question_id OFFSET @Counter ROWS FETCH NEXT 1 ROWS ONLY
              print 'question id'
              print @question_id
              SET @Counter = @Counter + 1
              print @Counter;
              if exists(select * from tbl_questionnarie_answers WHERE question_id=@question_id and member_id=@member_id)
                BEGIN
                print 'data exist'
                UPDATE answers SET 
                answers.first_consulting = temp_ans.first_consulting,
                answers.answer_status = temp_ans.answer_status,
                answers.specify = temp_ans.specify,
                answers.illness_duration = temp_ans.illness_duration,
                answers.doctor_name = temp_ans.doctor_name,
                answers.doctor_number = temp_ans.doctor_number,
                answers.doctor_address1 = temp_ans.doctor_address1,
                answers.doctor_address2 = temp_ans.doctor_address2,
                answers.expected_delivery_date = temp_ans.expected_delivery_date,
                answers.answer_updated_on = GETDATE()
                FROM tbl_questionnarie_answers AS answers
                JOIN tbl_questionnarie_answers_temp AS temp_ans
                ON temp_ans.request_id = @request_id AND temp_ans.member_id = answers.member_id AND temp_ans.question_id=@question_id
                WHERE answers.member_id = temp_ans.member_id AND answers.question_id = @question_id
                END
              
              else
                BEGIN
                INSERT INTO tbl_questionnarie_answers
                (
                  family_id,
                  member_id,
                  question_id,
                  answer_status,
                  first_consulting,
                  specify,
                  illness_duration,
                  doctor_name,
                  doctor_number,
                  doctor_address1,
                  doctor_address2,
                  expected_delivery_date
                )
                SELECT
                  family_id,
                  member_id,
                  question_id,
                  answer_status,
                  first_consulting,
                  specify,
                  illness_duration,
                  doctor_name,
                  doctor_number,
                  doctor_address1,
                  doctor_address2,
                  expected_delivery_date
                  from tbl_questionnarie_answers_temp 
                  WHERE request_id = @request_id AND member_id = @member_id AND question_id = @question_id
                  
                  print 'new data'
                  END


                if exists(select * from tbl_questionnarie_documents WHERE question_id=@question_id and member_id=@member_id)
                BEGIN
                print 'document exist'
                UPDATE documents SET 
                documents.document_key = temp_docs.document_key,
                documents.document_type = temp_docs.document_type,
                documents.document_format = temp_docs.document_format,
                documents.location = temp_docs.location,
                documents.questionnarie_document_updated_on  = GETDATE()
                FROM tbl_questionnarie_documents AS documents
                JOIN tbl_questionnarie_document_records AS temp_docs
                ON temp_docs.request_id = @request_id AND temp_docs.member_id = documents.member_id AND temp_docs.question_id=@Counter 
                WHERE documents.member_id = temp_docs.member_id AND documents.question_id = @question_id
                END
              
              else
                BEGIN
                INSERT INTO tbl_questionnarie_documents
                (
                  family_id,
                  member_id,
                  question_id,
                  document_key,
                  document_type,
                  document_format,
                  location
                )
                SELECT
                  family_id,
                  member_id,
                  question_id,
                  document_key,
                  document_type,
                  document_format,
                  location
                  from tbl_questionnarie_document_records
                  WHERE request_id = @request_id AND member_id = @member_id AND question_id = @question_id
                  
                  print 'new document'
                  END


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
