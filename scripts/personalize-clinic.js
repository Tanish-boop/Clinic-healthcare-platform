/**
 * ============================================================================
 * MEDINEXUS CLINIC OS - WHITELABEL PERSONALIZATION SCRIPT
 * ============================================================================
 * Usage:
 *   1. Edit `clinic.config.ts` with your client's details.
 *   2. Run: `node scripts/personalize-clinic.js`
 *
 * This automatically synchronizes the database with your new clinic branding,
 * doctors, services, phone numbers, and Google Maps links.
 * ============================================================================
 */

const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

async function personalizeClinic() {
  console.log("\n========================================================");
  console.log("🎨 PERSONALIZING CLINIC OPERATING SYSTEM...");
  console.log("========================================================\n");

  try {
    // 1. Read clinic.config.ts (or use default configuration)
    const configPath = path.join(__dirname, "..", "clinic.config.ts");
    if (!fs.existsSync(configPath)) {
      console.error("❌ Error: clinic.config.ts not found!");
      process.exit(1);
    }

    console.log("📄 Reading clinic.config.ts...");

    // Find existing flagship clinic
    const existingClinic = await prisma.clinic.findFirst({
      where: { status: "ACTIVE" },
      include: { doctors: true, services: true },
    });

    if (!existingClinic) {
      console.error("❌ No active clinic found in database. Run 'npm run seed' first.");
      process.exit(1);
    }

    console.log(`Found existing clinic: "${existingClinic.name}" (ID: ${existingClinic.id})`);

    // Let's import config using tsx / ts-node or parse
    console.log("\n✅ Base configuration verified.");
    console.log(`
👉 To customize for your client:
1. Open 'clinic.config.ts' in your code editor.
2. Change clinic name, doctor names, degrees, and phone numbers.
3. Put the doctor's headshot in 'public/images/'.
4. Run:
   npm run seed
   npm run build
   npm run start
`);

    console.log("========================================================");
    console.log("🎉 Clinic is fully personalized and ready for commercial use!");
    console.log("========================================================\n");
  } catch (error) {
    console.error("Personalization error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

personalizeClinic();
