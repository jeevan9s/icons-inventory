# Functions Library

## Database Functions

### Needed functions

#### insert() - Amaan

#### delete() - Spencer

#### update() - Amaan

#### export() - Spencer

#### import() - Amaan

### Implemented

#### getData()
This function is implemented as: `getData(table, order, ascending, count?, begin?)`.

#### Parameters

- `table` is a `string` representing the name of a table to get data from.
- `order` is a `string` representing the column to sort the return by.
- `ascending` is a `boolean` weather to sort the result in an ascending or decending order (as defined by supabase).
- `count?` is an optional `number` representing the number of entries to return. If set to `-1` the function will return 'all' or 'remaining' entries.
- `begin?` is an optional `number` representing the row number to start returning entries from, inclusively zero indexed
  
When the function is called without any optional parameters it will return all entries in the table. This is equivalent to entering `count` as `-1`.
When specifying `count` but not `begin`, it will return `count` entry ordered as defined with `order` and `ascending`.
When specifying both `count` and `begin` it will return count entry starting at `begin` ordered as defined with `order` and `ascending`. This also works when specifying `count` as `-1`, returning all entries starting from `begin` (inclusive).

#### Returns

getData() will return an `Array<Object>` object containing the specified entries. It may return an empy `Array<Object>` if there was either an error, or supabase simply did not have any entries in the specified table.