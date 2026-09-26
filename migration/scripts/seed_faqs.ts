import "dotenv/config";
import { Client } from "pg";

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();

  const insertSql = `
    INSERT INTO faqs (question, answer, category, display_order, status)
    VALUES
    ('What is the difference between modular homes and traditional stick-built construction?', 'Modular homes are built in state-of-the-art climate-controlled factories using precision light-gauge steel frames. They meet or exceed all local IRC building codes, offer tighter structural tolerances, and eliminate weather delays during framing.', 'Construction', 1, 'PUBLISHED'),
    ('How long does delivery and on-site assembly take?', 'Factory fabrication typically takes 4 to 8 weeks depending on model customization. Once delivered to your foundation slab, structural framing assembly and weather dry-in are completed in just 3 to 7 days.', 'Delivery & Timeline', 2, 'PUBLISHED'),
    ('Are modular homes hurricane and seismic rated?', 'Yes. Our galvanized structural steel framing is engineered to withstand wind loads up to 150+ MPH and high seismic ground accelerations, exceeding standard wood-framed specifications.', 'Engineering', 3, 'PUBLISHED'),
    ('Can I customize the floor plan and interior finishes?', 'Absolutely. Every plan can be customized for dimensions, partition walls, window placements, electrical drops, bathroom configurations, and exterior siding packages.', 'Customization', 4, 'PUBLISHED'),
    ('Do you provide wet-stamped engineering blueprints for local permits?', 'Yes. Every complete plan purchase or modular home package includes state-specific engineered wet-stamped architectural and structural blueprint sets ready for municipal permit submittals.', 'Permits & Plans', 5, 'PUBLISHED')
    ON CONFLICT DO NOTHING;
  `;

  await client.query(insertSql);
  const { rows } = await client.query("SELECT count(*) FROM faqs;");
  console.log("✓ FAQs count now in database:", rows[0].count);

  await client.end();
}

main().catch(console.error);
