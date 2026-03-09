'use strict';

const {
    safeAddColumns,
    safeRemoveColumn,
} = require('../utils/migration-utils');

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await safeAddColumns(queryInterface, 'projects', [
            {
                name: 'task_view_mode',
                definition: {
                    type: Sequelize.STRING,
                    allowNull: true,
                    defaultValue: 'list',
                    comment: 'Task view mode: list or board',
                },
            },
        ]);
    },

    down: async (queryInterface) => {
        await safeRemoveColumn(queryInterface, 'projects', 'task_view_mode');
    },
};
