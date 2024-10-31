# File Output

The **POST** `/file-output` endpoint converts response data into various file formats. It supports multiple output formats, custom filenames, and includes telemetry integration.

## Headers

- `file-format`: Output format for the generated files. Supported formats:
    - `html`: HTML table format
    - `markdown`: Markdown table format
    - `csv`: Comma-separated values
    - `tsv`: Tab-separated values
    - `json`: JSON format with pretty printing
    - `arrow`: Apache Arrow IPC format
- `filename-root`: Base filename for the generated files
- `x-hasura-user`: User identifier for tracking file generation requests

## Request Body
```json
{
  "rawRequest": GraphQLRequest,
  "session": string,
  "response": {
    "data": {
      [key: string]: Array<any>
    }
  }
}
```

## Output Types

### Files
- Generates files in the specified format for each dataset in the response
- Files are named using pattern: `${filename-root}-${key}.${format}`
- Data is flattened before conversion using the 'flat' library
- Arquero is used for data transformations and file generation

### Traces
- Creates OpenTelemetry spans under "file-output"
- Tracks file generation duration and output paths
- Includes attributes for each generated file type

### Error Handling
- Returns appropriate error responses for invalid inputs or processing failures
- Includes session and user context in error reporting
- Integrates with telemetry for error tracking

## Response Format
- Success: `{"status": "ok"}`
- Error: Details about the failure with context information

## Examples

For a request with `filename-root: "report"` and data containing a "users" dataset:
- CSV output: `report-users.csv`
- JSON output: `report-users.json`
- HTML output: `report-users.html`