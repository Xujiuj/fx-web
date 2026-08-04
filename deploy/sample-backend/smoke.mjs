import { createCipheriv, createPublicKey, publicEncrypt, constants, randomBytes } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';

const required = (name) => {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing ${name}`);
  return value;
};

const baseUrl = required('SAMPLE_SMOKE_BASE_URL').replace(/\/$/, '');
const clientId = process.env.SAMPLE_CLIENT_ID || 'e5cd7e4891bf95d1d19206ce24a7b32e';
const adminPassword = required('SAMPLE_ADMIN_PASSWORD');
const requestPublicKey = required('SAMPLE_API_REQUEST_PUBLIC_KEY');
const expectedInstallId = required('ENTERPRISE_INSTALL_ID');
const licensePath = required('SAMPLE_LICENSE_PATH');
const composeFile = required('SAMPLE_COMPOSE_FILE');
const composeDirectory = required('SAMPLE_COMPOSE_PROJECT_DIRECTORY');
const composeProject = process.env.COMPOSE_PROJECT_NAME || 'fx-sample-backend';

const requestJson = async (path, options = {}) => {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    signal: AbortSignal.timeout(20_000),
    headers: {
      accept: 'application/json',
      clientid: clientId,
      ...(options.headers || {})
    }
  });
  const text = await response.text();
  let payload;
  try {
    payload = JSON.parse(text);
  } catch {
    throw new Error(`${path} returned non-JSON HTTP ${response.status}`);
  }
  if (!response.ok) throw new Error(`${path} returned HTTP ${response.status}: ${payload.msg || 'unknown error'}`);
  if (Number(payload.code) !== 200) throw new Error(`${path} returned application code ${payload.code}: ${payload.msg || 'unknown error'}`);
  return payload;
};

const redisCaptcha = (uuid) => {
  const result = spawnSync(
    'docker',
    [
      'compose',
      '--project-name', composeProject,
      '--project-directory', composeDirectory,
      '-f', composeFile,
      'exec', '-T',
      'redis',
      'sh', '-ec',
      'exec redis-cli --raw --no-auth-warning -a "$SAMPLE_REDIS_PASSWORD" GET "$1"',
      'sh', `global:captcha_codes:${uuid}`
    ],
    { encoding: 'utf8', env: process.env }
  );
  if (result.status !== 0) throw new Error(`Unable to read captcha from isolated Redis: ${result.stderr.trim()}`);
  const code = result.stdout.trim();
  if (!code) throw new Error('Captcha was not present in isolated Redis');
  return code;
};

const encryptedLogin = async (body) => {
  const aesPassword = randomBytes(16).toString('hex');
  const cipher = createCipheriv('aes-256-ecb', Buffer.from(aesPassword, 'utf8'), null);
  cipher.setAutoPadding(true);
  const encryptedBody = Buffer.concat([cipher.update(JSON.stringify(body), 'utf8'), cipher.final()]).toString('base64');
  const publicKey = createPublicKey({ key: Buffer.from(requestPublicKey, 'base64'), format: 'der', type: 'spki' });
  const encryptedKey = publicEncrypt(
    { key: publicKey, padding: constants.RSA_PKCS1_PADDING },
    Buffer.from(Buffer.from(aesPassword, 'utf8').toString('base64'), 'utf8')
  ).toString('base64');
  return requestJson('/auth/login', {
    method: 'POST',
    headers: { 'content-type': 'text/plain;charset=UTF-8', 'encrypt-key': encryptedKey },
    body: encryptedBody
  });
};

const bearerHeaders = (token) => ({ authorization: `Bearer ${token}` });

try {
  const captcha = await requestJson('/auth/code');
  const uuid = captcha.data?.uuid;
  if (!uuid) throw new Error('/auth/code did not return a captcha UUID');
  const code = redisCaptcha(uuid);
  process.stdout.write('sample_smoke_captcha_ok\n');

  const login = await encryptedLogin({
    tenantId: '000000',
    username: 'admin',
    password: adminPassword,
    code,
    uuid,
    clientId,
    grantType: 'password'
  });
  const token = login.data?.access_token;
  if (!token) throw new Error('/auth/login did not return an access token');
  process.stdout.write('sample_smoke_encrypted_login_ok\n');

  const userInfo = await requestJson('/system/user/getInfo', { headers: bearerHeaders(token) });
  if (!userInfo.data?.user) throw new Error('/system/user/getInfo did not return the authenticated user');
  process.stdout.write('sample_smoke_user_info_ok\n');

  const installId = await requestJson('/enterprise/license-import/install-id', { headers: bearerHeaders(token) });
  if (installId.data?.expectedInstallId !== expectedInstallId) {
    throw new Error(`Backend install ID does not match the configured stable ID`);
  }

  const licenseContent = (await readFile(licensePath, 'utf8')).trim();
  if (!licenseContent) throw new Error('Signed license file is empty');
  const imported = await requestJson('/enterprise/license-import/import', {
    method: 'POST',
    headers: { ...bearerHeaders(token), 'content-type': 'application/json' },
    body: JSON.stringify({ licenseContent, expectedInstallId })
  });
  if (imported.data?.valid !== true || imported.data?.status !== 'VALID') {
    throw new Error(`Signed license import was rejected with status ${imported.data?.status || 'unknown'}`);
  }
  process.stdout.write('sample_smoke_license_import_ok\n');

  const gate = await requestJson('/enterprise/license-gate/current', { headers: bearerHeaders(token) });
  if (gate.data?.decision !== 'ALLOW') {
    throw new Error(`License gate decision was ${gate.data?.decision || 'missing'} (${gate.data?.reason || 'unknown'})`);
  }
  process.stdout.write('sample_smoke_vendor_license_gate_ok\n');

  const overview = await requestJson('/enterprise/workbench/overview', { headers: bearerHeaders(token) });
  const notices = overview.data?.systemNotices;
  if (!Array.isArray(notices)) throw new Error('Workbench overview did not return systemNotices');
  if (notices.some((notice) => Number(notice?.noticeId) === -1)) {
    throw new Error('Workbench used the local fallback notice because the vendor announcement API failed');
  }
  process.stdout.write('sample_smoke_vendor_workbench_ok\n');
  process.stdout.write('sample_smoke_all_ok\n');
} catch (error) {
  process.stderr.write(`sample smoke failed: ${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}
