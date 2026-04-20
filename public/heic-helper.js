// HEIC conversion helper — uses server-side endpoint
// Include this script on any page that needs HEIC support

async function convertHeicToJpeg(file) {
  // Read file as base64
  var base64 = await new Promise(function(resolve, reject) {
    var reader = new FileReader();
    reader.onload = function() { resolve(reader.result.split(',')[1]); };
    reader.onerror = function() { reject(new Error('Failed to read file')); };
    reader.readAsDataURL(file);
  });

  // Send to server for conversion
  var res = await fetch('/api/convert-heic', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ base64: base64 }),
  });

  if (!res.ok) {
    var err = await res.json().catch(function() { return {}; });
    throw new Error(err.error || 'HEIC conversion failed');
  }

  var data = await res.json();
  if (!data.ok) throw new Error(data.error || 'Conversion failed');

  // Return as a File object
  var byteString = atob(data.base64);
  var ab = new ArrayBuffer(byteString.length);
  var ia = new Uint8Array(ab);
  for (var i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
  var blob = new Blob([ab], { type: 'image/jpeg' });
  return new File([blob], file.name.replace(/\.heic$/i, '.jpg').replace(/\.heif$/i, '.jpg'), { type: 'image/jpeg' });
}

// Check if a file is HEIC
function isHeicFile(file) {
  var ext = file.name.split('.').pop().toLowerCase();
  var type = (file.type || '').toLowerCase();
  return type === 'image/heic' || type === 'image/heif' || ext === 'heic' || ext === 'heif';
}

if (typeof window !== 'undefined') {
  window.convertHeicToJpeg = convertHeicToJpeg;
  window.isHeicFile = isHeicFile;
}
