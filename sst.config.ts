/// <reference path="./.sst/platform/config.d.ts" />

const PRODUCTION_DOMAIN = 'clarasdaydive.com';

export default $config({
  app(input) {
    return {
      name: 'claras-day-dive',
      removal: input?.stage === 'production' ? 'retain' : 'remove',
      home: 'aws',
      providers: {
        aws: {
          region: 'us-east-2',
        },
      },
    };
  },
  async run() {
    const isProduction = $app.stage === 'production';
    const productionOrigins = [
      `https://${PRODUCTION_DOMAIN}`,
      `https://www.${PRODUCTION_DOMAIN}`,
    ];

    const usage = new sst.aws.Dynamo('AskClaraUsage', {
      fields: { pk: 'string' },
      primaryIndex: { hashKey: 'pk' },
      ttl: 'expiresAt',
    });

    const askClara = new sst.aws.Function('AskClara', {
      handler: 'packages/ask-clara/handler.handler',
      runtime: 'nodejs24.x',
      link: [usage],
      environment: {
        ASK_CLARA_MONTHLY_BUDGET_USD: '5',
        BEDROCK_MODEL_ID: 'amazon.nova-lite-v1:0',
        ASK_CLARA_USAGE_TABLE: usage.name,
      },
      permissions: [
        { actions: ['bedrock:InvokeModel'], resources: ['*'] },
      ],
    });

    const api = new sst.aws.ApiGatewayV2('Api', {
      cors: {
        allowMethods: ['POST', 'OPTIONS'],
        allowHeaders: ['Content-Type'],
        allowOrigins: [...productionOrigins, 'http://localhost:5173', 'http://localhost:4173'],
      },
    });

    api.route('POST /api/ask', askClara.arn);

    const eventBooking = new sst.aws.Function('EventBooking', {
      handler: 'packages/event-booking/handler.handler',
      runtime: 'nodejs24.x',
      link: [usage],
      copyFiles: [
        {
          from: 'packages/event-booking/assets/wordmark-color.png',
          to: 'assets/wordmark-color.png',
        },
      ],
      environment: {
        EVENT_BOOKING_USAGE_TABLE: usage.name,
        TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY ?? '',
      },
      permissions: [
        { actions: ['ses:SendEmail', 'ses:SendRawEmail'], resources: ['*'] },
      ],
    });

    api.route('POST /api/event-inquiry', eventBooking.arn);

    const generalContact = new sst.aws.Function('GeneralContact', {
      handler: 'packages/general-contact/handler.handler',
      runtime: 'nodejs24.x',
      link: [usage],
      copyFiles: [
        {
          from: 'packages/event-booking/assets/wordmark-color.png',
          to: 'assets/wordmark-color.png',
        },
      ],
      environment: {
        GENERAL_CONTACT_USAGE_TABLE: usage.name,
        TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY ?? '',
      },
      permissions: [
        { actions: ['ses:SendEmail', 'ses:SendRawEmail'], resources: ['*'] },
      ],
    });

    api.route('POST /api/general-contact', generalContact.arn);

    const acmCertArn = process.env.ACM_CERT_ARN?.trim();

    const siteDomain =
      isProduction && acmCertArn
        ? {
            // GoDaddy DNS: CNAME www → CloudFront; forward @ → www in GoDaddy.
            // Do not redirect www → apex (that loops with GoDaddy forwarding).
            name: `www.${PRODUCTION_DOMAIN}`,
            dns: false,
            cert: acmCertArn,
          }
        : undefined;

    if (isProduction && !acmCertArn) {
      throw new Error(
        'ACM_CERT_ARN is required for production deploy (GoDaddy DNS / manual cert). ' +
          'See docs/godaddy-domain-setup.md',
      );
    }

    const site = new sst.aws.StaticSite('Site', {
      build: {
        command: 'npm run build',
        output: 'dist',
      },
      environment: {
        VITE_ASK_CLARA_API_URL: api.url,
        VITE_EVENT_BOOKING_API_URL: api.url,
        VITE_GENERAL_CONTACT_API_URL: api.url,
        VITE_TURNSTILE_SITE_KEY: process.env.VITE_TURNSTILE_SITE_KEY ?? '',
      },
      error: 'index.html',
      domain: siteDomain,
    });

    return {
      url: site.url,
      api: api.url,
      domain: siteDomain ? PRODUCTION_DOMAIN : undefined,
    };
  },
});
