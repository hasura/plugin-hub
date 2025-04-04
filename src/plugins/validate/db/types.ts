// --- Interface Definitions (can be moved to types.ts) ---
export interface InputValidationError {
    instancePath: string;
    schemaPath: string;
    keyword: string;
    params: object; // Keep as object for now, will stringify
    message?: string;
    schema: object | any[]; // Keep as object/array, will stringify
    parentSchema?: object | any[]; // Keep as object/array, will stringify
    data: any; // Can be various types, will convert to string
}

export interface InputValidationResult {
    jsonSchema?: object;
    verbose?: boolean;
    allErrors?: boolean;
    $data?: boolean;
    strict?: boolean;
    user?: string | null;
    role: string | null;
    query: string;
    operationName: string | null;
    variables: string | null | object;
    errors: InputValidationError[];
}