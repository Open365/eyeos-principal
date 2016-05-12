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

'use strict';

var sinon = require("sinon");
var assert = require("chai").assert;
var mongoose = require('mongoose');
var sut = require('../lib/systemgroups/PermissionsFlattener')



suite('PermissionsFlattener', function () {

	setup(function () {
	});


	suite('flatten', function () {
		test('Should return array of flatten permissions', function () {
			var permissions = [{id: 1, enabled: true}, {id: 2, enabled: false}, {id: 3, enabled: true}, {id: 4, enabled: true}];
			var actual = sut.flatten(permissions);

			var expected = [1, 3, 4];

			assert.deepEqual(actual, expected);
		});

	});

});
