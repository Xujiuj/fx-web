#!/usr/bin/env bash
set -Eeuo pipefail
umask 077

log() {
  printf '[sample-deploy] %s\n' "$*"
}

die() {
  printf '[sample-deploy] ERROR: %s\n' "$*" >&2
  exit 1
}

usage() {
  printf 'Usage: %s --release-dir DIR --ui-archive FILE\n' "$0" >&2
  exit 2
}

release_dir=
ui_archive=
while (( $# > 0 )); do
  case "$1" in
    --release-dir)
      (( $# >= 2 )) || usage
      release_dir=$2
      shift 2
      ;;
    --ui-archive)
      (( $# >= 2 )) || usage
      ui_archive=$2
      shift 2
      ;;
    *) usage ;;
  esac
done

[[ -n "$release_dir" && -n "$ui_archive" ]] || usage

readonly target=/opt/fx-sample-backend
readonly env_file="$target/.env"
readonly license_file="$target/license/sample.lic"
readonly ui_parent=/opt/fx-sample-ui
readonly ui_current="$ui_parent/current"
readonly public_origin=https://fengxingzhicheng.com
readonly enterprise_health=https://fengxingzhicheng.com/enterprise/prod-api/

candidate_ui=
rollback_ui=
nginx_backup=
nginx_site=
compose_file="$target/compose.yml"
compose_project_directory="$target"
candidate_backend_image=
rollback_backend_image=
rollback_pinned_image=
pinned_backend_image=
existing_backend_id=
backend_replacement_started=0
backend_replacement_committed=0
candidate_backend_started=0
pinned_backend_retagged=0
pinned_backend_tag_existed=0
release_rollback_dir=
release_replacement_started=0
release_replacement_committed=0
first_install_started=0
activation_started=0
activation_committed=0
fresh_database=0

safe_remove_tree() {
  local path=$1
  case "$path" in
    /opt/fx-sample-ui/.candidate.*|/opt/fx-sample-ui/.rollback.*|/opt/fx-sample-ui/current)
      if [[ -L "$path" ]]; then
        unlink "$path"
      elif [[ -d "$path" ]]; then
        find "$path" -mindepth 1 -delete
        rmdir "$path"
      elif [[ -e "$path" ]]; then
        rm -f -- "$path"
      fi
      ;;
    *) die "refusing to remove unexpected path: $path" ;;
  esac
}

compose() {
  docker compose \
    --project-name "${COMPOSE_PROJECT_NAME:-fx-sample-backend}" \
    --project-directory "$compose_project_directory" \
    -f "$compose_file" \
    "$@"
}

wait_for_service_health() {
  local service_name=$1
  local attempts=${2:-60}
  local container_id state
  for (( attempt=1; attempt<=attempts; attempt++ )); do
    container_id=$(compose ps -q --all "$service_name")
    if [[ -n "$container_id" ]]; then
      state=$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' "$container_id")
      if [[ "$state" == healthy || "$state" == running ]]; then
        log "$service_name is $state"
        return 0
      fi
      if [[ "$state" == unhealthy || "$state" == exited || "$state" == dead ]]; then
        return 1
      fi
    fi
    sleep 5
  done
  return 1
}

wait_for_health() {
  local service_name=$1
  local attempts=${2:-60}
  wait_for_service_health "$service_name" "$attempts" \
    || die "$service_name did not become healthy in time"
}

fetch_http_200() {
  local url=$1
  local output_file=$2
  local header_file=${3:-}
  local -a header_args=()
  local status
  if [[ -n "$header_file" ]]; then
    header_args=(--dump-header "$header_file")
  fi
  status=$(curl --location --fail --silent --show-error \
    --retry 10 --retry-delay 2 --retry-connrefused --max-time 20 \
    "${header_args[@]}" --output "$output_file" --write-out '%{http_code}' "$url") \
    || die "HTTP probe failed: $url"
  [[ "$status" == 200 ]] || die "HTTP probe returned status $status: $url"
}

require_final_response_header() {
  local header_file=$1
  local header_name=$2
  local expected_value=$3
  local actual_value
  actual_value=$(awk -v requested_name="$header_name" '
    /^HTTP\/[0-9.]+[[:space:]]/ {
      value = ""
      next
    }
    {
      line = $0
      sub(/\r$/, "", line)
      separator = index(line, ":")
      if (separator > 0 && tolower(substr(line, 1, separator - 1)) == tolower(requested_name)) {
        value = substr(line, separator + 1)
        sub(/^[[:space:]]+/, "", value)
      }
    }
    END { printf "%s", value }
  ' "$header_file")
  [[ "$actual_value" == "$expected_value" ]] \
    || die "$header_name mismatch: expected '$expected_value', received '${actual_value:-<missing>}'"
}

validate_public_routes() {
  local public_http_body public_http_headers
  public_http_body=$(mktemp)
  public_http_headers=$(mktemp)
  fetch_http_200 "$public_origin/sample/" "$public_http_body"
  grep -F '/sample/runtime-config.js' "$public_http_body" >/dev/null \
    || die 'public /sample/ did not return the isolated UI'
  fetch_http_200 "$public_origin/sample/runtime-config.js" "$public_http_body"
  grep -F 'window.__FX_SAMPLE_RUNTIME__' "$public_http_body" >/dev/null \
    || die 'public runtime-config.js did not contain the sample runtime object'
  fetch_http_200 "$public_origin/sample-api/auth/code" "$public_http_body"
  grep -E '"code"[[:space:]]*:[[:space:]]*200' "$public_http_body" >/dev/null \
    || die 'public /sample-api/auth/code response was not the expected success payload'
  fetch_http_200 "$public_origin/sample-oss/minio/health/live" "$public_http_body" "$public_http_headers"
  require_final_response_header "$public_http_headers" Content-Security-Policy \
    "sandbox; default-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'"
  require_final_response_header "$public_http_headers" X-Content-Type-Options nosniff
  require_final_response_header "$public_http_headers" Referrer-Policy no-referrer
  fetch_http_200 "$enterprise_health" "$public_http_body"
  rm -f -- "$public_http_body" "$public_http_headers"
}

sqlcmd_exec() {
  compose exec -T sqlserver sh -ec \
    'export SQLCMDPASSWORD="$MSSQL_SA_PASSWORD"; cd /opt/fx-sample/sql; exec "$@"' \
    sh "$sqlcmd_bin" -S localhost -U sa -C -b -r 1 "$@"
}

restore_activation() {
  (( activation_started == 1 && activation_committed == 0 )) || return 0
  log 'restoring the previous /sample UI and Nginx configuration'
  set +e
  if [[ -n "$nginx_backup" && -f "$nginx_backup" && -n "$nginx_site" ]]; then
    install -m 0644 "$nginx_backup" "$nginx_site"
  fi
  if [[ -e "$ui_current" || -L "$ui_current" ]]; then
    safe_remove_tree "$ui_current"
  fi
  if [[ -n "$rollback_ui" && ( -e "$rollback_ui" || -L "$rollback_ui" ) ]]; then
    mv "$rollback_ui" "$ui_current"
    rollback_ui=
  fi
  nginx -t && nginx -s reload
  set -e
}

restore_backend() {
  (( backend_replacement_started == 1 && backend_replacement_committed == 0 )) || return 0
  [[ -n "$rollback_backend_image" && -f "$target/compose.yml" ]] || return 0
  log 'restoring the backend image that was running before candidate validation'
  set +e
  compose_file="$target/compose.yml"
  compose_project_directory="$target"
  SAMPLE_BACKEND_IMAGE="$rollback_backend_image" compose up -d --no-deps --force-recreate backend
  if ! wait_for_service_health backend 60; then
    log 'backend rollback did not become healthy; inspect the emitted Compose logs immediately'
  fi
  set -e
}

restore_pinned_backend_image() {
  (( pinned_backend_retagged == 1 && backend_replacement_committed == 0 )) || return 0
  log 'restoring the backend image tag that existed before candidate activation'
  set +e
  if (( pinned_backend_tag_existed == 1 )); then
    docker image tag "$rollback_pinned_image" "$pinned_backend_image"
  else
    docker image rm "$pinned_backend_image" >/dev/null 2>&1
  fi
  set -e
}

remove_release_entry() {
  local path=$1
  case "$path" in
    "$target"/.dockerignore|"$target"/Dockerfile|"$target"/versions.env|"$target"/backend.jar|"$target"/smoke.mjs|"$target"/compose.yml)
      rm -f -- "$path"
      ;;
    "$target"/sql|"$target"/runtime-sql)
      if [[ -d "$path" && ! -L "$path" ]]; then
        find "$path" -mindepth 1 -delete
        rmdir "$path"
      else
        rm -f -- "$path"
      fi
      ;;
    *) die "refusing to remove unexpected release path: $path" ;;
  esac
}

