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

mongoose.connect("mongodb://mongo.service.consul/eyeos");
var db = mongoose.connection;

db.on('error', function () {
	throw new Error("could not connect!");
});

db.once('open', function () {
	console.log(">>>> Running tests");
	var SystemGroup = require('../src/lib/schemas/SystemGroupSchema')(mongoose).getModel();

	var SystemGroupProvider = require('../src/lib/SystemGroupProvider');

	var systemGroupProvider = new SystemGroupProvider(SystemGroup);

	systemGroupProvider.getSystemGroupIdByName(['EVERYONE'], function(err, systemGroupObjectId) {
		if (err) {
			throw new Error('Error');
			return;
		}
		console.log('ObjectId: ', systemGroupObjectId);
		mongoose.disconnect();
	});
});
