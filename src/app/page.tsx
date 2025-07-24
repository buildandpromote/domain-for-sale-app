import { headers } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

// This page will not be cached
export const revalidate = 0;

export default async function RenderDomainPage() {
  const headersList = headers();
  const domainName = headersList.get('host');

  // Initialize Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Fetch data for the current domain
  const { data, error } = await supabase
    .from('domains')
    .select('price, contact_email')
    .eq('domain_name', domainName)
    .single();

  if (error || !data) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <h1 className="text-4xl font-bold">Error</h1>
        <p className="mt-4">This domain is not configured correctly.</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-12 bg-gray-50 text-center">
      <div className="w-full max-w-2xl">
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-gray-900">
          {domainName}
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