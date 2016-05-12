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
var SystemGroupSchema = require('../lib/schemas/SystemGroupSchema')(mongoose);

suite('SystemGroupSchema', function () {
    var aSystemGroup;
    var getModelFake;
    var systemGroupModelFake;

    setup(function () {
        aSystemGroup = {
            _id: 'EVERYONE',
            permissions: [{id:'eyeos.vdi.exec', enabled: true}]
        };

        systemGroupModelFake = {
            findOne: sinon.stub().yields(null, aSystemGroup)
        };

        getModelFake = sinon.stub(SystemGroupSchema, 'getModel').returns(systemGroupModelFake);

    });

    teardown(function () {
        getModelFake.restore();
    });

    suite('#validateNotRemovingEveryone', function () {
        test('Should call next when systemGroup is NOT EVERYONE', function () {
            var next = sinon.spy();

            aSystemGroup._id = 'NOT EVERYONE';

            SystemGroupSchema.validateNotRemovingEveryone.call(aSystemGroup, next);

            sinon.assert.calledOnce(next);
            assert.deepEqual(next.args[0], []);
        });

        test('Should call next with Error when systemGroup is EVERYONE and trying to modify permissions.length', function () {
            var next = sinon.spy();

            aSystemGroup._id = 'EVERYONE';

            SystemGroupSchema.validateNotRemovingEveryone.call(aSystemGroup, next);

            sinon.assert.calledOnce(next);
            sinon.assert.calledWithExactly(next, sinon.match.instanceOf(Error));
        });

    });

});