restore_release_files() {
  (( release_replacement_started == 1 && release_replacement_committed == 0 )) || return 0
  [[ -n "$release_rollback_dir" && -d "$release_rollback_dir" ]] || return 0
  log 'restoring the release metadata that existed before candidate activation'
  set +e
  for release_entry in .dockerignore Dockerfile versions.env backend.jar smoke.mjs compose.yml sql runtime-sql; do
    if [[ -e "$target/$release_entry" || -L "$target/$release_entry" ]]; then
      remove_release_entry "$target/$release_entry"
    fi
    if [[ -e "$release_rollback_dir/$release_entry" || -L "$release_rollback_dir/$release_entry" ]]; then
      mv "$release_rollback_dir/$release_entry" "$target/$release_entry"
    fi
  done
  rmdir "$release_rollback_dir"
  release_rollback_dir=
  set -e
}

drop_fresh_database() {
  (( fresh_database == 1 )) || return 0
  log 'removing the database created by this failed, unactivated deployment'
  set +e
  compose stop backend >/dev/null 2>&1
  sqlcmd_exec -d master -Q \
    "IF DB_ID(N'sample_fengxing') IS NOT NULL BEGIN ALTER DATABASE [sample_fengxing] SET SINGLE_USER WITH ROLLBACK IMMEDIATE; DROP DATABASE [sample_fengxing]; END; IF SUSER_ID(N'sample_app') IS NOT NULL DROP LOGIN [sample_app];" \
    >/dev/null 2>&1
  compose down --remove-orphans >/dev/null 2>&1
  set -e
}

