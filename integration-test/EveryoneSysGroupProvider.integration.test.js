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
var mongoose = require('mongoose');

var SystemGroupModel = require('../src/lib/schemas/SystemGroupSchema')(mongoose).getModel();
var lazyInitEveryoneSystemGroup = require('../src/lib/systemgroups/EveryoneSystemGroupProvider')(SystemGroupModel).lazyInitEveryoneSystemGroup;

suite('EveryoneSysGroupProvider.integration.test', function(){
    var connection;

    setup(function(done){
        mongoose.connect("mongodb://mongo.service.consul/eyeos");
        connection = mongoose.connection;
        connection.on('error', function (err) {
            throw new Error("Could not connect to mongo:" + err.message);
        });
        connection.once('open', function () {
            SystemGroupModel.remove(function(){
                done();
            });
        });
    });

    teardown(function(done){
        connection.close(function(){
            done();
        });
    });

    function existsEveryoneSystemGroup(callback) {
        SystemGroupModel.findOne({id: 'EVERYONE'}, function(err, systemgroup){
            if(err) throw new Error('Error finding EVERYONE systemGroup:', err);

            callback(systemgroup !== null && systemgroup.id === 'EVERYONE');
        });
    }

    test('EVERYONE systemGroup should not exist in an empty environment', function (done) {
        existsEveryoneSystemGroup(function(everyoneExists){
            assert.isFalse(everyoneExists);
            done();
        });
    });

    suite('#lazyInitEveryoneSystemGroup', function(){
        test('Should create a new default EVERYONE systemGroup when it does not exist in mongo', function (done) {
            existsEveryoneSystemGroup(function(everyoneExists){
                assert.isFalse(everyoneExists);

                lazyInitEveryoneSystemGroup(function(err, res){
                    if (err) throw new Error('Error in test:', err);

                    existsEveryoneSystemGroup(function(everyoneExists) {
                        assert.isTrue(everyoneExists);
                        done();
                    });
                });
            });
        });

        test('Should not modify EVERYONE when trying add/remove permissions', function (done) {
            lazyInitEveryoneSystemGroup(function(err, res){
                if (err) throw new Error('Error in test:', err);

                SystemGroupModel.findOne({id: 'EVERYONE'}, function(err, everyoneToModify){
                    everyoneToModify.permissions.splice(0, 1);
                    everyoneToModify.save(function(err){
                        assert.instanceOf(err, Error);
                        done();
                    })
                });
            });
        });


        test('Should not overwrite when EVERYONE already exists in DB', function (done) {
            lazyInitEveryoneSystemGroup(function(err, res){
                if (err) throw new Error('Error in test: first lazyInitEveryoneSystemGroup', err);

                SystemGroupModel.findOne({id: 'EVERYONE'}, function(err, everyoneToModify){
                    if (err) throw new Error('Error in test first findOne:', err);

                    var firstPermissionEnabledAfterChange = !everyoneToModify.permissions[0].enabled;

                    everyoneToModify.permissions[0].enabled = firstPermissionEnabledAfterChange; //change a value and save it.
                    everyoneToModify.save(function(err){
                        if (err) throw new Error('Error in test save:', err);

                        lazyInitEveryoneSystemGroup(function(err, res) { //lazyInit again and check the value did not change between save and lazyInit.
                            if (err) throw new Error('Error in test second lazyInitEveryoneSystemGroup:', err);
                            SystemGroupModel.findOne({id: 'EVERYONE'}, function (err, everyone) {
                                if (err) throw new Error('Error in test second findOne:', err);

                                assert.equal(everyone.permissions[0].enabled, firstPermissionEnabledAfterChange, "First permission.enabled should have not change.");
                                done();

                            });
                        });

                    });
                });
            });
        });
    });

});
