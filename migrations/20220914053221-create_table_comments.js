module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.createTable('tbl_comments', {
      comment_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      family_id: {
        type: Sequelize.INTEGER,
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        references: {
          model: 'tbl_users',
          key: 'user_id',
        },
        allowNull: false,
      },
      request_id: {
        type: Sequelize.INTEGER,
      },
      comment_title: {
        type: Sequelize.STRING,
      },
      comments: {
        type: Sequelize.TEXT,
      },
      comment_type: {
        type: Sequelize.ENUM('INTERNAL', 'EXTERNAL'),
        defaultValue: 'EXTERNAL',
      },
      request_status: {
        type: Sequelize.INTEGER,
      },
      comment_reason: {
        type: Sequelize.STRING,
      },
      commented_by: {
        type: Sequelize.INTEGER,
      },
      created_on: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_on: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },

    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.dropTable('tbl_comments');
  },
};
