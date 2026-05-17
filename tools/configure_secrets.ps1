param(
  [string]$ProjectRef = 'szqpspkhxyfxtpqbxcyj'
)

$ErrorActionPreference = 'Stop'

function ConvertFrom-SecureStringPlain([SecureString]$sec) {
  $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($sec)
  try { return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr) }
  finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr) }
}

function Set-EnvVarInFile([string]$filePath, [string]$key, [string]$value) {
  if (!(Test-Path $filePath)) {
    throw "Missing env file: $filePath"
  }

  $text = Get-Content -Raw -Encoding UTF8 $filePath
  $pattern = "(?m)^$([Regex]::Escape($key))=.*$"

  if ($text -match $pattern) {
    $text = [Regex]::Replace($text, $pattern, "$key=$value")
  } else {
    if (-not $text.EndsWith("`n")) { $text += "`n" }
    $text += "$key=$value`n"
  }

  Set-Content -Encoding UTF8 -NoNewline -Path $filePath -Value $text
}

$root = Split-Path -Parent $PSScriptRoot
$backendEnv = Join-Path $root 'backend\.env'
$frontendEnv = Join-Path $root 'frontend\.env'

Write-Host "Configuring env files:" -ForegroundColor Cyan
Write-Host "  $backendEnv"
Write-Host "  $frontendEnv"

# Non-secret derived value
$supabaseUrl = "https://$ProjectRef.supabase.co"
Set-EnvVarInFile $backendEnv 'SUPABASE_URL' $supabaseUrl
Set-EnvVarInFile $frontendEnv 'VITE_SUPABASE_URL' $supabaseUrl

Write-Host "Enter keys (input is hidden where supported):" -ForegroundColor Cyan

$sbAnon = Read-Host -Prompt "Supabase anon (public) API key (JWT, starts with 'eyJ...')"
$sbSecretSec = Read-Host -AsSecureString -Prompt 'Supabase secret (service role) key'
$geminiSec = Read-Host -AsSecureString -Prompt 'Gemini API key'
$sarvamSec = Read-Host -AsSecureString -Prompt 'Sarvam API key'

if ($sbAnon -and -not $sbAnon.Trim().StartsWith('eyJ')) {
  Write-Warning "That key doesn't look like a Supabase anon/service JWT (expected to start with 'eyJ'). In Supabase: Project Settings -> API -> 'anon public'."
}

$sbSecret = ConvertFrom-SecureStringPlain $sbSecretSec
$gemini = ConvertFrom-SecureStringPlain $geminiSec
$sarvam = ConvertFrom-SecureStringPlain $sarvamSec

# Write Supabase
Set-EnvVarInFile $frontendEnv 'VITE_SUPABASE_ANON_KEY' $sbAnon
Set-EnvVarInFile $backendEnv 'SUPABASE_KEY' $sbAnon
Set-EnvVarInFile $backendEnv 'SUPABASE_SERVICE_KEY' $sbSecret

# Write AI keys
Set-EnvVarInFile $backendEnv 'GEMINI_API_KEY' $gemini
Set-EnvVarInFile $backendEnv 'SARVAM_API_KEY' $sarvam

Write-Host "Done. Restart dev servers to apply changes." -ForegroundColor Green
Write-Host "Suggested: run npm run dev from repo root." -ForegroundColor Green
