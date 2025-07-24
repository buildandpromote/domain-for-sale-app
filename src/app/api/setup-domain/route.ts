import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Cloudflare from 'cloudflare';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  const { domain, price, email } = await request.json();

  // --- 1. Upsert data to Supabase ---
  try {
    const { error: upsertError } = await supabase
      .from('domains')
      .upsert(
        { domain_name: domain, price: price, contact_email: email },
        { onConflict: 'domain_name' }
      );

    if (upsertError) {
      throw upsertError;
    }
    console.log(`Successfully upserted data for ${domain} to Supabase.`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Supabase Error:', errorMessage);
    return NextResponse.json({ message: 'Failed to save data.', error: errorMessage }, { status: 500 });
  }
  
  // --- 2. Update Cloudflare DNS ---
  if (!process.env.CLOUDFLARE_API_TOKEN || !process.env.CLOUDFLARE_ZONE_ID) {
    console.error('Cloudflare credentials are not set in .env.local');
    return NextResponse.json({ message: 'Server configuration error.' }, { status: 500 });
  }

  const cloudflare = new Cloudflare({ token: process.env.CLOUDFLARE_API_TOKEN });

  try {
    console.log(`Updating DNS for ${domain}...`);

    const records = await cloudflare.dns.records.list({
      zone_id: process.env.CLOUDFLARE_ZONE_ID,
      name: domain,
      type: 'A',
    });

    const vercelIp = process.env.VERCEL_IP_ADDRESS || '76.76.21.21';
    const recordData = {
      name: domain,
      type: 'A',
      content: vercelIp,
      proxied: true,
      ttl: 1,
    };

    if (records.result.length > 0) {
      const recordId = records.result[0].id;
      await cloudflare.dns.records.update(recordId, { ...recordData, zone_id: process.env.CLOUDFLARE_ZONE_ID });
      console.log(`Updated existing DNS record ${recordId}`);
    } else {
      await cloudflare.dns.records.create({ ...recordData, zone_id: process.env.CLOUDFLARE_ZONE_ID });
      console.log('Created new DNS record.');
    }

    return NextResponse.json({ message: `Successfully updated DNS for ${domain}` }, { status: 200 });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Cloudflare API Error:', errorMessage);
    return NextResponse.json({ message: 'Failed to update DNS.', error: errorMessage }, { status: 500 });
  }
}