import { supabase } from "@/lib/supabase";

export default async function Home() {
  const { data, error } = await supabase
    .from("documentation")
    .select("*");

  return (
    <main className="p-10">
      <h1 className="text-3xl font-bold">Process Documentation</h1>

      <pre className="mt-6">
        {JSON.stringify(data, null, 2)}
      </pre>

      {error && (
        <p className="text-red-500">
          {error.message}
        </p>
      )}
    </main>
  );
}