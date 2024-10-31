# Response Validator

The **POST** `/validate` endpoint provides JSON Schema validation for response data. It supports custom validation options, error reporting, and telemetry integration.

## Headers

- `json-schema`: JSON Schema definition to validate response data against
- `validate-options`: Comma-separated validation flags:
    - `verbose`: Enable detailed error messages
    - `allerrors`: Return all validation errors instead of stopping at first
    - `strict`: Enable strict validation mode
    - `log`: Enable error logging
- `x-hasura-user`: User identifier for tracking validation requests
- `max-validate-errors`: Maximum number of validation errors to return (default: 10)
- `validate-filename`: If provided, writes validation report to file

## Request Body
```json
{
  "rawRequest": GraphQLRequest,
  "session": string,
  "response": {
    "data": any
  }
}
```

## Output Types

### Traces
- Creates OpenTelemetry spans under "schema-validate"
- Tracks validation duration and errors

### Logs
When logging is enabled:
- Error details logged through configured logger
- Includes schema violations and validation context

### Files
When `validate-filename` is provided:
- Writes validation report to specified file
- Contains schema, options, request details and errors
- Includes user and session context

## Response Format
- Success: `{"status": "ok"}`
- Validation Failure: Array of validation errors with details