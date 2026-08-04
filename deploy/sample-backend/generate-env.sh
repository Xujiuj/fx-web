#!/usr/bin/env bash
set -euo pipefail

readonly target_dir=/opt/fx-sample-backend
readonly target_file="$target_dir/.env"

die() {
  printf 'generate-env: %s\n' "$*" >&2
  exit 1
}

for command_name in openssl htpasswd base64 od install mktemp; do
  command -v "$command_name" >/dev/null 2>&1 || die "missing required command: $command_name"
done

if (( EUID != 0 )); then
  die 'run as root so /opt/fx-sample-backend/.env can be created with mode 0600'
fi

vendor_url=${ENTERPRISE_VENDOR_OPEN_BASE_URL:-}
[[ "$vendor_url" =~ ^https://[A-Za-z0-9._:-]+(/[-A-Za-z0-9._~/%]*)?$ ]] \
  || die 'set ENTERPRISE_VENDOR_OPEN_BASE_URL to the real HTTPS base URL without query or fragment components'
case "${vendor_url,,}" in
  *example*|*invalid*|*localhost*|*127.0.0.1*|*vendor-backend*|*changeme*)
    die 'ENTERPRISE_VENDOR_OPEN_BASE_URL is still a placeholder or local endpoint'
    ;;
esac

install -d -m 0700 "$target_dir"
[[ ! -e "$target_file" ]] || die "$target_file already exists; refusing to overwrite deployment identity and credentials"

umask 077
temporary_dir=$(mktemp -d)
cleanup() {
  find "$temporary_dir" -mindepth 1 -delete 2>/dev/null || true
  rmdir "$temporary_dir" 2>/dev/null || true
}
trap cleanup EXIT

random_hex() {
  openssl rand -hex "$1"
}

generate_rsa_pair() {
  local prefix=$1
  local private_pem="$temporary_dir/${prefix}-private.pem"
  openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out "$private_pem" 2>/dev/null
  openssl pkey -in "$private_pem" -pubout -outform DER 2>/dev/null | base64 -w0
  printf '\n'
  openssl pkcs8 -topk8 -nocrypt -in "$private_pem" -outform DER 2>/dev/null | base64 -w0
  printf '\n'
}

sqlserver_password="S$(random_hex 14)a9!"
database_password="D$(random_hex 14)b8!"
redis_password=$(random_hex 24)
minio_user="sample$(random_hex 6)"
minio_password="M$(random_hex 18)c7!"
jwt_secret=$(random_hex 48)
actuator_password=$(random_hex 24)
admin_password="A$(random_hex 10)z9!"
admin_hash=$(htpasswd -bnBC 12 '' "$admin_password" | sed 's/^://' | tr -d '\r\n')
[[ ${#admin_hash} -eq 60 ]] || die 'htpasswd did not produce a 60-character BCrypt hash'
admin_hash_hex=$(printf '%s' "$admin_hash" | od -An -v -tx1 | tr -d ' \n')
[[ "$admin_hash_hex" =~ ^[0-9a-f]{120}$ ]] || die 'failed to encode the BCrypt hash as 120 hexadecimal characters'

mapfile -t request_pair < <(generate_rsa_pair request)
mapfile -t response_pair < <(generate_rsa_pair response)
[[ ${#request_pair[@]} -eq 2 && ${#response_pair[@]} -eq 2 ]] || die 'failed to generate independent RSA key pairs'

install_id="INSTALL-SAMPLE-$(random_hex 12 | tr '[:lower:]' '[:upper:]')"
temporary_env="$temporary_dir/sample.env"
{
  printf 'SAMPLE_SQLSERVER_SA_PASSWORD=%s\n' "$sqlserver_password"
  printf '%s\n' 'SAMPLE_DB_USERNAME=sample_app'
  printf 'SAMPLE_DB_PASSWORD=%s\n' "$database_password"
  printf 'SAMPLE_REDIS_PASSWORD=%s\n' "$redis_password"
  printf 'SAMPLE_MINIO_ROOT_USER=%s\n' "$minio_user"
  printf 'SAMPLE_MINIO_ROOT_PASSWORD=%s\n' "$minio_password"
  printf '%s\n' 'SAMPLE_MINIO_BUCKET=sample'
  printf 'SAMPLE_JWT_SECRET=%s\n' "$jwt_secret"
  printf 'SAMPLE_ACTUATOR_PASSWORD=%s\n' "$actuator_password"
  printf 'SAMPLE_ADMIN_PASSWORD=%s\n' "$admin_password"
  printf 'SAMPLE_ADMIN_PASSWORD_HASH_HEX=%s\n' "$admin_hash_hex"
  printf 'SAMPLE_API_REQUEST_PUBLIC_KEY=%s\n' "${request_pair[0]}"
  printf 'SAMPLE_API_REQUEST_PRIVATE_KEY=%s\n' "${request_pair[1]}"
  printf 'SAMPLE_API_RESPONSE_PUBLIC_KEY=%s\n' "${response_pair[0]}"
  printf 'SAMPLE_API_RESPONSE_PRIVATE_KEY=%s\n' "${response_pair[1]}"
  printf 'ENTERPRISE_INSTALL_ID=%s\n' "$install_id"
  printf 'ENTERPRISE_VENDOR_OPEN_BASE_URL=%s\n' "$vendor_url"
  printf '%s\n' \
    'SAMPLE_BACKEND_HOST_PORT=18012' \
    'SAMPLE_SQLSERVER_HOST_PORT=21434' \
    'SAMPLE_REDIS_HOST_PORT=26380' \
    'SAMPLE_MINIO_HOST_PORT=19000' \
    'SAMPLE_MINIO_CONSOLE_HOST_PORT=19001'
} > "$temporary_env"

install -m 0600 "$temporary_env" "$target_file"
printf 'Created %s with an independent install ID, credentials, JWT secret, and two RSA key pairs.\n' "$target_file"
printf 'Request a signed license for install ID %s, then install it as %s/license/sample.lic with mode 0600.\n' "$install_id" "$target_dir"
