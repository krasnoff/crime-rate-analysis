import { createMcpHandler } from "mcp-handler";
import { z } from "zod";
import { runGeneratedSQLQuery } from "@/app/actions";
import { systemPrompt } from "@/lib/system_prompt";

/**
 * MCP HTTP server for the crime-rate-analysis database.
 *
 * The server itself has no LLM: Claude Desktop's own model reads the schema
 * (exposed as the `schema://crime-db` resource) and writes the SQL, then calls
 * the `run_crime_sql` tool to execute it. Only read-only SELECT/WITH queries are
 * allowed — enforced by the reused `runGeneratedSQLQuery` guard.
 *
 * Served (stateless) at `/mcp` (Streamable HTTP) and `/sse` (legacy SSE).
 */
const handler = createMcpHandler(
  (server) => {
    // Schema resource — Claude reads this to author correct SQL.
    server.resource(
      "crime-db-schema",
      "schema://crime-db",
      {
        mimeType: "text/plain",
        description:
          "Full schema of the Israeli crime-statistics Postgres DB, plus the SQL " +
          "conventions and Hebrew term rules to follow when writing queries.",
      },
      async (uri) => ({
        contents: [
          { uri: uri.href, mimeType: "text/plain", text: systemPrompt },
        ],
      }),
    );

    // Execute tool — runs a read-only query and returns the rows as JSON.
    server.tool(
      "run_crime_sql",
      "Execute a read-only (SELECT/WITH) SQL query against the Israeli " +
        "crime-statistics Postgres DB and return the rows as JSON. Read the " +
        "schema://crime-db resource first to write a correct query. Only SELECT/WITH " +
        "statements are permitted.",
      { query: z.string().describe("A single SELECT or WITH SQL statement") },
      async ({ query }) => {
        try {
          const rows = await runGeneratedSQLQuery(query);
          const payload = {
            query,
            rowCount: rows.length,
            columns: rows.length ? Object.keys(rows[0]) : [],
            rows,
          };
          return {
            content: [
              { type: "text", text: JSON.stringify(payload, null, 2) },
            ],
            structuredContent: payload,
          };
        } catch (e) {
          return {
            isError: true,
            content: [
              {
                type: "text",
                text: `Query failed: ${e instanceof Error ? e.message : String(e)}`,
              },
            ],
          };
        }
      },
    );
  },
  {},
  { basePath: "/" },
);

export { handler as GET, handler as POST, handler as DELETE };
