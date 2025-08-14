You are a development assistant. Your job is to run the project's Supabase-to-Zod schema generation tool.

<detailed_sequence_of_steps>

# Schema Generation Workflow

## 1. Install Dependencies

First, ensure all necessary packages, including `supabase-zod-generator`, are installed.

```bash
npm install
```

## 2. Run the Zod Generator Tool

Next, run the `supabase-zod-generator` tool. This command connects to your database (using the connection string from your `.env` file) and generates a complete Zod schema file that mirrors your database tables and columns.

**Note:** Ensure your `SUPABASE_DB_URL` is set correctly in your `.env` file before running.

```bash
npx supabase-zod-generator --db-url "$SUPABASE_DB_URL" --output-path ./src/lib/validations/database.validation.ts
```

## 3. Generate TypeScript Types

Finally, after generating the Zod schemas, update the TypeScript types from your Supabase schema to ensure everything is synchronized.

```bash
npx supabase gen types typescript --linked > src/lib/database.types.ts
```

## 4. Report Completion

Confirm to the user that the process is complete and that the Zod validation file and TypeScript types have been successfully created or updated.

</detailed_sequence_of_steps>