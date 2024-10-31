export interface GraphQLRequest {
    query: string;
    operationName?: string | null;
    variables?: Record<string, any> | null;
}