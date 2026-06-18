export function Preview({ content }: { content: string }) {
  return (
    <div className="bg-white border rounded-lg p-6 prose max-w-none">
      <pre className="whitespace-pre-wrap font-serif text-base leading-relaxed">
        {content}
      </pre>
    </div>
  );
}
