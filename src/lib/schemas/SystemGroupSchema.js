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

function SystemGroupSchemaFactory(mongoose) {
	var Schema = mongoose.Schema;

	var SystemGroupSchema = new Schema({
		_id: {type:  String},
        name: {type: String, unique: true},
        description: String,
		permissions: [ { id: String, enabled: Boolean, name: String, description: String } ]
	});

	SystemGroupSchema.getModel = function () {
		if (mongoose.models.SystemGroup) {
			return mongoose.model('SystemGroup');
		} else {
			return mongoose.model('SystemGroup', SystemGroupSchema);
		}
	};

    SystemGroupSchema.uneditableAdministrator = function (next) {
        var self = this;
        if (this._id === 'ADMINISTRATOR') {
            SystemGroupSchema.getModel().findOne({_id: 'ADMINISTRATOR'}, function (err, admin) {
                if (err) return next(err);

                if (admin) {
                    return next(new Error("You can't edit the ADMINISTRATOR group"));
                } else {
                    return next();
                }
            });
        } else {
            return next();
        }
    };

    SystemGroupSchema.unremovableSystemGroup = function (sysgroup) {
        return function (next) {
            if (this._id === sysgroup) {
                return next(new Error('Not allowed to remove ' + sysgroup + 'systemGroup'));
            } else {
                return next();
            }
        };
    };

    var SystemGroupAdministratorMigrator = require('./migrators/SystemGroupAdministratorMigrator');
    var SystemGroupIdTo_IdMigrator = require('./migrators/SystemGroupIdTo_IdMigrator');
    var SystemGroupEveryoneMigrator = require('./migrators/SystemGroupEveryoneMigrator');

    SystemGroupAdministratorMigrator.migrate(SystemGroupSchema.getModel());
    SystemGroupIdTo_IdMigrator.migrate(SystemGroupSchema.getModel());
    SystemGroupEveryoneMigrator.migrate(SystemGroupSchema.getModel());

    SystemGroupSchema.validateNotRemovingEveryone = SystemGroupSchema.unremovableSystemGroup("EVERYONE");
    SystemGroupSchema.validateNotRemovingAdministrator  = SystemGroupSchema.unremovableSystemGroup("ADMINISTRATOR");

    SystemGroupSchema.pre('save', SystemGroupSchema.uneditableAdministrator);

    SystemGroupSchema.pre('remove', SystemGroupSchema.validateNotRemovingEveryone);
    SystemGroupSchema.pre('remove', SystemGroupSchema.validateNotRemovingAdministrator);

    SystemGroupSchema.lazyInitEveryoneSystemGroup = require('../systemgroups/EveryoneSystemGroupProvider')(SystemGroupSchema.getModel()).lazyInitEveryoneSystemGroup;
    SystemGroupSchema.lazyInitAdministratorSystemGroup = require('../systemgroups/AdministratorSystemGroupProvider')(SystemGroupSchema.getModel()).lazyInitAdministratorSystemGroup;

	return SystemGroupSchema;
}

module.exports = SystemGroupSchemaFactory;
