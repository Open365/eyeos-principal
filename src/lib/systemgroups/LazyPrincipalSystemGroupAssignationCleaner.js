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

var log2out = require('log2out');

var LazyPrincipalSystemGroupAssignationCleaner = function(injectedLogger) {
    this.logger = injectedLogger || log2out.getLogger('PrincipalSchema');
};

LazyPrincipalSystemGroupAssignationCleaner.prototype.cleanBrokenReferences = function(principalSystemGroupAssignations) {
    var self = this;
    var systemGroups = [];
    var principalSystemGroupAssignationLenght = principalSystemGroupAssignations.length;
    for(i = 0; i < principalSystemGroupAssignationLenght; i++) {
        if (principalSystemGroupAssignations[i].systemGroupId != null) {
            systemGroups.push(principalSystemGroupAssignations[i].systemGroupId);
        } else {
            principalSystemGroupAssignations[i].remove(function(err) {
                self.logger.error('Unable to remove invalid assignation:', err);
            });
        }
    }
    return systemGroups;
};



module.exports = LazyPrincipalSystemGroupAssignationCleaner;
