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
var log2out = require('log2out');
var LazyPrincipalSystemGroupAssignationCleaner = require("../lib/systemgroups/LazyPrincipalSystemGroupAssignationCleaner");

suite('LazyPrincipalSystemGroupAssignationCleaner', function () {
    var sut;
    var principalSystemGroupAssignations, correctSystemGroup;
    var brokenPrincipalSystemGroupAssignationRemoveStub, correctPrincipalSystemGroupAssignationRemoveStub;
    var loggerErrorStub;

    setup(function () {
        var logger = log2out.getLogger('test');
        loggerErrorStub = sinon.stub(logger, 'error');
        sut = new LazyPrincipalSystemGroupAssignationCleaner(logger);
        var brokenPrincipalSystemGroupAssignation = {id: 1, systemGroupId: null, remove: function() {}};
        brokenPrincipalSystemGroupAssignationRemoveStub = sinon.stub(brokenPrincipalSystemGroupAssignation, 'remove');
        correctSystemGroup = {id: 2, name: 'developers'};
        var correctPrincipalSystemGroupAssignation = {id: 1, systemGroupId: correctSystemGroup, remove: function() {}};
        correctPrincipalSystemGroupAssignationRemoveStub = sinon.stub(correctPrincipalSystemGroupAssignation, 'remove');
        principalSystemGroupAssignations = [brokenPrincipalSystemGroupAssignation, correctPrincipalSystemGroupAssignation];
    });

    teardown(function () {
    });

    suite('#cleanBrokenReferences', function () {

        test('Should call remove only for broken systemGroup references', function () {
            sut.cleanBrokenReferences(principalSystemGroupAssignations);
            assert(brokenPrincipalSystemGroupAssignationRemoveStub.called);
            assert.isFalse(correctPrincipalSystemGroupAssignationRemoveStub.called);
        });

        test('Should return only SystemGroups for PrincipalSystemGroupAssignation without broken systemGroup references', function () {
            var actual = sut.cleanBrokenReferences(principalSystemGroupAssignations);
            assert.deepEqual(actual, [correctSystemGroup]);
        });

        test('Should log error if error removing principalSystemGroupAssignation', function() {
            var err = 'an error';
            sut.cleanBrokenReferences(principalSystemGroupAssignations);
            brokenPrincipalSystemGroupAssignationRemoveStub.callArgWith(0, err);
            assert(loggerErrorStub.calledWithExactly('Unable to remove invalid assignation:', err));

        });


    });

});
