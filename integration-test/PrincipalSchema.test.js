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

		wait.for(Principal.remove.bind(Principal, {}));
		wait.for(SystemGroup.remove.bind(SystemGroup, {}));

		var sut = undefined;
		var sysGroup = undefined;
        var everyone = undefined;

		const permission = "papuki";
		const systemGroupPermission = "eyeos.vdi.exec";
        const everyonePermission = "login";
        const ignoredPermission = "i.am.not.here";

        const EveryoneId = "EVERYONE";
		function exerciseSystemGroup () {
			return new SystemGroup({
				id: "maripuri",
				permissions: [{ id: systemGroupPermission, enabled: true}, { id: ignoredPermission, enabled: false }]
			});
		}

        function exerciseEveryoneSystemGroup() {
            return new SystemGroup({
                id: EveryoneId,
                permissions: [{ id: permission, enabled: false }, {id: systemGroupPermission, enabled: false }, {id: ignoredPermission, enabled: true }, { id: everyonePermission, enabled: true }]
            })
        }
		function exercisePrincipalSchema () {
			return new Principal({permissions: [permission], systemGroups: []});
		}

		function exercisePrincipalSchemaFromDatabase(principalObject) {
			var query = Principal.findOne({ _id: principalObject._id }).populate('systemGroups');
			return wait.for(query.exec.bind(query));
		}

		sut = exercisePrincipalSchema();
		sysGroup = exerciseSystemGroup();
        everyone = exerciseEveryoneSystemGroup();

		wait.for(everyone.save.bind(everyone));
		wait.for(sysGroup.save.bind(sysGroup));
		sut.systemGroups.push(sysGroup._id);
		sut.systemGroups.push(everyone._id);
		wait.for(sut.save.bind(sut));

		// need for mongoose reference population
		sut = exercisePrincipalSchemaFromDatabase(sut);

        const permissions = sut.getPermissions().sort();

		var passed = permissions.indexOf(permission) > -1;
		if (!passed) {
			throw new Error("checking permission from principal permission array failed.");
		}

		passed = permissions.indexOf(systemGroupPermission) > -1;
		if (!passed) {
            throw new Error("checking permission from systemGroups permission array failed.");
		}

        passed = JSON.stringify(permissions) === JSON.stringify([ permission, systemGroupPermission, everyonePermission ].sort());
        if (!passed) {
            throw new Error("checking permission inheritance from systemGroups permission array failed.");
        }

		console.log("ºº ++ [ TEST OK :-) ] ++ ºº");
		mongoose.disconnect();
	});
});
