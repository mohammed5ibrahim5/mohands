try {
  $headers = @{
    apikey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlwa3pybXZkemRjeGNkenZ2YXRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1NzIxOTEsImV4cCI6MjEwMTE0ODE5MX0.xTYPy75bkXCtRVnksa4uCxyUvRn0O4K3tIW2vttNgj8'
    Authorization = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlwa3pybXZkemRjeGNkenZ2YXRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1NzIxOTEsImV4cCI6MjEwMTE0ODE5MX0.xTYPy75bkXCtRVnksa4uCxyUvRn0O4K3tIW2vttNgj8'
  }
  $r = Invoke-RestMethod -Uri 'https://ipkzrmvdzdcxcdzvvatl.supabase.co/rest/v1/products?select=id' -Headers $headers -Method Get
  Write-Host "SUCCESS Products Count: $($r.Count)"
} catch {
  Write-Host "ERROR: $($_.Exception.Message)"
  if ($_.ErrorDetails) { Write-Host "DETAILS: $($_.ErrorDetails.Message)" }
}

