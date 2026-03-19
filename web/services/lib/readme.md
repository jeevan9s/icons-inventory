# Functions Library

## Database Functions

### Needed functions

### Implemented

#### insert() - Amaan

this function is implemented as `insertEntry(table, data)` It is used to insert a table into the database/supabase

#### Paramenters

- `table` (T) is a `string` representing the name of a table to get data from.
- `data` (row) is a `string` to insert into a specfic table.

#### Returns 

Returns the inserted data as an array of objects or it will return NULL if there is an error

#### update() - Amaan

This function is implemented as `updateEntry(table, id, updatedData)` it is used to update a pre existing table in the database

#### Paramaters 

- `table` (T) is a `string` representing the name of a table to get data from.
- `id` (number) is a `string` and the identifier for the entry to update 
- `updatedData` (row) is a `string` the data to update in the entry.

#### Returns

returns the updated data, or NULL if there was an error 

#### import() - Amaan

imports data from a CSV file in to the supabase table 

#### Parameters 

- `table` (table_name) is a `string` representing the name of a table to get data from.
- `file` (File), the csv file to import 
The function reads the contents of the CSV file to import with file.text(), this will convert the file into a string.
Once the content is read as a string, using Papaparse function from the library will process the CSV file content into rows that are then transformed
into an array of objects. 
`header: true` ensures that the first row is used as the column names for the object keys 
`skipEmptyLines: true` skips any empty rows in the csv
`dynamicTyping: true` will automically convert numeric values and booleans into their proper types instead of keeping them as strings 
`supabase.from(table).insert(rows)` is used to insert all rows at once after the Csv file has been parsed into rows with no errors.

#### Returns

Returns the imported data as an array of objects or NULL if there is an error 

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

