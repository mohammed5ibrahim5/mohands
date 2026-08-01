$serviceRole = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlwa3pybXZkemRjeGNkenZ2YXRsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTU3MjE5MSwiZXhwIjoyMTAxMTQ4MTkxfQ.0HXu_d77OjN3tlmEnfD6JPNocUa3g13MewR5bzmUarU'
$projectUrl = 'https://ipkzrmvdzdcxcdzvvatl.supabase.co'

# Get REST API OpenAPI schema to see available tables/endpoints
try {
  $r = Invoke-RestMethod -Uri "$projectUrl/rest/v1/" -Method Get -Headers @{
    apikey = $serviceRole
    Authorization = "Bearer $serviceRole"
    Accept = 'application/openapi+json'
  }
  $paths = $r.paths.PSObject.Properties.Name
  Write-Host "AVAILABLE ENDPOINTS:"
  $paths | ForEach-Object { Write-Host $_ }
} catch {
  $status = $_.Exception.Response.StatusCode.value__
  Write-Host "REST API FAILED: HTTP $status"
  Write-Host $_.Exception.Message
}

