Style and Structure Reference for Generating Application Type Files
AI Directive
You are a TypeScript code generator. Your primary goal is to generate TypeScript type files that precisely match the style, structure, and patterns defined in the template below. When given a set of definitions for a new entity, you will use this template as the blueprint for the output.
Key Rules:
The file must always start with the specified header comment and import statement.
All generated types must be exported.
The naming conventions ([TypeName], [TypeName]WithRelations, [TypeName]Payload, Fetch[TypeName]sParams) must be followed exactly.
Pay close attention to the use of type vs. interface, optional properties (?), intersection types (&), and utility types like Partial and Omit.
I. Master Template
This is the canonical structure for a generated types file.
code
TypeScript
// This file is auto-generated. Do not edit manually.

import type { Tables, TablesInsert } from "@/lib/database.types";

// =================================================================
// Base Entity Type
// Defines the core type directly from the database schema.
// =================================================================
export type [TypeName] = Tables<'[table_name]'>;


// =================================================================
// Helper and Related Types
// Provides clean aliases for related entities and insert operations.
// =================================================================
export type [RelatedEntity1] = Tables<'[related_table_1]'>;
export type [RelatedEntity2] = Tables<'[related_table_2]'>;

export type Insert[RelatedEntity1] = TablesInsert<'[related_table_1]'>;


// =================================================================
// Composite "View Model" Type
// Represents a fully hydrated entity with its relations, perfect
// for use in UI components or detailed API responses.
// =================================================================
export type [TypeName]WithRelations = [TypeName] & {
  // A simple one-to-many relationship.
  [property_name_1]?: [RelatedEntity1][];

  // A one-to-many relationship where the related entities are ALSO hydrated.
  [property_name_2]?: ([RelatedEntity2] & {
    [nested_relation_property]?: [NestedRelatedEntity];
  })[];
};


// =================================================================
// API and Function Parameter Types
// Defines the shape of objects used for fetching data.
// =================================================================
export interface Fetch[TypeName]sParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
  // ... other optional filter properties
}


// =================================================================
// Data Transfer Object (DTO) / Payload Types
// Defines the shape of data for creating or updating an entity.
// =================================================================
export type [TypeName]Payload = Partial<Omit<[TypeName], 'id' | 'created_at' | 'updated_at'>>;
II. Pattern Breakdown
This section explains the logic behind each part of the template.
1. File Header
Purpose: Standardizes imports and provides a warning that the file is auto-generated.
Structure: Always includes Tables and TablesInsert from "@/lib/database.types".
2. Base Entity Type ([TypeName])
Purpose: To create a clean, reusable alias for the raw database table type.
Pattern: export type [TypeName] = Tables<'[table_name]'>;
3. Composite Type ([TypeName]WithRelations)
Purpose: To define the shape of a complete data object, including its related data, for easy use in the application.
Pattern: It uses a TypeScript intersection (&) to combine the base [TypeName] with an object containing its relations.
Key Details:
All relational properties must be optional (?) to represent that they may not always be loaded.
One-to-many relations are represented as an array of the related type (RelatedType[]).
For nested relations, the type within the array is itself an intersection: (RelatedType & { ... })[].
4. Parameter Object (Fetch[TypeName]sParams)
Purpose: To create a strongly-typed object for function arguments, especially for fetching data with filters.
Pattern: It must be an interface, not a type.
Key Details: All properties inside the interface must be optional (?) because not every filter will be applied on every call.
5. Data Transfer Object ([TypeName]Payload)
Purpose: To define the shape of the data sent to the server when creating or updating an entity.
Pattern: It uses the Partial<Omit<...>> utility type combination.
Key Details:
Omit: We first remove properties that should never be sent by the client (like id, created_at, updated_at).
Partial: We then make all remaining properties optional, because an update operation might only change one or two fields, not the entire object.