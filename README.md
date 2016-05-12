Eyeos Principal Library
=======================

## Overview

**eyeos-principal** is a library to manage the Principal and related entities (eg. SystemGroups). 

## How to use it

```js
var PrincipalProvider = require('eyeos-principal');
var principalProvider = new PrincipalProvider();
principalProvider.getPrincipalById('principalId', function(err, principal) {
    console.log(principal.getPermissions());
});
```

### Notes for development mode

If you want (for development purposes only) to enable all permissions in EVERYONE SystemGroup:

```bash
export EYEOS_PRINCIPAL_ENABLE_ALL_PERS_EVERYONE=true
```

For this to take effect the envar must be set in whatever services are initializing 
EVERYONE SystemGroup **WITH AN EMPTY MONGODB**. Currently (apr 215) principalService is the only one 
initializing EVERYONE and ADMINISTRATOR workgroups.

## Quick help

* Install modules

```bash
	$ npm install
```

* Check tests

```bash
    $ ./tests.sh
```
