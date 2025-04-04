// src/plugins/validate/db/validation-run.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
// Assuming you renamed the files and updated imports:
import { ValidationError } from './validation-error.entity.js';

@Entity({
    schema: 'data_quality',
    // Explicit snake_case name (workaround for generate issue)
    name: 'validation_run',
    comment: 'Represents a single execution instance of a data quality validation run, including metadata and links to errors found.'
})
export class ValidationRun {
    @PrimaryGeneratedColumn({
        name: 'validation_run_id', // Naming strategy likely handles this, but explicit name is fine too
        comment: 'Unique identifier for the validation run.'
    })
    validation_run_id!: number;

    @CreateDateColumn({
        name: 'run_timestamp',
        type: 'timestamp with time zone',
        comment: 'Timestamp indicating when the validation run was executed or recorded.'
    })
    run_timestamp!: Date;

    @Column({
        type: 'varchar',
        name: 'source_identifier', // Naming strategy handles column name if omitted
        length: 255,
        nullable: true,
        comment: 'Optional identifier for the source system, file, or event that triggered this validation run.'
    })
    source_identifier!: string | null;

    @Column({
        type: 'varchar',
        name: 'run_user',
        length: 100,
        nullable: true,
        comment: 'Identifier of the user who initiated or is associated with this validation run.'
    })
    run_user!: string | null;

    @Column({
        type: 'varchar',
        name: 'run_role',
        length: 100,
        nullable: true,
        comment: 'Role associated with the user who initiated this validation run.'
    })
    run_role!: string | null;

    @Column({
        type: 'varchar', // Or 'text' if it could be very long
        name: 'operation_name',
        length: 255,
        nullable: true,
        comment: 'Name of the specific operation being validated, if applicable.'
    })
    graphql_operation_name!: string | null;

    @Column({
        type: 'text',
        name: 'variables',
        nullable: true,
        comment: 'Variables passed to the query, stored as a JSON string.'
    })
    graphql_variables!: string | null; // Stored as JSON string

    @Column({
        type: 'boolean',
        name: 'validation_config_data',
        nullable: true,
        comment: 'Validation configuration flag: Indicates if the \'$data\' option (ajv) was enabled.'
    })
    validation_config_data!: boolean | null;

    @Column({
        type: 'boolean',
        name: 'validation_config_verbose',
        nullable: true,
        comment: 'Validation configuration flag: Indicates if the \'verbose\' option (ajv) was enabled.'
    })
    validation_config_verbose!: boolean | null;

    @Column({
        type: 'boolean',
        name: 'validation_config_all_errors',
        nullable: true,
        comment: 'Validation configuration flag: Indicates if the \'allErrors\' option (ajv) was enabled.'
    })
    validation_config_all_errors!: boolean | null;

    @Column({
        type: 'boolean',
        name: 'validation_config_strict',
        nullable: true,
        comment: 'Validation configuration flag: Indicates if the \'strict\' option (ajv) was enabled.'
    })
    validation_config_strict!: boolean | null;

    @Column({
        type: 'text',
        name: 'query',
        comment: 'The query string that was executed and validated.'
    })
    graphql_query!: string;

    @Column({
        type: 'text',
        name: 'validation_schema',
        comment: 'The JSON schema used to validate the query results, stored as a JSON string.'
    })
    validation_schema!: string; // Stored as JSON string

    @Column({
        type: 'integer',
        name: 'total_errors',
        nullable: true,
        comment: 'A summary count of the total number of validation errors found during this run.'
    })
    total_errors!: number | null;

    // Relation properties (@OneToMany, @ManyToOne, @ManyToMany, @OneToOne)
    // do not directly map to a single column, so the 'comment' property in
    // their decorator doesn't translate to a database column comment.
    // A standard TS comment is still useful for code readers.
    /**
     * Relation to the specific validation errors found during this run.
     */
    @OneToMany('validation_error', (error: ValidationError) => error.run, {
        cascade: true,
        eager: false
    })
    errors!: ValidationError[];
}