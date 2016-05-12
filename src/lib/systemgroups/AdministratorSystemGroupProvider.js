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

/**
 * This module is responsible of statically initializing the ADMINISTRATOR SystemGroup in the DB.
 */

function Module(SystemGroupModel) {
	var AdministratorGroup = require('./groups/AdministratorGroup');
	var administratorGroup = new AdministratorGroup();
	var administrator = administratorGroup.getModel();

	function lazyInitAdministratorSystemGroup(callback, injectecAdminSysGroup) {
		SystemGroupModel.findOne({_id: administrator._id}, function (err, systemgroup) {
			if (err) return callback(err);

			if (systemgroup) {
				return callback(null, systemgroup);
			} else {
				var adminSysGroup = injectecAdminSysGroup || new SystemGroupModel(administrator);
				adminSysGroup.save(function (err) {
					if (err) return callback(err);

					return callback(null, adminSysGroup);
				});
			}
		});
	}

	return { lazyInitAdministratorSystemGroup: lazyInitAdministratorSystemGroup };
}

module.exports = Module;
