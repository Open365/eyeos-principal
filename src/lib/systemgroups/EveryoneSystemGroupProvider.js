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
 * This module is responsible of statically initializing the EVERYONE SystemGroup in the DB.
 */

function Module(SystemGroupModel) {
	const everyone = require('./groups/EveryoneGroup');

	function lazyInitEveryoneSystemGroup(callback, injectecEveryoneSysGroup) {
		SystemGroupModel.findOne({_id: everyone._id}, function (err, systemgroup) {
			if (err) return callback(err);

			if (systemgroup) {
				for (var j = 0, maxj=everyone.permissions.length; j < maxj; j++) {
					var found = false;
					for (var i = 0, maxi=systemgroup.permissions.length; i < maxi; i++) {
						if(systemgroup.permissions[i].id === everyone.permissions[j].id) {
							found = true;
							break;
						}
					}
					if(!found) {
						systemgroup.permissions.push(everyone.permissions[j]);
					}
				}

				systemgroup.save(function(err) {
					return callback(err, systemgroup);
				});

			} else {
				var everyoneSysGroup = injectecEveryoneSysGroup || new SystemGroupModel(everyone);
				everyoneSysGroup.save(function (err) {
					if (err) return callback(err);

					return callback(null, everyoneSysGroup);
				});
			}
		});
	}

	return { lazyInitEveryoneSystemGroup: lazyInitEveryoneSystemGroup };
}

module.exports = Module;
