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
var lazyInitAdministratorSystemGroup = require('../src/lib/systemgroups/AdministratorSystemGroupProvider')(SystemGroupModel).lazyInitAdministratorSystemGroup;

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
        SystemGroupModel.findOne({id: 'ADMINISTRATOR'}, function(err, systemgroup){
            if(err) throw new Error('Error finding ADMINISTRATOR systemGroup:', err);

            callback(systemgroup !== null && systemgroup.id === 'ADMINISTRATOR');
        });
    }

    test('ADMINISTRATOR systemGroup should not exist in an empty environment', function (done) {
        existsEveryoneSystemGroup(function(administratorExists){
            assert.isFalse(administratorExists);
            done();
        });
    });

    suite('#lazyInitAdministratorSystemGroup', function(){
        test('Should create a new default ADMINISTRATOR systemGroup when it does not exist in mongo', function (done) {
            existsEveryoneSystemGroup(function(administratorExists){
                assert.isFalse(administratorExists);

                lazyInitAdministratorSystemGroup(function(err, res){
                    if (err) throw new Error('Error in test:', err);

                    existsEveryoneSystemGroup(function(administratorExists) {
                        assert.isTrue(administratorExists);
                        done();
                    });
                });
            });
        });

        test('Should not modify ADMINISTRATOR when trying add/remove permissions', function (done) {
            lazyInitAdministratorSystemGroup(function(err, res){
                if (err) throw new Error('Error in test:', err);

                SystemGroupModel.findOne({id: 'ADMINISTRATOR'}, function(err, administratorToModify){
                    administratorToModify.permissions.splice(0, 1);
                    administratorToModify.save(function(err){
                        assert.instanceOf(err, Error);
                        done();
                    })
                });
            });
        });


        test('Should not overwrite when ADMINISTRATOR already exists in DB', function (done) {
            lazyInitAdministratorSystemGroup(function(err, res){
                if (err) throw new Error('Error in test: first lazyInitAdministratorSystemGroup', err);

                SystemGroupModel.findOne({id: 'ADMINISTRATOR'}, function(err, administratorToModify){
                    if (err) throw new Error('Error in test first findOne:', err);

                    var firstPermissionEnabledAfterChange = !administratorToModify.permissions[0].enabled;

                    administratorToModify.permissions[0].enabled = firstPermissionEnabledAfterChange; //change a value and save it.
                    administratorToModify.save(function(err){
                        if (err) return done();
                        throw new Error("Save should fail because ADMINISTRATOR is read-only");
                    });
                });
            });
        });
    });

});
