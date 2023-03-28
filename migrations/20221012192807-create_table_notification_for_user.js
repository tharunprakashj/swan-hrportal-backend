module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.createTable('tbl_notification_for_user', {
      notification_for_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      notification_id: {
        type: Sequelize.INTEGER,
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
        references: {
          model: 'tbl_notification',
          key: 'notification_id',
        },
        allowNull: false,
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
      member_id: {
        type: Sequelize.INTEGER,
      },
      is_read: {
        type: Sequelize.BOOLEAN,
        defaultValue: 0,
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
    await queryInterface.dropTable('tbl_notification_for_user');
  },
};
