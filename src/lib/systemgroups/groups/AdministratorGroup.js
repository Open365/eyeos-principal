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

const EveryoneGroup = require('./EveryoneGroup');

const AdministratorGroupModel = {
    _id: 'ADMINISTRATOR',
    name: 'ADMINISTRATOR',
    description: 'An administrator can do all on the system'
};

const DefaultAdministratorGroupId  = 'ADMINISTRATOR';

function AdministratorGroup() {
}

AdministratorGroup.prototype.getModel = function() {
    return AdministratorGroupModel;
};

AdministratorGroup.prototype.getAdminPermisions = function() {
    return EveryoneGroup.permissions.map(function (everyonePermission) {
        var permission = JSON.parse(JSON.stringify(everyonePermission));
        permission.enabled = true;
        return permission;
    });
};

AdministratorGroup.prototype.isAdministrator = function(systemGroups) {
    for(var x = 0, max = systemGroups.length; x < max; x++) {
        if (systemGroups[x].id === DefaultAdministratorGroupId) {
            return true;
        }
    }
    return false;
};


module.exports = AdministratorGroup;
