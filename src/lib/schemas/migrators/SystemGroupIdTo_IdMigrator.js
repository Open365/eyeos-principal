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


// REMOVING OLD FIELD "ID"
// The field "id" with ids of the type "TEACHER" has been replaced with the "_id" field of the document that now
// stores a string id instead of a ObjectId. The code below removes the only two systemGroups ("EVERYONE" and "ADMINISTRATOR")
// created until now removing any document that have this "id" field. This is save because this two systemGropus are
// lazzily created latter. Also we drop the index in this field for ovious reasons.
// THIS CAN BE REMOVED ONCE WE CAN BE SURE THAT THIS CODE EXECUTED AT LEAST ONCE IN EVERY ENVIRONMENT

var SystemGroupIdTo_IdMigrator = {

	migrate: function(systemGroupModel) {
		systemGroupModel.find({id:{$exists:true}}).remove().exec();
		systemGroupModel.collection.dropIndex("id_1");
	}

};

module.exports = SystemGroupIdTo_IdMigrator;
