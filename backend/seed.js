const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Delete in order of foreign key dependencies
  await prisma.messageForwarding.deleteMany();
  await prisma.message.deleteMany();
  await prisma.scheduledMessage.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.twilioPhoneNumber.deleteMany();
  await prisma.user.deleteMany();
  console.log('All data wiped from the database.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 