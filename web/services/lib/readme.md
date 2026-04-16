# Functions Library

## Database Functions

### Needed functions

#### insert() - Amaan

#### update() - Amaan

#### import() - Amaan

### Implemented

#### getData()

This function is implemented as: `getData(table, order, ascending, count?, begin?)`. It is used to get a **set** of entries from the specified table.

##### Parameters

- `table` is a `string` representing the name of a table to get data from.
- `order` is a `string` representing the column to sort the return by.
- `ascending` is a `boolean` weather to sort the result in an ascending or decending order (as defined by supabase).
- `count?` is an optional `number` representing the number of entries to return. If set to `-1` the function will return 'all' or 'remaining' entries.
- `begin?` is an optional `number` representing the row number to start returning entries from, inclusively zero indexed
  
When the function is called without any optional parameters it will return all entries in the table. This is equivalent to entering `count` as `-1`.
When specifying `count` but not `begin`, it will return `count` entry ordered as defined with `order` and `ascending`.
When specifying both `count` and `begin` it will return count entry starting at `begin` ordered as defined with `order` and `ascending`. This also works when specifying `count` as `-1`, returning all entries starting from `begin` (inclusive).

##### Returns

getData() will return an `Array<Object>` object containing the specified entries. It may return an empy `Array<Object>` if there was either an error, or supabase simply did not have any entries in the specified table.

#### getDataFiltered()

This function is implemented as `getDataFiltered(table, filterBy, qualifier, filterTerm)`. It is used to get all entries from a specified table that match the specified search. **NOTE:** This is limited to the first 1000 entries due to supabase api limits.

##### Parameters

- `table` is a `string` representing the name of a table to get data from.
- `filterBy` is the column in `table` to filter by.
- `qualifier` is a typed string representing which entries qualify. The possible types are:
  - `"e"` equal to
  - `"gt"` greater than
  - `"lt"` less than
  - `"gte"` greater than or equal to
  - `"lte"` less than or equal to
- `filterTerm` is the value to qualify every entries `filterBy` row against.

##### Returns

Returns an array of row objects in the format of the specified table.

#### deleteById()

This function is implemented as: `getById(table, id)`. It is used for the targeted removal of entries from a specific table.

##### Parameters

- `table` is a `string` representing the name of a table to get data from.
- `id` is a `number` representing the id of the entry you are deleting.

##### Returns

Does not return anything, however does error to the console upon supabase failure.

#### export()

The function is implemented as `export(table)`

##### Parameters

- `table` is a string representing the table to export from supabase

##### Returns

Does not return anything, however it does print a success mesage to the console and automatically trigger the file download.

