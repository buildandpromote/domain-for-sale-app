import { headers } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

export const revalidate = 0;

export default async function RenderDomainPage() {
  const headersList = await headers();
  const host = headersList.get('host')!;
  
  // Strip "www." from the domain name if it exists
  const domainName = host.startsWith('www.') ? host.substring(4) : host;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from('domains')
    .select('price, contact_email')
    .eq('domain_name', domainName)
    .single();

  if (error || !data) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-12 font-mono">
        <div className="w-full max-w-2xl rounded bg-red-100 p-6 text-red-900">
          <h1 className="text-xl font-bold">Error: Domain Not Configured</h1>
          <p className="mt-4">The application tried to look up the following domain:</p>
          <pre className="mt-2 rounded bg-red-200 p-2"><code>{domainName} (from host: {host})</code></pre>
          <p className="mt-4">It failed with the following error from the database:</p>
          <pre className="mt-2 rounded bg-red-200 p-2"><code>{JSON.stringify(error, null, 2) || "No specific error message."}</code></pre>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-12 bg-gray-50 text-center">
      <div className="w-full max-w-2xl">
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-gray-900">
          {host}
        </h1>
        <p className="mt-6 text-lg leading-8 text-gray-600">
          This domain is for sale.
        </p>
        <div className="mt-10">
          <div className="text-4xl font-bold text-indigo-600">{data.price}</div>
          <p className="mt-4 text-base font-medium text-gray-500">
            For inquiries, please contact:
          </p>
          <a
            href={`mailto:${data.contact_email}`}
            className="text-lg font-semibold text-indigo-600 hover:text-indigo-500"
          >
            {data.contact_email}
          </a>
        </div>
      </div>
    </main>
  );
}