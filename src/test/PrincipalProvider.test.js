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
var PrincipalProvider = require('../lib/PrincipalProvider');
var SystemGroupProvider = require('../lib/SystemGroupProvider');
var PrincipalSystemGroupAssignationProvider = require('../lib/PrincipalSystemGroupAssignationProvider');

suite('PrincipalProvider', function() {
	var sut, systemGroupProvider, systemGroupProviderStub, id, principalSystemGroupAssignationProvider;
	var adminUsername = 'superAdminInMySettings';

	setup(function() {
		id = '123';
		systemGroupProvider = new SystemGroupProvider();
		principalSystemGroupAssignationProvider = sinon.stub(new PrincipalSystemGroupAssignationProvider({}, {}));
		sut = new PrincipalProvider({}, {}, systemGroupProvider);
	});

	[
		{user: {principalId: adminUsername}, expected: ['EVERYONE', 'ADMINISTRATOR']},
		{user: {principalId: 'anything'}, expected: ['EVERYONE']}
	].forEach(function(testCase) {
		test('getUserSystemGroups should return', function() {
			var actual = sut.getUserSystemGroups(testCase.user, adminUsername);
			assert.sameMembers(actual, testCase.expected, 'User doesn\'t match this workgroups');
		});
	});

	test('createPrincipal should call model save', function() {
		systemGroupProviderStub = sinon.stub(systemGroupProvider, 'getSystemGroupIdByName', function(arrayGroups, callback) {
			callback(null, [id]);
		});
		//fake model
		var spy = sinon.spy();
		sut.Principal = function() {
			this.searchText = []
		};
		sut.Principal.prototype.save = spy;
		sut.createPrincipal({"principalId":"user"}, function() {}, 'myAdministratorUsername', true, principalSystemGroupAssignationProvider );
		sinon.assert.called(spy, 'save not called');
	});

    test('getPrincipalById must throw an error when Principal has not been provided on constructor', function () {
        sut = new PrincipalProvider();
        assert.throws(function () { sut.getPrincipalById("eyeos", function () {}); });
    });

    test('createPrincipal must throw an error when systemGroupProvider has not been provided on constructor', function () {
        sut = new PrincipalProvider();
        assert.throws(function () { sut.createPrincipal({}, function () {}); });
    });

	test('getNumPrincipals should return the total rows in the db', function() {
		var spy = sinon.spy();
		sut.Principal = function() {};
		sut.Principal.count = spy;
		sut.getNumPrincipals();
		sinon.assert.called(spy, 'count not called');

	});

});
