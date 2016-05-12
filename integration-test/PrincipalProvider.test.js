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

var sinon = require('sinon');
var assert = require('chai').assert;
var mongoose = require('mongoose');
var wait = require('wait.for');

mongoose.connect("mongodb://mongo.service.consul/test");
var db = mongoose.connection;

db.on('error', function () {
	throw new Error("could not connect!");
});

db.once('open', function (callback) {
	wait.launchFiber(function () {

		console.log(">>>> Running tests");
		var Principal = require('../src/lib/schemas/PrincipalSchema')(mongoose).getModel();
		var SystemGroup = require('../src/lib/schemas/SystemGroupSchema')(mongoose).getModel();

		var PrincipalProvider = require('../src/lib/PrincipalProvider');

		var principalProvider = new PrincipalProvider(Principal);

		wait.for(Principal.remove.bind(Principal, {}));
		wait.for(SystemGroup.remove.bind(SystemGroup, {}));

		var sut = undefined;
		var sysGroup = undefined;

		const permission = "papuki";
		const systemGroupPermission = "eyeos.vdi.exec";
		const finalPermissions = [permission, systemGroupPermission];

		function exerciseSystemGroup () {
			return new SystemGroup({
				id: "maripuri",
				permissions: [{ id: systemGroupPermission, enabled: true}]
			});
		}

		function exercisePrincipalSchema () {
			return new Principal({permissions: [permission], systemGroups: []});
		}

		function exercisePrincipalSchemaFromDatabase(principalObject) {
			return wait.for(principalProvider.getPrincipalById.bind(principalProvider, principalObject.principalId));
		}

		sut = exercisePrincipalSchema();
		sysGroup = exerciseSystemGroup();
		wait.for(sysGroup.save.bind(sysGroup));
		sut.systemGroups.push(sysGroup);
		wait.for(sut.save.bind(sut));

		// need for mongoose reference population
		sut = exercisePrincipalSchemaFromDatabase(sut);

		sut.getPermissions(function(error, dbPermissions) {
            if (error) throw new Error('Error in test:' + error.message);

            var dbPermissionSorted = JSON.stringify(dbPermissions.sort());
            var finalPermissionsSorted = JSON.stringify(finalPermissions.sort());

            var passed = (dbPermissionSorted === finalPermissionsSorted);
            if (!passed) {
                throw new Error(dbPermissionSorted + " !== " + finalPermissionsSorted);
            }

            console.log("ºº ++ [ TEST OK :-) ] ++ ºº");
            mongoose.disconnect();
        });
	});
});
