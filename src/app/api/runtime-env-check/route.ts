import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.FROM_EMAIL;

  const envKeys = Object.keys(process.env);
  const smtpKeys = envKeys.filter(k => k.toLowerCase().includes('smtp') || k.toLowerCase().includes('email'));

  return NextResponse.json({
    smtpHostExists: host !== undefined,
    smtpPortExists: port !== undefined,
    smtpUserExists: user !== undefined,
    smtpPassExists: pass !== undefined,
    fromEmailExists: from !== undefined,
    vercelProject: process.env.VERCEL_PROJECT_ID || 'prj_x16sX9FY4aZzzWsJjWFffM8KL3Ws',
    deploymentUrl: process.env.VERCEL_URL || 'ran-fitness.vercel.app',
    deploymentId: process.env.VERCEL_DEPLOYMENT_ID || 'unknown',
    smtpKeysFound: smtpKeys,
    smtpHostVal: host || 'not set',
    smtpPortVal: port || 'not set',
    smtpUserVal: user || 'not set',
    fromEmailVal: from || 'not set',
    allEnvKeysLength: envKeys.length
  });
}
