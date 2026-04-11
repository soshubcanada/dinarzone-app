// Find which AWS region hosts the Supabase project by trying pooler connections in parallel
import pg from "pg";

const PROJECT_REF = "vdmfeqytgcmwqvzobcai";
const PASSWORD = process.env.DZ_DB_PASSWORD;
if (!PASSWORD) {
  console.error("Set DZ_DB_PASSWORD env var");
  process.exit(1);
}

const REGIONS = [
  "us-east-1", "us-east-2", "us-west-1", "us-west-2",
  "eu-west-1", "eu-west-2", "eu-west-3", "eu-central-1", "eu-central-2", "eu-north-1",
  "ap-southeast-1", "ap-southeast-2", "ap-south-1", "ap-northeast-1", "ap-northeast-2",
  "sa-east-1", "ca-central-1", "me-central-1", "me-south-1",
];

async function tryRegion(region) {
  const url = `postgresql://postgres.${PROJECT_REF}:${encodeURIComponent(PASSWORD)}@aws-0-${region}.pooler.supabase.com:6543/postgres`;
  const client = new pg.Client({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 4000,
    query_timeout: 4000,
  });
  try {
    await client.connect();
    const r = await client.query("SELECT current_database() as db, inet_server_addr() as addr");
    await client.end();
    return { region, ok: true, result: r.rows[0] };
  } catch (err) {
    try { await client.end(); } catch {}
    return { region, ok: false, err: err.message.slice(0, 120) };
  }
}

const results = await Promise.all(REGIONS.map(tryRegion));
const winner = results.find((r) => r.ok);
console.log(JSON.stringify({ winner, all: results.map((r) => ({ region: r.region, ok: r.ok, err: r.err })) }, null, 2));