stop_failed_first_install() {
  [[ -z "$existing_backend_id" ]] || return 0
  (( first_install_started == 1 || candidate_backend_started == 1 )) || return 0
  log 'stopping the uncommitted first-install sample containers'
  set +e
  compose_file="$target/compose.yml"
  compose_project_directory="$target"
  compose down --remove-orphans >/dev/null 2>&1
  set -e
}

cleanup() {
  local exit_code=$?
  trap - EXIT
  if (( exit_code != 0 )); then
    if [[ -f "$compose_file" ]]; then
      set +e
      compose ps
      compose logs --no-color --tail=160 backend sqlserver redis minio
      set -e
    fi
    restore_activation
    restore_release_files
    restore_pinned_backend_image
    restore_backend
    drop_fresh_database
    stop_failed_first_install
  fi
  if [[ -n "$candidate_ui" && ( -e "$candidate_ui" || -L "$candidate_ui" ) ]]; then
    safe_remove_tree "$candidate_ui"
  fi
  if [[ -n "$nginx_backup" && -f "$nginx_backup" ]]; then
    rm -f -- "$nginx_backup"
  fi
  if [[ -n "$candidate_backend_image" ]]; then
    docker image rm "$candidate_backend_image" >/dev/null 2>&1 || true
  fi
  if [[ -n "$rollback_backend_image" ]]; then
    docker image rm "$rollback_backend_image" >/dev/null 2>&1 || true
  fi
  if [[ -n "$rollback_pinned_image" ]]; then
    docker image rm "$rollback_pinned_image" >/dev/null 2>&1 || true
  fi
  exit "$exit_code"
}
trap cleanup EXIT

for command_name in awk chmod cp curl df docker find getconf grep install journalctl mktemp mv nginx node realpath rm rmdir sed sha256sum sleep ss stat systemctl tar tr uname; do
  command -v "$command_name" >/dev/null 2>&1 || die "missing required command: $command_name"
done

release_dir=$(realpath "$release_dir")
ui_archive=$(realpath "$ui_archive")
[[ -d "$release_dir" ]] || die "release directory does not exist: $release_dir"
[[ -f "$ui_archive" ]] || die "UI archive does not exist: $ui_archive"
for release_file in .dockerignore compose.yml Dockerfile versions.env backend.jar smoke.mjs; do
  [[ -f "$release_dir/$release_file" ]] || die "release is missing $release_file"
done
for release_directory in sql runtime-sql; do
  [[ -d "$release_dir/$release_directory" ]] || die "release is missing $release_directory/"
done
(cd "$release_dir/sql" && sha256sum -c SHA256SUMS)

[[ -f "$env_file" && ! -L "$env_file" ]] || die "create $env_file with generate-env.sh before deployment"
[[ $(stat -c '%a' "$env_file") == 600 ]] || die "$env_file must have mode 0600"
[[ -s "$license_file" && ! -L "$license_file" ]] || die "install the signed license at $license_file before deployment"
[[ $(stat -c '%a' "$license_file") == 600 ]] || die "$license_file must have mode 0600"

set -a
# shellcheck disable=SC1090
. "$env_file"
# Release-owned project and image pins must override every host value.
# shellcheck disable=SC1090
. "$release_dir/versions.env"
set +a

