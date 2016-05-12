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


// REMOVING OLD ADMINISTRATOR SYSTEMGROUP
// The permisions in the administrator systemgroup are now calculated dinamically (based on the permissions in EVERYONE
// and set all to true). This scripts removes the old ADMINISTRATOR systemgroup checking if it contains any permissions.
// This is save to do because latter the correct ADMINISTRATOR systemgroup will be generated.

var SystemGroupAdministratorMigrator = {

	migrate: function(systemGroupModel) {
		systemGroupModel.find({_id:"ADMINISTRATOR", permissions:{$not:{$size:0}}}).remove().exec();
	}

};

module.exports = SystemGroupAdministratorMigrator;
