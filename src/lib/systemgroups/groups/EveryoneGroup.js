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

var EYEOS_PRINCIPAL_ENABLE_ALL_PERS_EVERYONE = (process.env.EYEOS_PRINCIPAL_ENABLE_ALL_PERS_EVERYONE === 'true');

const EveryoneGroup = {
    _id: 'EVERYONE',
    name: 'EVERYONE',
    description: 'All users belong to EVERYONE',
    permissions: [
        {
            id: 'eyeos.vdi.exec',
            name: 'Execute VDI applications',
            description: 'Permission to execute Virtualized applications such as Word, Excel...',
            enabled: EYEOS_PRINCIPAL_ENABLE_ALL_PERS_EVERYONE || true
        },
        {
            id: 'eyeos.login.login',
            name: "Login to eyeos",
            description: 'Permision to login in eyeos',
            enabled: EYEOS_PRINCIPAL_ENABLE_ALL_PERS_EVERYONE || true
        }

    ]
}; // for the moment, everyone will be statically maintained here.

module.exports = EveryoneGroup;
