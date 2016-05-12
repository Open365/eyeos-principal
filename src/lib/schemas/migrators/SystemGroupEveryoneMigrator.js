/*
    Copyright (c) 2016 eyeOS

    This file is part of Open365.

    Open365 is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

// EVERYONE SYSTEM GROUP:
// Update default value of "eyeos.admin.profiles.edit" permission to false.

var logger = require('log2out').getLogger('SystemGroupEveryoneMigrator');

var SystemGroupEveryoneMigrator = {

	migrate: function(systemGroupModel) {
		systemGroupModel.update(
			{_id:"EVERYONE", "permissions.id": "eyeos.admin.profiles.edit"},
			{$set: { "permissions.$.enabled": false }}, {}, function (err){
				if(err) {
					logger.error('Unable to perform migration:', err);
				} else {
					logger.debug('Migration finished correctly');
				}
			});
	}
};

module.exports = SystemGroupEveryoneMigrator;
