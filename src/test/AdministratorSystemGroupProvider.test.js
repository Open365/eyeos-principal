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

var lazyInitAdministratorSystemGroupFactory = require('../lib/systemgroups/AdministratorSystemGroupProvider');

suite('AdministratorSysGroupProvider', function(){
    var defaultAdministrator;
    var sysgroupModelFake;
    var everyoneSysGroupFake;
    var lazyInitAdministratorSystemGroup = undefined;

    setup(function(){
        defaultAdministrator = {id: 'ADMINISTRATOR', permissions: [{id: 'eyeos.vdi.exec', enabled: true}]};
    });

    teardown(function(){

    });

    suite('#lazyInitAdministratorSystemGroup-everyone_already_in_mongo', function(){

        setup(function(){
            sysgroupModelFake = {
                findOne: sinon.stub().yields(null, defaultAdministrator)
            };

            everyoneSysGroupFake = {
                save: sinon.stub().yields(null)
            };

            lazyInitAdministratorSystemGroup = lazyInitAdministratorSystemGroupFactory(sysgroupModelFake).lazyInitAdministratorSystemGroup
        });

        teardown(function(){

        });

        test('Should callback with object from DB when everyone is in mongo', function () {
            var callback = sinon.spy();

            lazyInitAdministratorSystemGroup(callback, sysgroupModelFake, everyoneSysGroupFake);

            sinon.assert.calledOnce(callback);
            sinon.assert.calledWithExactly(callback, null, defaultAdministrator);
        });

        test('Should callback with default everyone object when everyone is NOT mongo', function () {
            var callback = sinon.spy();

            lazyInitAdministratorSystemGroup(callback, sysgroupModelFake, everyoneSysGroupFake);

            sinon.assert.calledOnce(callback);
            sinon.assert.calledWithExactly(callback, null, sinon.match({id: 'ADMINISTRATOR', permissions: sinon.match.array}));
        });

        test('Should search in mongo ADMINISTRATOR systemGroup', function () {
            function doAsserts(err, everyoneSysGroup){
                sinon.assert.calledOnce(sysgroupModelFake.findOne);
                sinon.assert.calledWithMatch(sysgroupModelFake.findOne, {_id: 'ADMINISTRATOR'}, sinon.match.func);
            }

            lazyInitAdministratorSystemGroup(doAsserts, sysgroupModelFake, everyoneSysGroupFake);
        });

        test('Should not save when ADMINISTRATOR systemGroup is found in mongo', function () {
            function doAsserts(err, everyoneSysGroup){
                sinon.assert.notCalled(everyoneSysGroupFake.save);
            }

            lazyInitAdministratorSystemGroup(doAsserts, sysgroupModelFake, everyoneSysGroupFake);
        });

    });

    suite('#lazyInitAdministratorSystemGroup-everyone_NOT_in_mongo', function(){
        var lazyInitAdministratorSystemGroup = undefined;

        setup(function(){
            sysgroupModelFake = {
                findOne: sinon.stub().yields(null, null)
            };

            everyoneSysGroupFake = {
                save: sinon.stub().yields(null)
            };

            lazyInitAdministratorSystemGroup = lazyInitAdministratorSystemGroupFactory(sysgroupModelFake).lazyInitAdministratorSystemGroup
        });

        teardown(function(){

        });

        test('Should callback with model object from DB when everyone is NOT in mongo', function () {
            var callback = sinon.spy();
            lazyInitAdministratorSystemGroup(callback, everyoneSysGroupFake);

            sinon.assert.calledOnce(callback);
            sinon.assert.calledWithExactly(callback, null, everyoneSysGroupFake);
        });

        test('Should save when EVERYONE systemGroup is NOT found in mongo', function () {
            function doAsserts(err, everyoneSysGroup){
                sinon.assert.calledOnce(everyoneSysGroupFake.save);
            }

            lazyInitAdministratorSystemGroup(doAsserts, everyoneSysGroupFake);
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

            lazyInitAdministratorSystemGroup(doAsserts, everyoneSysGroupFake);
        });
    });


    suite('#lazyInitAdministratorSystemGroup-mongoConnection_error', function(){
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

            var lazyInitAdministratorSystemGroup = lazyInitAdministratorSystemGroupFactory(sysgroupModelFake).lazyInitAdministratorSystemGroup;
            lazyInitAdministratorSystemGroup(doAsserts, sysgroupModelFake, everyoneSysGroupFake);
        });

        test('Should not save when there is a mongodb Error', function () {
            function doAsserts(err, everyoneSysGroup){
                sinon.assert.notCalled(everyoneSysGroupFake.save);
            }

            lazyInitAdministratorSystemGroup(doAsserts, sysgroupModelFake, everyoneSysGroupFake);
        });
    });

});
