import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({ take: 6 });
  const now = new Date();

  console.log(`Found ${users.length} users in DB.`);

  const profiles = [
    {
      browserName: 'Chrome',
      browserVersion: '122.0',
      browserEngine: 'Blink',
      operatingSystem: 'Windows',
      osVersion: '11',
      deviceType: 'Desktop',
      platform: 'Win32',
      screenWidth: 1920,
      screenHeight: 1080,
      viewportWidth: 1536,
      viewportHeight: 730,
      devicePixelRatio: 1.25,
      touchSupport: false,
      ipAddress: '103.21.244.18',
      ipVersion: 'IPv4',
      locationApprox: 'Bangalore, India',
      isp: 'Airtel Broadband',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    },
    {
      browserName: 'Safari',
      browserVersion: '17.3',
      browserEngine: 'WebKit',
      operatingSystem: 'iOS',
      osVersion: '17.3.1',
      deviceType: 'Mobile',
      platform: 'iPhone',
      screenWidth: 393,
      screenHeight: 852,
      viewportWidth: 393,
      viewportHeight: 702,
      devicePixelRatio: 3.0,
      touchSupport: true,
      ipAddress: '157.49.12.94',
      ipVersion: 'IPv4',
      locationApprox: 'Mumbai, India',
      isp: 'Reliance Jio Infocomm',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3.1 Mobile/15E148 Safari/604.1'
    },
    {
      browserName: 'Edge',
      browserVersion: '122.0',
      browserEngine: 'Blink',
      operatingSystem: 'Windows',
      osVersion: '11',
      deviceType: 'Laptop',
      platform: 'Win32',
      screenWidth: 1440,
      screenHeight: 900,
      viewportWidth: 1440,
      viewportHeight: 780,
      devicePixelRatio: 1.0,
      touchSupport: false,
      ipAddress: '49.37.112.55',
      ipVersion: 'IPv4',
      locationApprox: 'Delhi, India',
      isp: 'Tata Play Fiber',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 Edg/122.0.2365.92'
    },
    {
      browserName: 'Chrome',
      browserVersion: '122.0',
      browserEngine: 'Blink',
      operatingSystem: 'macOS',
      osVersion: '14.3.1',
      deviceType: 'Desktop',
      platform: 'MacIntel',
      screenWidth: 2560,
      screenHeight: 1440,
      viewportWidth: 1728,
      viewportHeight: 950,
      devicePixelRatio: 2.0,
      touchSupport: false,
      ipAddress: '122.164.88.201',
      ipVersion: 'IPv4',
      locationApprox: 'Chennai, India',
      isp: 'ACT Fibernet',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    },
    {
      browserName: 'Firefox',
      browserVersion: '123.0',
      browserEngine: 'Gecko',
      operatingSystem: 'Linux',
      osVersion: 'Ubuntu 22.04',
      deviceType: 'Desktop',
      platform: 'Linux x86_64',
      screenWidth: 1920,
      screenHeight: 1080,
      viewportWidth: 1920,
      viewportHeight: 920,
      devicePixelRatio: 1.0,
      touchSupport: false,
      ipAddress: '117.200.45.19',
      ipVersion: 'IPv4',
      locationApprox: 'Hyderabad, India',
      isp: 'BSNL Broadband',
      userAgent: 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:123.0) Gecko/20100101 Firefox/123.0'
    },
    {
      browserName: 'Safari',
      browserVersion: '17.2',
      browserEngine: 'WebKit',
      operatingSystem: 'iPadOS',
      osVersion: '17.2',
      deviceType: 'Tablet',
      platform: 'iPad',
      screenWidth: 834,
      screenHeight: 1194,
      viewportWidth: 834,
      viewportHeight: 1114,
      devicePixelRatio: 2.0,
      touchSupport: true,
      ipAddress: '106.51.72.33',
      ipVersion: 'IPv4',
      locationApprox: 'Pune, India',
      isp: 'Airtel Broadband',
      userAgent: 'Mozilla/5.0 (iPad; CPU OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1'
    }
  ];

  for (let i = 0; i < users.length; i++) {
    const u = users[i];
    const dev1 = profiles[i % profiles.length];
    const dev2 = profiles[(i + 2) % profiles.length];

    // Today success
    await prisma.loginActivity.create({
      data: {
        userId: u.id,
        email: u.email,
        userName: u.name,
        role: u.role,
        phone: u.phone,
        eventType: 'LOGIN',
        status: 'SUCCESS',
        ipAddress: dev1.ipAddress,
        ipVersion: dev1.ipVersion,
        locationApprox: dev1.locationApprox,
        isp: dev1.isp,
        userAgent: dev1.userAgent,
        browserName: dev1.browserName,
        browserVersion: dev1.browserVersion,
        browserEngine: dev1.browserEngine,
        operatingSystem: dev1.operatingSystem,
        osVersion: dev1.osVersion,
        deviceType: dev1.deviceType,
        platform: dev1.platform,
        screenWidth: dev1.screenWidth,
        screenHeight: dev1.screenHeight,
        viewportWidth: dev1.viewportWidth,
        viewportHeight: dev1.viewportHeight,
        devicePixelRatio: dev1.devicePixelRatio,
        touchSupport: dev1.touchSupport,
        sessionId: `sess_${crypto.randomBytes(8).toString('hex')}`,
        deviceSessionId: `dev_${crypto.randomBytes(8).toString('hex')}`,
        authMethod: 'password',
        createdAt: new Date(now.getTime() - (i * 35 + 10) * 60 * 1000)
      }
    });

    // Yesterday success
    await prisma.loginActivity.create({
      data: {
        userId: u.id,
        email: u.email,
        userName: u.name,
        role: u.role,
        phone: u.phone,
        eventType: 'LOGIN',
        status: 'SUCCESS',
        ipAddress: dev2.ipAddress,
        ipVersion: dev2.ipVersion,
        locationApprox: dev2.locationApprox,
        isp: dev2.isp,
        userAgent: dev2.userAgent,
        browserName: dev2.browserName,
        browserVersion: dev2.browserVersion,
        browserEngine: dev2.browserEngine,
        operatingSystem: dev2.operatingSystem,
        osVersion: dev2.osVersion,
        deviceType: dev2.deviceType,
        platform: dev2.platform,
        screenWidth: dev2.screenWidth,
        screenHeight: dev2.screenHeight,
        viewportWidth: dev2.viewportWidth,
        viewportHeight: dev2.viewportHeight,
        devicePixelRatio: dev2.devicePixelRatio,
        touchSupport: dev2.touchSupport,
        sessionId: `sess_${crypto.randomBytes(8).toString('hex')}`,
        deviceSessionId: `dev_${crypto.randomBytes(8).toString('hex')}`,
        authMethod: 'password',
        createdAt: new Date(now.getTime() - (24 + i * 4) * 60 * 60 * 1000)
      }
    });

    if (i % 2 === 0) {
      // Failed attempt
      await prisma.loginActivity.create({
        data: {
          userId: u.id,
          email: u.email,
          userName: u.name,
          role: u.role,
          phone: u.phone,
          eventType: 'LOGIN',
          status: 'FAILED',
          failureReason: 'Invalid credentials provided',
          ipAddress: '185.220.101.5',
          ipVersion: 'IPv4',
          locationApprox: 'Frankfurt, Germany',
          isp: 'DataCenter ASN',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
          browserName: 'Chrome',
          browserVersion: '121.0',
          browserEngine: 'Blink',
          operatingSystem: 'Windows',
          osVersion: '10',
          deviceType: 'Desktop',
          platform: 'Win32',
          authMethod: 'password',
          createdAt: new Date(now.getTime() - (i * 15 + 8) * 60 * 1000)
        }
      });
    }
  }

  const total = await prisma.loginActivity.count();
  console.log(`Successfully seeded! Total LoginActivity records in DB: ${total}`);
  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  prisma.$disconnect();
});
