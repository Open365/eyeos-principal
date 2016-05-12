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
var PrincipalPermissionsResolver = require('../lib/systemgroups/PrincipalPermissionsResolver');
var AdministratorGroup = require('../lib/systemgroups/groups/AdministratorGroup');
var PermissionsFlattener = require('../lib/systemgroups/PermissionsFlattener');


suite('PrincipalPermissionsResolver', function () {
    var principal;
    var everyoneSystemGroup;
    var anEnabledPermission = 'eyeos.vdi.exec';
    var aDisabledPermission = 'eyeos.papuki';
    var permissionOne = 'permissionOne';
    var permissionTwo = 'permissionTwo';
    var permissionThree = 'permissionThree';
    var permissionFour = 'permissionFour';
    var permissionFive = 'permissionFive';
    var permissionSix = 'permissionSix';
    var permissionSeven = 'permissionSeven';
    setup(function () {

        everyoneSystemGroup = {
            id: 'EVERYONE',
            name: 'All users belong to EVERYONE',
            description: 'All users belong to EVERYONE',
            permissions: [
                {
                    id: anEnabledPermission,
                    name: 'Execute VDI applications',
                    description: 'Permission to execute Virtualized applications such as Word, Excel...',
                    enabled: true
                },
                {
                    id: aDisabledPermission,
                    name: "You're a papuki",
                    description: 'Very papuki developers, and QA have this permission',
                    enabled: false
                }
            ]
        };

        principal = {
            principalId: 'marcus',
            permissions: [],
            systemGroups: []
        };
    });

    teardown(function () {
    });

    suite('#mergePermissions', function () {
        test('Should return enabled everyonePermissions when principal has no systemGroups nor permissions', function () {
            var mergedPermissions = PrincipalPermissionsResolver.resolve(everyoneSystemGroup.permissions, principal.systemGroups, principal.permissions);

            assert.isArray(mergedPermissions);
            assert.equal(mergedPermissions.length, 1);
            assert.include(mergedPermissions, anEnabledPermission);
            assert.notInclude(mergedPermissions, aDisabledPermission);
        });

        test('Should correctly add principal.permissions to mergedPermissions', function () {
            var ppalPermission1 = 'ppalPermission1';
            var ppalPermission2 = 'ppalPermission2';
            principal.permissions = [ppalPermission1, ppalPermission2];

            var mergedPermissions = PrincipalPermissionsResolver.resolve(everyoneSystemGroup.permissions, principal.systemGroups, principal.permissions);

            assert.isArray(mergedPermissions);
            assert.equal(mergedPermissions.length, (1 + principal.permissions.length));
            assert.include(mergedPermissions, anEnabledPermission);
            assert.notInclude(mergedPermissions, aDisabledPermission);
            assert.include(mergedPermissions, ppalPermission1);
            assert.include(mergedPermissions, ppalPermission2);
        });

        test('Should merge permisions from systemGroups. In case of conflict, true overrides false.', function () {
            everyoneSystemGroup.permissions = []; //remove permissions from everyone to test only merge of systemGroups

            principal.systemGroups = [
                {
                    id: 'aSystemGroup',
                    permissions: [
                        {id: permissionOne, enabled: true},
                        {id: permissionTwo, enabled: false},
                        {id: permissionThree, enabled: true},
                        {id: permissionFour, enabled: false},
                        {id: permissionFive, enabled: true},
                        {id: permissionSeven, enabled: true}
                    ]
                },
                {
                    id: 'anotherSystemGroup',
                    permissions: [
                        {id: permissionOne, enabled: false},
                        {id: permissionTwo, enabled: true},
                        {id: permissionThree, enabled: true},
                        {id: permissionFour, enabled: false},
                        {id: permissionFive, enabled: true},
                        {id: permissionSix, enabled: true}
                    ]
                }
            ];

            var mergedPermissions = PrincipalPermissionsResolver.resolve(everyoneSystemGroup.permissions, principal.systemGroups, principal.permissions);

            assert.include(mergedPermissions, permissionOne);
            assert.include(mergedPermissions, permissionTwo);
            assert.include(mergedPermissions, permissionThree);
            assert.notInclude(mergedPermissions, permissionFour);
            assert.include(mergedPermissions, permissionFive);
            assert.include(mergedPermissions, permissionSix);
            assert.include(mergedPermissions, permissionSeven);
        });

        test('Should merge permissions in everyone to permissions in principalSystemGroups, principalSystemGroups permissions override everyone', function () {
            everyoneSystemGroup.permissions = [
                {id: permissionOne, enabled: true},
                {id: permissionTwo, enabled: false},
                {id: permissionThree, enabled: true},
                {id: permissionFour, enabled: false},
                {id: permissionSix, enabled: false} //not overriden
            ];

            principal.systemGroups = [
                {
                    id: 'aSystemGroup',
                    permissions: [
                        {id: permissionOne, enabled: true}, //same value as everyone
                        {id: permissionTwo, enabled: false}, //same value as everyone
                        {id: permissionThree, enabled: false}, //should override everyone's
                        {id: permissionFour, enabled: true}, //should override everyone's
                        {id: permissionFive, enabled: true} //not in everyone
                    ]
                }
            ];

            var mergedPermissions = PrincipalPermissionsResolver.resolve(everyoneSystemGroup.permissions, principal.systemGroups, principal.permissions);

            assert.include(mergedPermissions, permissionOne);
            assert.notInclude(mergedPermissions, permissionTwo);
            assert.notInclude(mergedPermissions, permissionThree);
            assert.include(mergedPermissions, permissionFour);
            assert.include(mergedPermissions, permissionFive);
            assert.notInclude(mergedPermissions, permissionSix);
            assert.equal(mergedPermissions.length, 3);
        });

        test('Should merge everything correctly, without duplicates', function () {
            everyoneSystemGroup.permissions = [
                {id: permissionOne, enabled: true},
                {id: permissionTwo, enabled: false},
                {id: permissionThree, enabled: true},
                {id: permissionFour, enabled: false},
                {id: permissionSix, enabled: false} //not overriden
            ];

            principal.systemGroups = [
                {
                    id: 'aSystemGroup',
                    permissions: [
                        {id: permissionOne, enabled: true}, //same value as everyone
                        {id: permissionTwo, enabled: false}, //same value as everyone
                        {id: permissionThree, enabled: false}, //should override everyone's
                        {id: permissionFour, enabled: true}, //should override everyone's
                        {id: permissionFive, enabled: true} //not in everyone
                    ]
                }
            ];
            principal.permissions = [permissionOne, permissionTwo, permissionSeven];

            var mergedPermissions = PrincipalPermissionsResolver.resolve(everyoneSystemGroup.permissions, principal.systemGroups, principal.permissions);

            assert.include(mergedPermissions, permissionOne);
            assert.include(mergedPermissions, permissionTwo);
            assert.notInclude(mergedPermissions, permissionThree);
            assert.include(mergedPermissions, permissionFour);
            assert.include(mergedPermissions, permissionFive);
            assert.notInclude(mergedPermissions, permissionSix);
            assert.include(mergedPermissions, permissionSeven);
            assert.equal(mergedPermissions.length, 5);
        });


        test('If is member of ADMINISTRATOR systemGroup should add EYEOS_ADMINISTRATOR permission', function () {
            everyoneSystemGroup.permissions = [];

            principal.systemGroups = [
                {
                    id: 'ADMINISTRATOR',
                    permissions: []
                }
            ];

            principal.permissions = ['a.permission'];

            var administratorGroup = new AdministratorGroup();
            var adminPermissions = PermissionsFlattener.flatten(administratorGroup.getAdminPermisions());


            var actualMergedPermissions = PrincipalPermissionsResolver.resolve(everyoneSystemGroup.permissions, principal.systemGroups, principal.permissions);
            var exepectedPermissions = ['a.permission', 'EYEOS_ADMINISTRATOR'].concat(adminPermissions);

            assert.deepEqual(actualMergedPermissions, exepectedPermissions);
        });

        test('Should not consider everyone as a normal systemgroup', function () {

            var everyonePermissions = [
                {id: permissionOne, enabled: true}, //same value as everyone
                {id: permissionTwo, enabled: false}, //same value as everyone
                {id: permissionThree, enabled: false}, //should be overriden
                {id: permissionFour, enabled: true} //should be overriden
            ];

            principal.systemGroups = [
                {
                    _id: 'aSystemGroup',
                    permissions: [
                        {id: permissionOne, enabled: true}, //same value as everyone
                        {id: permissionTwo, enabled: false}, //same value as everyone
                        {id: permissionThree, enabled: true}, //should override everyone's
                        {id: permissionFour, enabled: false}, //should override everyone's
                        {id: permissionFive, enabled: true} //not in everyone
                    ]
                },{
                    _id: 'EVERYONE',
                    permissions: everyonePermissions
                }
            ];

            everyoneSystemGroup.permissions = everyonePermissions;

            var systemGroups = principal.systemGroups;
            var principalPerms = [];
            var expectedPermissions = ["permissionOne", "permissionThree", "permissionFive"];
            var actualMergedPermissions = PrincipalPermissionsResolver.resolve(everyonePermissions, systemGroups, principalPerms);
            assert.deepEqual(actualMergedPermissions, expectedPermissions);
        });
    });

});
