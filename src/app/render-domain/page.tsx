import { headers } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { Metadata } from 'next';

// This function sets the page title dynamically
export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const host = headersList.get('host')!;
  const domainName = host.startsWith('www.') ? host.substring(4) : host;
  return {
    title: `${domainName} - For Sale`,
  };
}

// This page will not be cached
export const revalidate = 0;

export default async function RenderDomainPage() {
  const headersList = await headers();
  const host = headersList.get('host')!;
  
  // Strip "www." from the domain name if it exists for the database lookup
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
    // Updated error page styling to match the dark theme
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-slate-900 p-8 font-mono text-white">
        <div className="w-full max-w-2xl rounded-lg bg-red-900/20 p-6 text-center text-red-300 ring-1 ring-red-500/50">
          <h1 className="text-xl font-bold">Error: Domain Not Configured</h1>
          <p className="mt-4">The application tried to look up the following domain:</p>
          <pre className="mt-2 rounded bg-slate-800 p-2 text-white"><code>{domainName} (from host: {host})</code></pre>
        </div>
      </main>
    );
  }

  // New design for the "For Sale" page
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-900 p-8 text-white">
      <div className="w-full max-w-3xl text-center">
        <p className="text-lg font-semibold text-blue-400">This Domain is For Sale</p>
        <h1 className="mt-4 text-5xl font-bold tracking-tight text-white sm:text-7xl">
          {host}
        </h1>
        <div className="mt-12">
          <p className="text-xl text-slate-300">Asking Price</p>
          <p className="mt-2 text-6xl font-extrabold text-blue-400 sm:text-8xl">{data.price}</p>
        </div>
        <div className="mt-12">
          <p className="text-lg text-slate-300">For inquiries, please contact:</p>
          <a
            href={`mailto:${data.contact_email}`}
            className="mt-2 inline-block text-xl font-semibold text-blue-400 transition hover:text-blue-300"
          >
            {data.contact_email}
          </a>
        </div>
      </div>
    </main>
  );
}