required_variables=(
  COMPOSE_PROJECT_NAME SAMPLE_BACKEND_IMAGE SAMPLE_JRE_IMAGE SAMPLE_SQLSERVER_IMAGE SAMPLE_REDIS_IMAGE
  SAMPLE_MINIO_IMAGE SAMPLE_MINIO_CLIENT_IMAGE SAMPLE_SQLSERVER_SA_PASSWORD SAMPLE_DB_USERNAME
  SAMPLE_DB_PASSWORD SAMPLE_REDIS_PASSWORD SAMPLE_MINIO_ROOT_USER SAMPLE_MINIO_ROOT_PASSWORD
  SAMPLE_MINIO_BUCKET SAMPLE_JWT_SECRET SAMPLE_ACTUATOR_PASSWORD SAMPLE_ADMIN_PASSWORD SAMPLE_ADMIN_PASSWORD_HASH_HEX
  SAMPLE_API_REQUEST_PUBLIC_KEY SAMPLE_API_REQUEST_PRIVATE_KEY SAMPLE_API_RESPONSE_PUBLIC_KEY
  SAMPLE_API_RESPONSE_PRIVATE_KEY ENTERPRISE_INSTALL_ID ENTERPRISE_VENDOR_OPEN_BASE_URL
)
for variable_name in "${required_variables[@]}"; do
  [[ -n ${!variable_name:-} ]] || die "$variable_name is missing from the release or $env_file"
done

