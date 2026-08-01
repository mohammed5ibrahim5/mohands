$serviceRole = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlwa3pybXZkemRjeGNkenZ2YXRsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTU3MjE5MSwiZXhwIjoyMTAxMTQ4MTkxfQ.0HXu_d77OjN3tlmEnfD6JPNocUa3g13MewR5bzmUarU'
$anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlwa3pybXZkemRjeGNkenZ2YXRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1NzIxOTEsImV4cCI6MjEwMTE0ODE5MX0.xTYPy75bkXCtRVnksa4uCxyUvRn0O4K3tIW2vttNgj8'

Write-Host "=== Testing with SERVICE_ROLE key ==="
$tables = @('categories', 'products', 'orders', 'order_items', 'reviews', 'wishlist', 'product_images', 'profiles')
foreach ($t in $tables) {
  try {
    $uri = "https://ipkzrmvdzdcxcdzvvatl.supabase.co/rest/v1/$t?select=id&limit=1"
    $r = Invoke-RestMethod -Uri $uri -Headers @{ apikey = $serviceRole; Authorization = "Bearer $serviceRole" } -Method Get
    Write-Host "$t : EXISTS ($($r.Count) rows)"
  } catch {
    $code = $_.Exception.Response.StatusCode.value__
    Write-Host "$t : MISSING (HTTP $code)"
  }
}

Write-Host ""
Write-Host "=== Testing auth health ==="
try {
  $r = Invoke-RestMethod -Uri "https://ipkzrmvdzdcxcdzvvatl.supabase.co/auth/v1/health" -Method Get
  Write-Host "AUTH HEALTH: $($r | ConvertTo-Json -Compress)"
} catch {
  Write-Host "AUTH HEALTH FAILED: $($_.Exception.Message)"
}

