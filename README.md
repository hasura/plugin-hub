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
