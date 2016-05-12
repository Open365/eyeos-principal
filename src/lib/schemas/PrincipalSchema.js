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

var PrincipalPermissionsResolver = require('../systemgroups/PrincipalPermissionsResolver');
var LazyPrincipalSystemGroupAssignationCleaner = require('../systemgroups/LazyPrincipalSystemGroupAssignationCleaner');

function PrincipalSchemaFactory(mongoose) {
	const Schema = mongoose.Schema;

    const PrincipalSchema = new Schema({
		principalId: {type: String, index: true},
		firstName: {type: String, index: true},
		lastName: {type: String, index: true},
        searchText: {type: [String], index: true},
        permissions: [String],
		systemGroups: [
			{ type: Schema.Types.String, ref: 'SystemGroup' }
		],
        mustChangePassword: { type: Boolean, default: false },
        contacts: [String],
        domain: {type: String, index: true}
	});

    const DefaultEveryoneGroupId = 'EVERYONE';
    require('./SystemGroupSchema')(mongoose);
    var SystemGroup = mongoose.model('SystemGroup');
    var PrincipalSystemGroupAssignationSchema = require('./PrincipalSystemGroupAssignationSchema')(mongoose);
    var PrincipalSystemGroupAssignation = PrincipalSystemGroupAssignationSchema.getModel();

    var lazyPrincipalSystemGroupAssignationCleaner = new LazyPrincipalSystemGroupAssignationCleaner();

    PrincipalSchema.methods.getPermissions = function getPermissions(callback) {
        var self = this;
        SystemGroup.findOne({_id: DefaultEveryoneGroupId}, function (error, everyoneSystemGroup) {
            if (error) return callback(error);

            if (!everyoneSystemGroup) {
                return callback(new Error('Error in getPermissions: EVERYONE systemGroup was not found.'));
            }

            var everyonePermissions = everyoneSystemGroup.permissions;

            PrincipalSystemGroupAssignation.find({principalId: self.id}).populate('systemGroupId').exec(function(error, principalSystemGroupAssignations) {

                var systemGroups = lazyPrincipalSystemGroupAssignationCleaner.cleanBrokenReferences(principalSystemGroupAssignations);

                var mergedPermissions = PrincipalPermissionsResolver.resolve(everyonePermissions, systemGroups, self.permissions);

                return callback(null, mergedPermissions);
            });
        });
    };

	PrincipalSchema.getModel = function () {
		if (mongoose.models.Principal) {
			return mongoose.model('Principal');
		} else {
			return mongoose.model('Principal', PrincipalSchema);
		}
	};

	return PrincipalSchema;
};

module.exports = PrincipalSchemaFactory;
