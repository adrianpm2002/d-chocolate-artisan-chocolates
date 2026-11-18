<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Project rules

- Catalog products, categories, filtering and sorting live in `src/lib/catalog.ts` as static sample data; swap that module's data source when a backend is added so pages keep the same API.
- Catalog filters (search, category, sort) are URL search params on `/` so filtered views are shareable.
- Brand logo, wordmark and mascot are asset pointers in `src/assets`; render the header logo through `BrandLogo` so brand changes stay in one place.
- Pack slot operations and preview geometry live in `src/lib/packs.ts`; the pack builder's state (container, slots, ribbon, topper, extras, message) and its total live in `src/lib/builder.ts` as a pure reducer, so prices are testable and the same rules apply on every page.
- Pieces, boxes, ribbons and toppers are drawn as SVG in `src/components/packs` from catalog data (piece shape + filling look), so any new filling or container shows up in the live preview without new photos.
