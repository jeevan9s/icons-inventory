// mess around with TS here...
// i heavily reccomend TS docs or using AI to explain syntax
// to run, open terminal and run: npx ts-node web/services/sandbox.ts

console.log("yoyo") // mess around with this, works pretty much like a print statement by outputting in terminal or in browser (inspect element)

/*
FUNCTION PROTOTYPES:

** in general, use regular/default export functions for core logic (synchronous) that doesn't require API calls. (i.e. computing, validation, sorting
** use sync functions for cases that require databases, API calls (asynchronous); they allow you to _await_ a function with a "promise" return type, very useful - highly suggest researching briefly on sync vs async functions.

// regular function: performs synchronous logic, returns a value
export function function_name(param1: type, param2: type): return_type {
  implementation
}

// default export function: main utility or entry point from a file
export default function default_function(param1: type): return_type {
  implementation
}

// arrow function: concise synchronous function assigned to a const
export const arrow_function = (param1: type): return_type => {
  implementation
}

// aync function: performs async operations, returns a Promise
export async function async_function_name(param1: type): Promise<return_type> {
  implementation
}

// async arrow function: concise async function assigned to a const
export const async_arrow_function = async (param1: type): Promise<return_type> => {
  implementation
}

** the "export" keyword enables the function to be used/invoked in other files
*/

// simple sync function
export default function addNumbers(a: number, b: number): number {
  return a + b;
}

// for some examples of async functions, check out services/auth. some async implementations used there. 

/*
TYPE & INTERFACE EXAMPLES

// type: flexible alias or union, good for simple values or function signatures
type Status = "active" | "inactive"; (active OR inactive)

// interface: structured object with optional fields, used for domain models
interface Entity {
  id: string;
  name: string;
  status: Status;
  optionalField?: string;
}
*/


