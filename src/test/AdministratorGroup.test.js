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

var sinon = require("sinon");
var assert = require("chai").assert;
var mongoose = require('mongoose');
var AdministratorGroup = require('../lib/systemgroups/groups/AdministratorGroup');
const EveryoneGroup = require('../lib/systemgroups/groups/EveryoneGroup');



suite('AdministratorGroup', function () {
	var sut;

	setup(function () {
		sut = new AdministratorGroup();
	});

	teardown(function () {
	});

	suite('getAdminPermisions', function () {

		test('Should include all permissions in EveryoneGroup ', function () {
			var adminPerms = sut.getAdminPermisions();
			assert.equal(adminPerms.length, EveryoneGroup.permissions.length);

			adminPerms.forEach(function(perm) {
				assert.isTrue(EveryoneGroup.permissions.some(function(everyOnePerm) {
					return perm.id === everyOnePerm.id
				}));
			});

		});

		test('Should have all permissions enabled', function () {
			var adminPerms = sut.getAdminPermisions();

			assert.isTrue(adminPerms.every(function(perm) {
				return perm.enabled === true;
			}));

		});

	});

});
