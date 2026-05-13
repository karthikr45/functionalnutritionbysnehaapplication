// Server component — renders a JSON-LD structured-data <script> tag.
// Used by pages to inject Schema.org markup for Google rich snippets.

export default function JsonLd({ data }: { data: Record<string, any> | Record<string, any>[] }) {
  return (
    <script
      type="application/ld+json"
      // dangerouslySetInnerHTML is the standard pattern for JSON-LD —
      // the payload is server-generated, not user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
