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

var PrincipalSystemGroupAssignationSchema = require('./schemas/PrincipalSystemGroupAssignationSchema');


function PrincipalSystemGroupAssignationProvider(mongoose, principalSystemGroupAssignationModel) {
	this.principalSystemGroupAssignationModel = principalSystemGroupAssignationModel || PrincipalSystemGroupAssignationSchema(mongoose).getModel();
}

PrincipalSystemGroupAssignationProvider.prototype.addSystemGroupToPrincipal = function (principal, systemGroupId, callback) {
	callback = callback || function () {};

	console.log('PrincipalSystemGroupAssignationProvider: going to add ', principal, systemGroupId);

	this.principalSystemGroupAssignationModel.update(
			{"principalId": principal._id, "systemGroupId": systemGroupId},
			{$set: {"systemGroupId": systemGroupId}},
			{"upsert" : true},
			function (err){
				if(err) {
					console.log('PrincipalSystemGroupAssignationProvider: addSystemGroupToPrincipal error', err);
				} else {
					console.log('PrincipalSystemGroupAssignationProvider: addSystemGroupToPrincipal done correctly');
				}
				callback(err, principal);
			});

};

module.exports = PrincipalSystemGroupAssignationProvider;
