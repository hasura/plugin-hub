# Hasura Plugin Hub

The Hasura Plugin Hub is a centralized server for hosting Data Delivery Network (DDN) plugins. It provides a standardized way to extend Hasura's functionality through a collection of microservices that can be easily integrated into your Hasura deployment.

## Architecture
The Plugin Hub operates as a lightweight web server that hosts various plugins as HTTP endpoints. Each plugin is designed to integrate seamlessly with Hasura's DDN architecture, providing specific functionality while maintaining consistent patterns for authentication, error handling, and telemetry.

## Available Plugins

* **Validate** - [README.md](src/plugins/validate/README.md)  
  JSON Schema validation plugin for query responses. Supports custom validation rules, error reporting, and telemetry integration.

* **File Output** - [README.md](src/plugins/file/README.md)  
  Data export plugin that converts query responses into various file formats. Supports HTML, Markdown, CSV, TSV, JSON, and Arrow formats with custom filename configuration.

* **Profile** - [README.md](src/plugins/profile/README.md)  
  Data profiling plugin that analyzes query responses and generates comprehensive statistical reports. Supports numerical analysis, categorical distributions, datetime patterns, and nested field profiling.

## Basic Use Case Example

### Scenario: Sales Analysis Team Use Case

A sales analysis team must ensure no negative quantities exist in completed sales across multiple regional systems. This requirement comes from combining data across regional sales systems that handle refunds differently - a perfect example of a quality requirement that emerges only when compositing data across domains. While each regional system's data might be valid within its domain, the combined view requires additional validation rules.

#### Implementation Using Hasura DDN and Data Validator

##### The base query:
```graphql
query findCarts {
  carts {
    user { name }
    is_complete
    cart_items {
      quantity
      product {
        name
        manufacturer { name }
      }
    }
  }
}
```

##### Add validation rules through JSON Schema headers
Here's a fragment of the complete schema focusing on the quantity validation:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "data": {
      "type": "object",
      "properties": {
        "carts": {
          "type": "array",
          "items": {
            // ... additional schema properties ...
            "if": {
              "properties": {
                "is_complete": { "const": true }
              }
            },
            "then": {
              "properties": {
                "cart_items": {
                  "items": {
                    "properties": {
                      "quantity": {
                        "minimum": 1,
                        "description": "Refunds must not be represented as negative quantities"
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
```

#### Configuration Options

Control validation behavior through these headers:
* `validate-options`: Comma-separated list of options (log, strict, allErrors, verbose)
* `max-validate-errors`: Set the maximum number of errors to report (default: 10)
* `validate-filename`: Custom filename for validation results

#### Results and Monitoring

The system provides multiple ways to access validation results:

##### 1. Immediate Results
* Validation results in structured JSON format
* Summary in trace log (available to support team)
* Optional validation errors in plugin server's error.log

##### 2. Profiling Report Retrieval
* Results stored for 15 minutes
* Access via: `http(s)://<plugin-hub><port>/files/<validate-filename>`
* Example: `http://localhost:8787/files/findcarts.json`
* Default filename is `<operation_name>.json` unless specified in headers

##### 3. Error Detail Format
```json
{
  "instancePath": "/carts/0/cart_items/2/quantity",
  "schemaPath": "#/properties/carts/items/then/properties/cart_items/items/properties/quantity/minimum",
  "keyword": "minimum",
  "params": {
    "comparison": ">=",
    "limit": 1
  },
  "message": "must be >= 1",
  "data": -2
}
```
This shows the exact record location, validation rule, and failing value.

##### 4. Monitoring Integration
* Integration with OpenTelemetry for observability
* Support for operational dashboards and alerts
* Real-time notification capabilities

## Plugin Integration
To integrate a plugin with your Hasura instance:

2. Add the plugin endpoint URL to your Hasura DDN configuration. Add the files at `./config/globals/metadata` to you supergraph's `globals/metadata` folder.
2. Configure the Hasura DDN environment variables by adding the values at `./config/.env` to your supergraph's `.env` file.
3. Build the supergraph and restart it. For local development the commands would be ```ddn supergraph build local & ddn run docker-start```
4. Launch the `plugin-hub` with `docker compose up`. Or, alternatively, for local development you may want to add `<path-to-compose.yaml>` to the supergraph's root `compose.yaml/include`.
5. Launch the console, create a query, and add any of the documented variables. If you are creating a file - it will located at `./tmp` in the `plugin-hub` root. Or, you can download the file using `http://localhost:8787/files/<filename>`.

## Development
New plugins should follow the established patterns for:
- Error handling
- Telemetry and tracing
- Request/response formatting
- Documentation
