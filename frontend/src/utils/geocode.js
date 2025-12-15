/* ZIP-based fallback (identical logic) */
export function getApproximateCoordinates(address) {
  const zipMatch = address.match(/\b\d{5}\b/);

  if (!zipMatch) {
    return { lat: 37.9513, lng: -91.7713 }; // Rolla default
  }

  const zip = parseInt(zipMatch[0], 10);

  if (zip >= 63000 && zip <= 63999) {
    return { lat: 38.6270, lng: -90.1994 }; // St. Louis
  }
  if (zip >= 64000 && zip <= 64999) {
    return { lat: 39.0997, lng: -94.5786 }; // Kansas City
  }
  if (zip >= 65000 && zip <= 65899) {
    return { lat: 37.2090, lng: -93.2923 }; // Springfield
  }

  return { lat: 37.9513, lng: -91.7713 };
}

/* Nominatim geocoder with fallback */
export async function geocodeAddress(address) {
  try {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const url =
      `https://nominatim.openstreetmap.org/search` +
      `?format=json&q=${encodeURIComponent(address)}` +
      `&countrycodes=us&limit=1`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'GroupUp-ClubApp/1.0 (educational-project)',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      return getApproximateCoordinates(address);
    }

    const data = await response.json();

    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
    }

    return getApproximateCoordinates(address);
  } catch (err) {
    return getApproximateCoordinates(address);
  }
}