[[ "$SAMPLE_DB_USERNAME" == sample_app ]] || die 'SAMPLE_DB_USERNAME must be sample_app for the reviewed runtime SQL'
[[ "$COMPOSE_PROJECT_NAME" == fx-sample-backend ]] || die 'COMPOSE_PROJECT_NAME must remain fx-sample-backend'
[[ "$SAMPLE_MINIO_BUCKET" == sample ]] || die 'SAMPLE_MINIO_BUCKET must be sample for the reviewed public route'
[[ "$SAMPLE_ADMIN_PASSWORD_HASH_HEX" =~ ^[0-9A-Fa-f]{120}$ ]] || die 'SAMPLE_ADMIN_PASSWORD_HASH_HEX must contain exactly 120 hexadecimal characters'
(( ${#SAMPLE_ADMIN_PASSWORD} >= 5 && ${#SAMPLE_ADMIN_PASSWORD} <= 30 )) || die 'SAMPLE_ADMIN_PASSWORD must be between 5 and 30 characters'
[[ "$ENTERPRISE_INSTALL_ID" =~ ^[A-Z0-9][A-Z0-9._:-]{7,127}$ ]] || die 'ENTERPRISE_INSTALL_ID has an invalid format'
[[ "$ENTERPRISE_VENDOR_OPEN_BASE_URL" =~ ^https://[A-Za-z0-9._:-]+(/[-A-Za-z0-9._~/%]*)?$ ]] \
  || die 'ENTERPRISE_VENDOR_OPEN_BASE_URL must be an HTTPS base URL without query or fragment components'
[[ $(uname -m) == x86_64 ]] \
  || die 'the pinned sample runtime images require an x86_64 host'
node_major=$(node --version)
node_major=${node_major#v}
node_major=${node_major%%.*}
[[ "$node_major" =~ ^[0-9]+$ ]] && (( node_major >= 20 )) \
  || die 'Node.js 20 or newer is required for the authenticated smoke checks'
case "${ENTERPRISE_VENDOR_OPEN_BASE_URL,,}" in
  *example*|*invalid*|*localhost*|*127.0.0.1*|*vendor-backend*|*changeme*)
    die 'ENTERPRISE_VENDOR_OPEN_BASE_URL is a placeholder or local endpoint'
    ;;
esac

log 'capturing existing service, container, log, and HTTP state before any replacement'
systemctl status fx-web.service --no-pager || true
journalctl -u fx-web.service -n 120 --no-pager || true
if [[ -f "$target/compose.yml" ]]; then
  compose ps || true
  compose logs --no-color --tail=120 backend sqlserver redis minio || true
fi
curl --location --fail --silent --show-error --max-time 15 "$public_origin/sample/" >/dev/null || true
preflight_http_body=$(mktemp)
fetch_http_200 "$enterprise_health" "$preflight_http_body"
rm -f -- "$preflight_http_body"

nginx_dump=$(mktemp)
nginx -T > "$nginx_dump" 2>&1
nginx_site=$(awk '
  /^# configuration file / {
    file = $0
    sub(/^# configuration file /, "", file)
    sub(/:$/, "", file)
  }
  /server_name[[:space:]].*fengxingzhicheng\.com/ {
    print file
    exit
  }
' "$nginx_dump")
rm -f -- "$nginx_dump"
[[ -n "$nginx_site" && -f "$nginx_site" ]] || die 'could not resolve the fengxingzhicheng.com Nginx site file'
grep -E '^[[:space:]]*location[[:space:]]+/[[:space:]]*\{' "$nginx_site" >/dev/null \
  || die 'Nginx site has no root location before which the managed sample block can be inserted'

cpu_count=$(getconf _NPROCESSORS_ONLN)
memory_available_kb=$(awk '/^MemAvailable:/ { print $2 }' /proc/meminfo)
disk_available_kb=$(df --output=avail -k "$target" | awk 'NR == 2 { print $1 }')
log "preflight resources: cpu=$cpu_count mem_available_kb=$memory_available_kb disk_available_kb=$disk_available_kb"
(( cpu_count >= 2 )) || die 'at least 2 CPU cores are required for the isolated SQL Server and backend'
(( memory_available_kb >= 2097152 )) || die 'at least 2 GiB of available memory is required before deployment'
(( disk_available_kb >= 8388608 )) || die 'at least 8 GiB of free disk is required before deployment'

ports=(
  "${SAMPLE_BACKEND_HOST_PORT:-18012}"
  "${SAMPLE_SQLSERVER_HOST_PORT:-21434}"
  "${SAMPLE_REDIS_HOST_PORT:-26380}"
  "${SAMPLE_MINIO_HOST_PORT:-19000}"
  "${SAMPLE_MINIO_CONSOLE_HOST_PORT:-19001}"
)
[[ ${SAMPLE_BACKEND_HOST_PORT:-18012} == 18012 ]] || die 'SAMPLE_BACKEND_HOST_PORT must remain the reviewed port 18012'
[[ ${SAMPLE_SQLSERVER_HOST_PORT:-21434} == 21434 ]] || die 'SAMPLE_SQLSERVER_HOST_PORT must remain the reviewed port 21434'
[[ ${SAMPLE_REDIS_HOST_PORT:-26380} == 26380 ]] || die 'SAMPLE_REDIS_HOST_PORT must remain the reviewed port 26380'
[[ ${SAMPLE_MINIO_HOST_PORT:-19000} == 19000 ]] || die 'SAMPLE_MINIO_HOST_PORT must remain the reviewed port 19000'
[[ ${SAMPLE_MINIO_CONSOLE_HOST_PORT:-19001} == 19001 ]] || die 'SAMPLE_MINIO_CONSOLE_HOST_PORT must remain the reviewed port 19001'
for port in "${ports[@]}"; do
  own_listener=0
  while IFS='|' read -r listener_project listener_name; do
    [[ -n "$listener_name" ]] || continue
    if [[ "$listener_project" == "$COMPOSE_PROJECT_NAME" ]]; then
      own_listener=1
    else
      die "host port $port is already published by ${listener_name:-an unrelated container}"
    fi
  done < <(docker ps --filter "publish=$port" --format '{{.Label "com.docker.compose.project"}}|{{.Names}}')
  if (( own_listener == 0 )) && ss -H -ltn | awk -v suffix=":$port" '$4 ~ suffix "$" { found=1 } END { exit !found }'; then
    die "host port $port is already in use outside the sample Compose project"
  fi
done

log 'checking that every pinned runtime image is pullable'
for image_name in "$SAMPLE_JRE_IMAGE" "$SAMPLE_SQLSERVER_IMAGE" "$SAMPLE_REDIS_IMAGE" "$SAMPLE_MINIO_IMAGE" "$SAMPLE_MINIO_CLIENT_IMAGE"; do
  docker pull "$image_name" >/dev/null
done

pinned_backend_image=$SAMPLE_BACKEND_IMAGE
candidate_backend_image="fx-sample-backend:candidate-$$"
existing_backend_id=

install_release_files() {
  log 'installing the reviewed release files into the isolated deployment target'
  install -d -m 0755 "$target" "$target/sql" "$target/runtime-sql"
  install -m 0644 "$release_dir/.dockerignore" "$target/.dockerignore"
  install -m 0644 "$release_dir/Dockerfile" "$target/Dockerfile"
  install -m 0644 "$release_dir/versions.env" "$target/versions.env"
  install -m 0644 "$release_dir/backend.jar" "$target/backend.jar"
  install -m 0644 "$release_dir/smoke.mjs" "$target/smoke.mjs"
  find "$target/sql" -mindepth 1 -delete
  find "$target/runtime-sql" -mindepth 1 -delete
  cp -a "$release_dir/sql/." "$target/sql/"
  cp -a "$release_dir/runtime-sql/." "$target/runtime-sql/"
  find "$target/sql" "$target/runtime-sql" -type f -exec chmod 0644 {} +
  install -m 0644 "$release_dir/compose.yml" "$target/compose.yml"
}

stage_existing_release_replacement() {
  release_rollback_dir=$(mktemp -d "$target/.release-rollback.XXXXXX")
  release_replacement_started=1
  for release_entry in .dockerignore Dockerfile versions.env backend.jar smoke.mjs compose.yml sql runtime-sql; do
    if [[ -e "$target/$release_entry" || -L "$target/$release_entry" ]]; then
      mv "$target/$release_entry" "$release_rollback_dir/$release_entry"
    fi
  done
  install_release_files
}

discard_release_rollback() {
  [[ -n "$release_rollback_dir" && -d "$release_rollback_dir" ]] || return 0
  case "$release_rollback_dir" in
    "$target"/.release-rollback.*)
      find "$release_rollback_dir" -mindepth 1 -delete
      rmdir "$release_rollback_dir"
      release_rollback_dir=
      ;;
    *) die "refusing to remove unexpected release rollback path: $release_rollback_dir" ;;
  esac
}

verify_existing_runtime_service() {
  local service_name=$1
  local expected_image=$2
  local container_id actual_image_id expected_image_id
  container_id=$(compose ps -q --all "$service_name")
  [[ -n "$container_id" ]] || die "existing deployment is missing its $service_name container"
  actual_image_id=$(docker inspect --format '{{.Image}}' "$container_id")
  expected_image_id=$(docker image inspect --format '{{.Id}}' "$expected_image")
  [[ "$actual_image_id" == "$expected_image_id" ]] \
    || die "existing $service_name image differs from the reviewed pin; migrate dependencies separately"
  wait_for_health "$service_name" 60
}

if [[ -f "$target/compose.yml" ]]; then
  existing_backend_id=$(compose ps -q --all backend)
  if [[ -n "$existing_backend_id" ]]; then
    verify_existing_runtime_service sqlserver "$SAMPLE_SQLSERVER_IMAGE"
    verify_existing_runtime_service redis "$SAMPLE_REDIS_IMAGE"
    verify_existing_runtime_service minio "$SAMPLE_MINIO_IMAGE"
    wait_for_health backend 60
    rollback_backend_image="fx-sample-backend:rollback-$$"
    docker image tag "$(docker inspect --format '{{.Image}}' "$existing_backend_id")" "$rollback_backend_image"
  fi
fi

if [[ -z "$existing_backend_id" ]]; then
  install_release_files
  compose_file="$target/compose.yml"
  compose_project_directory="$target"
else
  compose_file="$release_dir/compose.yml"
  compose_project_directory="$release_dir"
fi
export SAMPLE_BACKEND_IMAGE=$candidate_backend_image

log 'building the candidate backend without exposing host secrets to the Docker context'
compose config --quiet
compose build --pull backend
if [[ -z "$existing_backend_id" ]]; then
  first_install_started=1
  compose up -d sqlserver redis minio
fi

wait_for_health sqlserver 60
wait_for_health redis 30
wait_for_health minio 30
compose --profile tools run --rm --no-deps minio-configure

sqlcmd_bin=$(compose exec -T sqlserver sh -ec \
  'if [ -x /opt/mssql-tools18/bin/sqlcmd ]; then printf /opt/mssql-tools18/bin/sqlcmd; elif [ -x /opt/mssql-tools/bin/sqlcmd ]; then printf /opt/mssql-tools/bin/sqlcmd; else exit 1; fi') \
  || die 'SQL Server image does not contain sqlcmd'

database_exists=$(sqlcmd_exec -d master -h -1 -W -Q \
  "SET NOCOUNT ON; SELECT CASE WHEN DB_ID(N'sample_fengxing') IS NULL THEN 0 ELSE 1 END;" | tr -d '\r[:space:]')
[[ "$database_exists" == 0 || "$database_exists" == 1 ]] || die "unexpected database existence result: $database_exists"

schema_log=$(mktemp)
if [[ "$database_exists" == 0 ]]; then
  fresh_database=1
  log 'bootstrapping the fresh sample_fengxing database'
  if ! sqlcmd_exec \
      -v "SAMPLE_ADMIN_PASSWORD_HASH_HEX=$SAMPLE_ADMIN_PASSWORD_HASH_HEX" \
      -i /opt/fx-sample/sql/bootstrap.sql > "$schema_log" 2>&1; then
    sed -n '1,240p' "$schema_log" >&2
    die 'fresh SQL bootstrap failed'
  fi
else
  log 'existing sample_fengxing database found; running the standalone schema contract verification'
  if ! sqlcmd_exec -d sample_fengxing -i /dev/stdin \
      < "$release_dir/sql/verify-schema.sql" > "$schema_log" 2>&1; then
    sed -n '1,240p' "$schema_log" >&2
    die 'existing SQL schema verification failed'
  fi
fi
grep -F 'sample_schema_verification_ok' "$schema_log" >/dev/null \
  || die 'SQL schema verification marker was not emitted'
sed -n '1,120p' "$schema_log"
rm -f -- "$schema_log"

runtime_log=$(mktemp)
if ! sqlcmd_exec \
    -v \
      "SAMPLE_DB_PASSWORD=$SAMPLE_DB_PASSWORD" \
      "SAMPLE_MINIO_ROOT_USER=$SAMPLE_MINIO_ROOT_USER" \
      "SAMPLE_MINIO_ROOT_PASSWORD=$SAMPLE_MINIO_ROOT_PASSWORD" \
      "SAMPLE_MINIO_BUCKET=$SAMPLE_MINIO_BUCKET" \
    -i /dev/stdin < "$release_dir/runtime-sql/configure-runtime.sql" > "$runtime_log" 2>&1; then
  sed -n '1,240p' "$runtime_log" >&2
  die 'isolated database login or MinIO runtime configuration failed'
fi
grep -F 'sample_runtime_configuration_ok' "$runtime_log" >/dev/null \
  || die 'runtime SQL verification marker was not emitted'
rm -f -- "$runtime_log"

if [[ -n "$existing_backend_id" ]]; then
  backend_replacement_started=1
fi
candidate_backend_started=1
compose up -d --no-deps backend
wait_for_health backend 60
curl --fail --silent --show-error --retry 10 --retry-delay 2 --retry-connrefused --max-time 15 \
  "http://127.0.0.1:${SAMPLE_BACKEND_HOST_PORT:-18012}/" >/dev/null

log 'running encrypted login, authenticated API, signed license, vendor gate, and workbench smoke checks'
SAMPLE_SMOKE_BASE_URL="http://127.0.0.1:${SAMPLE_BACKEND_HOST_PORT:-18012}" \
SAMPLE_LICENSE_PATH="$license_file" \
SAMPLE_COMPOSE_FILE="$compose_file" \
SAMPLE_COMPOSE_PROJECT_DIRECTORY="$compose_project_directory" \
node "$release_dir/smoke.mjs"

backend_log=$(mktemp)
compose logs --no-color --tail=240 backend > "$backend_log" 2>&1
sed -n '1,240p' "$backend_log"
if grep -E 'APPLICATION FAILED TO START|OutOfMemoryError|Address already in use|SQLServerException' "$backend_log" >/dev/null; then
  die 'backend logs contain a terminal startup or database failure'
fi
rm -f -- "$backend_log"

log 'staging the new UI and host-generated browser runtime configuration'
install -d -m 0755 "$ui_parent"
archive_list=$(mktemp)
tar -tzf "$ui_archive" --quoting-style=escape > "$archive_list"
if grep -E '(^/|(^|/)\.\.(/|$)|\\)' "$archive_list" >/dev/null; then
  rm -f -- "$archive_list"
  die 'UI archive contains an unsafe path'
fi
archive_types=$(mktemp)
tar -tvzf "$ui_archive" --quoting-style=escape > "$archive_types"
if awk '{ type=substr($1, 1, 1); if (type != "-" && type != "d") bad=1 } END { exit !bad }' "$archive_types"; then
  rm -f -- "$archive_list" "$archive_types"
  die 'UI archive contains a link or special file'
fi
rm -f -- "$archive_types"
rm -f -- "$archive_list"
candidate_ui=$(mktemp -d "$ui_parent/.candidate.XXXXXX")
chmod 0755 "$candidate_ui"
tar --extract --gzip --file "$ui_archive" --directory "$candidate_ui" --no-same-owner --no-same-permissions
[[ -f "$candidate_ui/index.html" && ! -L "$candidate_ui/index.html" ]] || die 'UI archive has no regular index.html'
[[ ! -e "$candidate_ui/runtime-config.js" && ! -L "$candidate_ui/runtime-config.js" ]] \
  || die 'UI archive must not provide runtime-config.js'
find "$candidate_ui" -type d -exec chmod 0755 {} +
find "$candidate_ui" -type f -exec chmod 0644 {} +
grep -F '/sample/runtime-config.js' "$candidate_ui/index.html" >/dev/null \
  || die 'UI does not load /sample/runtime-config.js before application startup'

{
  printf '%s\n' 'window.__FX_SAMPLE_RUNTIME__ = Object.freeze({'
  printf "  requestPublicKey: '%s',\n" "$SAMPLE_API_REQUEST_PUBLIC_KEY"
  printf "  responsePrivateKey: '%s'\n" "$SAMPLE_API_RESPONSE_PRIVATE_KEY"
  printf '%s\n' '});'
} > "$candidate_ui/runtime-config.js"
chmod 0644 "$candidate_ui/runtime-config.js"

grep -R -F '/sample-api' "$candidate_ui" >/dev/null \
  || die 'built UI does not contain the isolated /sample-api base URL'
if grep -R -F '/enterprise/prod-api' "$candidate_ui" >/dev/null; then
  die 'built UI still contains the existing /enterprise/prod-api base URL'
fi
if grep -R -F "$SAMPLE_API_REQUEST_PRIVATE_KEY" "$candidate_ui" >/dev/null; then
  die 'backend request-decryption private key leaked into the UI build'
fi

nginx_block=$(mktemp)
cat > "$nginx_block" <<'NGINX'
    # BEGIN FX_SAMPLE_UI
    location = /sample {
        return 308 /sample/;
    }

    location = /sample/runtime-config.js {
        alias /opt/fx-sample-ui/current/runtime-config.js;
        add_header Cache-Control "no-store" always;
    }

    location ^~ /sample-api/ {
        client_max_body_size 1g;
        proxy_request_buffering off;
        proxy_read_timeout 300s;
        proxy_send_timeout 300s;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_pass http://127.0.0.1:18012/;
    }

    location ^~ /sample-oss/ {
        proxy_request_buffering off;
        proxy_http_version 1.1;
        proxy_hide_header Content-Security-Policy;
        proxy_hide_header X-Content-Type-Options;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        add_header Content-Security-Policy "sandbox; default-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "no-referrer" always;
        proxy_pass http://127.0.0.1:19000/;
    }

    location ^~ /sample/ {
        alias /opt/fx-sample-ui/current/;
        disable_symlinks on;
        try_files $uri $uri/ /sample/index.html;
    }
    # END FX_SAMPLE_UI
NGINX

nginx_stripped=$(mktemp)
awk '
  /# BEGIN FX_SAMPLE_UI/ { skipping=1; next }
  /# END FX_SAMPLE_UI/ { skipping=0; next }
  !skipping { print }
' "$nginx_site" > "$nginx_stripped"
if grep -E '^[[:space:]]*location[[:space:]].*/sample([/[:space:]]|-api/|-oss/)' "$nginx_stripped" >/dev/null; then
  die 'unmanaged /sample, /sample-api, or /sample-oss Nginx location conflicts with the reviewed managed block'
fi

nginx_candidate=$(mktemp)
if ! awk -v block="$nginx_block" '
  /^[[:space:]]*location[[:space:]]+\/[[:space:]]*\{/ && !inserted {
    while ((getline line < block) > 0) print line
    close(block)
    inserted=1
  }
  { print }
  END { if (!inserted) exit 42 }
' "$nginx_stripped" > "$nginx_candidate"; then
  die 'failed to insert the managed sample block into the Nginx site'
fi
rm -f -- "$nginx_stripped" "$nginx_block"

nginx_backup=$(mktemp)
cp "$nginx_site" "$nginx_backup"
if [[ -e "$ui_current" || -L "$ui_current" ]]; then
  rollback_ui=$(mktemp -d "$ui_parent/.rollback.XXXXXX")
  rmdir "$rollback_ui"
  mv "$ui_current" "$rollback_ui"
fi
activation_started=1
mv "$candidate_ui" "$ui_current"
candidate_ui=
install -m 0644 "$nginx_candidate" "$nginx_site"
rm -f -- "$nginx_candidate"
nginx -t
nginx -s reload

log 'validating candidate public /sample routes and unchanged /enterprise routes'
validate_public_routes

log 'promoting the validated backend and rechecking the final target configuration'
if [[ -n "$existing_backend_id" ]]; then
  stage_existing_release_replacement
fi
if docker image inspect "$pinned_backend_image" >/dev/null 2>&1; then
  pinned_backend_tag_existed=1
  rollback_pinned_image="fx-sample-backend:pin-rollback-$$"
  docker image tag "$pinned_backend_image" "$rollback_pinned_image"
fi
docker image tag "$candidate_backend_image" "$pinned_backend_image"
pinned_backend_retagged=1
export SAMPLE_BACKEND_IMAGE=$pinned_backend_image
compose_file="$target/compose.yml"
compose_project_directory="$target"
compose config --quiet
compose up -d --no-deps backend
wait_for_health backend 60
curl --fail --silent --show-error --retry 10 --retry-delay 2 --retry-connrefused --max-time 15 \
  "http://127.0.0.1:${SAMPLE_BACKEND_HOST_PORT:-18012}/" >/dev/null
validate_public_routes

discard_release_rollback
release_replacement_committed=1
backend_replacement_committed=1
activation_committed=1
first_install_started=0
candidate_backend_started=0
fresh_database=0
if [[ -n "$rollback_ui" && ( -e "$rollback_ui" || -L "$rollback_ui" ) ]]; then
  safe_remove_tree "$rollback_ui"
  rollback_ui=
fi
rm -f -- "$nginx_backup"
nginx_backup=

compose ps
compose logs --no-color --tail=80 backend
log 'isolated /sample UI and /sample-api deployment completed successfully'
