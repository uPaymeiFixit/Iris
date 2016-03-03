# Storage

## Methods

### `storage.get(plug, key, callback)`

* `plug` name of plugin
* `key` storage key
* `callback(value)` function to be called with value

Retrieves value from application data store

### `storage.set(plug, key, val, callback)`

* `plug` name of plugin
* `key` storage key
* `val` value to store
* `callback` function to be called when storage is complete

Sets key-value pair in application data store

### `storage.has(plug, key, callback)`

* `plug` name of plugin
* `key` storage key
* `callback(boolean)` function to be called

Discovers is key exists in application data store

### `storage.remove(plug, key, callback)`

* `plug` name of plugin
* `key` storage key
* `callback` function to be called when removal is complete

Removes key-value pair from application data store
