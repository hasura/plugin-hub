# Response Validator

The **POST** `/validate` endpoint provides JSON Schema validation for response data. It supports custom validation
options, error reporting, and telemetry integration.

## Why?

Consumers of a DDN endpoint are compositing,
selecting and filtering data. A composited
dataset that is defined for a specific purpose,
may have different data quality requirements than
the source datasets. This service provides a
consistent way to define consumer data
quality rules and provide shared evidence in a
consistent format so that data producers, support agents,
and consumers can have meaningful, fact-based discussions on 
data quality issues.

## Headers

- `json-schema`: JSON Schema definition to validate response data against
- `validate-options`: Comma-separated validation flags:
    - `verbose`: Enable detailed error messages
    - `allerrors`: Return all validation errors instead of stopping at first
    - `strict`: Enable strict validation mode
    - `log`: Enable error logging
- `x-hasura-user`: User identifier for tracking validation requests
- `max-validate-errors`: Maximum number of validation errors to return (default: 10)
- `validate-filename`: Writes validation report to file, defaults to query's operation name

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

## Examples

### Query

```graphql
query MyQuery {
    albums {
        albumId
        title
        tracks {
            name
            genre {
                name
            }
        }
        artist {
            name
        }
    }
}
```

### Headers

#### max-validate-errors

```text
20
```

#### validate-options

```text
allErrors,strict,verbose,log
```

#### validate-filename

```text
test.json
```

#### json-schema

To add as a header within the console its easiest to escape double quotes, and remove CRs.

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": [
    "data"
  ],
  "properties": {
    "data": {
      "type": "object",
      "required": [
        "albums"
      ],
      "properties": {
        "albums": {
          "type": "array",
          "items": {
            "type": "object",
            "required": [
              "albumId",
              "artistId",
              "title",
              "artist"
            ],
            "properties": {
              "albumId": {
                "type": "integer",
                "minimum": 1,
                "multipleOf": 2,
                "description": "Must be an even number"
              },
              "artistId": {
                "type": "integer",
                "minimum": 1
              },
              "title": {
                "type": "string",
                "minLength": 1
              },
              "artist": {
                "type": "object",
                "required": [
                  "name"
                ],
                "properties": {
                  "name": {
                    "type": "string",
                    "minLength": 1
                  }
                },
                "additionalProperties": false
              }
            },
            "additionalProperties": false
          }
        }
      },
      "additionalProperties": false
    }
  },
  "additionalProperties": false
}
```

### Outputs

#### file output

[myquery.json](../../../docs/myquery.json)

#### log

[error.log](../../../docs/error.log)

#### trace

![validate trace](../../../docs/validate-trace.png)