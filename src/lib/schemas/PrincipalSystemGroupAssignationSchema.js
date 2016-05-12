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

function PrincipalSystemGroupAssignationFactory(mongoose) {
    var Schema = mongoose.Schema;

    var PrincipalSystemGroupAssignationSchema = new Schema({
        systemGroupId: {type: String, ref: 'SystemGroup', required: true, index:true},
        principalId: {type: Schema.Types.ObjectId, ref: 'Principal', required: true, index:true}
    });

    PrincipalSystemGroupAssignationSchema.index({systemGroupId: 1, principalId:1}, {unique: true});

    PrincipalSystemGroupAssignationSchema.getModel = function () {
        if (mongoose.models.PrincipalSystemGroupAssignation) {
            return mongoose.model('PrincipalSystemGroupAssignation');
        } else {
            return mongoose.model('PrincipalSystemGroupAssignation', PrincipalSystemGroupAssignationSchema);
        }
    };


    return PrincipalSystemGroupAssignationSchema;
}

module.exports = PrincipalSystemGroupAssignationFactory;
