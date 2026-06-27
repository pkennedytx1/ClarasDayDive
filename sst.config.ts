/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: 'claras-day-dive',
      removal: input?.stage === 'production' ? 'retain' : 'remove',
      home: 'aws',
    };
  },
  async run() {
    const usage = new sst.aws.Dynamo('AskClaraUsage', {
      fields: { pk: 'string' },
      primaryIndex: { hashKey: 'pk' },
    });

    const askClara = new sst.aws.Function('AskClara', {
      handler: 'packages/ask-clara/handler.handler',
      runtime: 'nodejs20.x',
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
        allowOrigins: [
          'https://clarasdaydive.com',
          'http://localhost:5173',
          'http://localhost:4173',
        ],
      },
    });

    api.route('POST /api/ask', askClara.arn);

    const site = new sst.aws.StaticSite('Site', {
      build: {
        command: 'npm run build',
        output: 'dist',
      },
      environment: {
        VITE_ASK_CLARA_API_URL: api.url,
      },
      error: 'index.html',
    });

    return {
      url: site.url,
      api: api.url,
    };
  },
});
