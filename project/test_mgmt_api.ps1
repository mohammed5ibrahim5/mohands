$serviceRole = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlwa3pybXZkemRjeGNkenZ2YXRsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTU3MjE5MSwiZXhwIjoyMTAxMTQ4MTkxfQ.0HXu_d77OjN3tlmEnfD6JPNocUa3g13MewR5bzmUarU'
$projectRef = 'ipkzrmvdzdcxcdzvvatl'

# Try Management API query endpoint with service_role key
try {
  $body = @{ query = 'SELECT 1 as test;' } | ConvertTo-Json
  $uri = "https://api.supabase.com/v1/projects/$projectRef/database/query"
  $r = Invoke-RestMethod -Uri $uri -Method Post -Headers @{
    Authorization = "Bearer $serviceRole"
    'Content-Type' = 'application/json'
  } -Body $body
  Write-Host "MGMT API SUCCESS:"
  $r | ConvertTo-Json
} catch {
  $status = $_.Exception.Response.StatusCode.value__
  Write-Host "MGMT API FAILED: HTTP $status"
  Write-Host $_.Exception.Message
}

