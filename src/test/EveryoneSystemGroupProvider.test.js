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

var sinon = require('sinon');
var assert = require('chai').assert;

var lazyInitEveryoneSystemGroupFactory = require('../lib/systemgroups/EveryoneSystemGroupProvider');

suite('EveryoneSysGroupProvider', function(){
    var defaultEveryone;
    var sysgroupModelFake;
    var everyoneSysGroupFake;
    var lazyInitEveryoneSystemGroup = undefined;
    var permissionsInDB = [{id: 'eyeos.vdi.exec', enabled: true}];
    var permissionsInDefaultEveryoneGroup = [
        {enabled: true, id: "eyeos.vdi.exec"},
        {id: "eyeos.login.login", name: "Login to eyeos", description: "Permision to login in eyeos", enabled: true},

    ];

    setup(function() {
        defaultEveryone = {id: 'EVERYONE', permissions: permissionsInDefaultEveryoneGroup};
    });

    teardown(function() {

    });

    suite('#lazyInitEveryoneSystemGroup-everyone_already_in_mongo', function() {

        setup(function(){
            everyoneSysGroupFake = {
                permissions: permissionsInDB,
                save: function() {}
            };

            sysgroupModelFake = {
                findOne: sinon.stub().yields(null, everyoneSysGroupFake)
            };

            lazyInitEveryoneSystemGroup = lazyInitEveryoneSystemGroupFactory(sysgroupModelFake).lazyInitEveryoneSystemGroup
        });

        teardown(function(){

        });

        test('Should search in mongo EVERYONE systemGroup', function () {
            function doAsserts(err, everyoneSysGroup){
                sinon.assert.calledOnce(sysgroupModelFake.findOne);
                sinon.assert.calledWithMatch(sysgroupModelFake.findOne, {_id: 'EVERYONE'}, sinon.match.func);
            }

            lazyInitEveryoneSystemGroup(doAsserts, sysgroupModelFake, everyoneSysGroupFake);
        });

        test('When new permissions in EveryoneGroup are not in DB should call systemgroup save', function () {
            var everyoneSysGroupFakeSaveStub = sinon.stub(everyoneSysGroupFake, 'save');

            lazyInitEveryoneSystemGroup(function() {}, sysgroupModelFake, everyoneSysGroupFake);
            sinon.assert.calledOnce(everyoneSysGroupFakeSaveStub);
        });

        test('When new permissions in EveryoneGroup are not in DB should call callback with systemgroup with new permissions added', function () {

            var everyoneSysGroupFakeSaveStub = sinon.stub(everyoneSysGroupFake, 'save');
            everyoneSysGroupFakeSaveStub.callsArg(0);

            var actualSystemGroup = null;
            var callback = function(err, systemgroup) {
                actualSystemGroup = systemgroup;
            };

            lazyInitEveryoneSystemGroup(callback, sysgroupModelFake, everyoneSysGroupFake);
            assert.deepEqual(actualSystemGroup.permissions, permissionsInDefaultEveryoneGroup);
        });

    });

    suite('#lazyInitEveryoneSystemGroup-everyone_NOT_in_mongo', function(){
        var lazyInitEveryoneSystemGroup = undefined;

        setup(function(){
            sysgroupModelFake = {
                findOne: sinon.stub().yields(null, null)
            };

            everyoneSysGroupFake = {
                save: sinon.stub().yields(null)
            };

            lazyInitEveryoneSystemGroup = lazyInitEveryoneSystemGroupFactory(sysgroupModelFake).lazyInitEveryoneSystemGroup
        });

        teardown(function(){

        });

        test('Should callback with model object from DB when everyone is NOT in mongo', function () {
            var callback = sinon.spy();
            lazyInitEveryoneSystemGroup(callback, everyoneSysGroupFake);

            sinon.assert.calledOnce(callback);
            sinon.assert.calledWithExactly(callback, null, everyoneSysGroupFake);
        });

        test('Should save when EVERYONE systemGroup is NOT found in mongo', function () {
            function doAsserts(err, everyoneSysGroup){
                sinon.assert.calledOnce(everyoneSysGroupFake.save);
            }

            lazyInitEveryoneSystemGroup(doAsserts, everyoneSysGroupFake);
        });

        test('Should callback with error when EVERYONE systemGroup is NOT found in mongo and save causes error', function () {
            everyoneSysGroupFake = {
                save: sinon.stub().yields('Error saving in mongodb')
            };

            function doAsserts(err, everyoneSysGroup){
                sinon.assert.calledOnce(everyoneSysGroupFake.save);
                assert.isDefined(err);
                assert.isNotNull(err);
            }

            lazyInitEveryoneSystemGroup(doAsserts, everyoneSysGroupFake);
        });
    });


    suite('#lazyInitEveryoneSystemGroup-mongoConnection_error', function(){
        var sysgroupModelFake;

        setup(function(){
            sysgroupModelFake = {
                findOne: sinon.stub().yields('MongoDB error ocurred XXXX. (just unit testing)', null)
            };

            everyoneSysGroupFake = {
                save: sinon.stub().yields(null)
            };
        });

        teardown(function(){

        });

        test('Should callback with error when there is a mongodb Error', function () {
            function doAsserts(err, everyoneSysGroup){
                sinon.assert.calledOnce(sysgroupModelFake.findOne);
                assert.isDefined(err);
                assert.isNotNull(err);
            }

            var lazyInitEveryoneSystemGroup = lazyInitEveryoneSystemGroupFactory(sysgroupModelFake).lazyInitEveryoneSystemGroup;
            lazyInitEveryoneSystemGroup(doAsserts, sysgroupModelFake, everyoneSysGroupFake);
        });

        test('Should not save when there is a mongodb Error', function () {
            function doAsserts(err, everyoneSysGroup){
                sinon.assert.notCalled(everyoneSysGroupFake.save);
            }

            lazyInitEveryoneSystemGroup(doAsserts, sysgroupModelFake, everyoneSysGroupFake);
        });
    });

});
