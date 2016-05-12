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

var SystemGroupProvider = require('./SystemGroupProvider');
var PrincipalSystemGroupAssignationProvider = require('./PrincipalSystemGroupAssignationProvider');

function assertNotNull(value, msg) {
    if (!value) throw new Error(msg);
}

function PrincipalProvider(Principal, SystemGroup, systemGroupProvider, mongoose) {
	this.Principal = Principal;
	this.SystemGroup = SystemGroup;
	this.systemGroupProvider = systemGroupProvider || new SystemGroupProvider(SystemGroup);

	this.mongoose = mongoose;
}

PrincipalProvider.prototype.getPrincipalById = function (id, callback) {
    assertNotNull(this.Principal, "Principal must not be null (on constructor)");

	return this.Principal.findOne({ principalId: id }, function (err, object) {
		if (err) {
			console.error("PrincipalProvider.getPrincipalById", err);
			return callback(err, null);
		}
		if (object) {
			object.populate('systemGroups', callback);
		} else {
			return callback(null, null);
		}
	});
};

// Move callback to last arguments position
PrincipalProvider.prototype.createPrincipal = function(user, callback, administratorUsername, mustChangePassword, principalSystemGroupAssignationProvider) {
    assertNotNull(this.systemGroupProvider, "SystemGroup or systemGroupProvider must not be null (on constructor)");
	mustChangePassword = mustChangePassword || false;
    var self = this;
	this.systemGroupProvider.getSystemGroupIdByName(this.getUserSystemGroups(user, administratorUsername), function(err, systemGroupObjectId) {
		var myPrincipal = new self.Principal(user);
		myPrincipal.mustChangePassword = mustChangePassword;
		var fullName = user.firstName + " " + user.lastName;
		var reverseFullName = user.lastName + " " + user.firstName;
		myPrincipal.searchText.push(fullName, reverseFullName);
		myPrincipal.save(function(err) {
			if(callback !== undefined) {
				callback(err, myPrincipal);
			}
		});

		self.principalSystemGroupAssignationProvider = principalSystemGroupAssignationProvider || new PrincipalSystemGroupAssignationProvider(self.mongoose);

		for(var i = 0; i < systemGroupObjectId.length; i++) {
			self.principalSystemGroupAssignationProvider.addSystemGroupToPrincipal(myPrincipal, systemGroupObjectId[i]);
		}

	});
};

PrincipalProvider.prototype.getUserSystemGroups = function(user, administratorUsername) {
	var groups = ['EVERYONE'];

	if (user.principalId === administratorUsername) {
		groups.push('ADMINISTRATOR');
	}
	return groups;
};

PrincipalProvider.prototype.getNumPrincipals = function (cb) {
	this.Principal.count({}, function( err, count){
		cb(count);
	});
};

module.exports = PrincipalProvider;
