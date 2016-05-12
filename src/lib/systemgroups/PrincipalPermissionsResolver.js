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

var AdministratorGroup = require('../systemgroups/groups/AdministratorGroup');
var PermissionsFlattener = require('../systemgroups/PermissionsFlattener');

var PrincipalPermissionsResolver = {

    resolve: function resolve(everyonePermissions, principalSystemGroups, principalPermissions) {
        var mergedPermissions = {}; //object in the form: {'eyeos.exec.vdi': {id: 'eyeos.exec.vdi', enabled: true, ...}}

        // first: merge permissions from systemGroups, in case of conflict, true wins.
        principalSystemGroups.forEach(function (systemGroup) {
            if(systemGroup._id === 'EVERYONE') {
                return;
            }
            systemGroup.permissions.forEach(function (permission) {
                if (mergedPermissions[permission.id]) {
                    if (permission.enabled) {// already exists permission: rule: true always win
                        mergedPermissions[permission.id].enabled = true;
                    }
                } else {
                    mergedPermissions[permission.id] = permission;
                }
            });
        });

        //second: merge permissions from everyone: rule: any permission from systemGroups override value in everyone.
        everyonePermissions.forEach(function (permission) {
            if (!mergedPermissions[permission.id]) {
                mergedPermissions[permission.id] = permission; //use everyonePermissions just to fill unexistent permissions
            }
        });

        //third: merge principalPermissions (array of enabled permissions) just override existing permissions
        principalPermissions.forEach(function(permissionName){
            mergedPermissions[permissionName] = {id: permissionName, enabled: true};
        });

        //fourth: Add admin special permission if it's administrator.
        var flattenedAdminPermissions = [];
        var administratorGroup = new AdministratorGroup();
        if (administratorGroup.isAdministrator(principalSystemGroups)) {

            flattenedAdminPermissions = PermissionsFlattener.flatten(administratorGroup.getAdminPermisions());
            mergedPermissions['EYEOS_ADMINISTRATOR']= {id: 'EYEOS_ADMINISTRATOR', enabled: true};
        }

        //last: flatten enabled mergedPermissions to an array of permission.id and filter disabled permissions
        var flattenedPermissions = PermissionsFlattener.flatten(mergedPermissions);
        flattenedPermissions = flattenedPermissions.concat(flattenedAdminPermissions);

        return flattenedPermissions;
    }

};

module.exports = PrincipalPermissionsResolver;
