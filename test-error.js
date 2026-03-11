const prisma = require('./src/lib/db').default;

async function testCreate() {
  try {
    const data = {
      userId: 'test-user-id',
      name: 'Test Business',
      type: 'GUIDE',
      accountType: 'PERSON',
      taxId: '12345678',
      description: 'Test Description',
      contactEmail: 'test@example.com',
      contactPhone: '999999999',
      website: '',
      logoUrl: '',
      bannerUrl: '',
      verificationDocUrl: ''
    };
    
    console.log('Attempting to create business profile...');
    const profile = await prisma.businessProfile.create({
      data: data
    });
    console.log('Success:', profile.id);
  } catch (error) {
    console.error('FULL PRISMA ERROR:');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

testCreate();
