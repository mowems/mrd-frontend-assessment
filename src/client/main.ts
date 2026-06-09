import './styles.css';

interface BaseRestaurant {
  id: number;
  name: string;
  suburb: string;
  vertical: 'restaurant' | 'store';
}

interface RestaurantDetails {
  id: number;
  name: string;
  vertical: 'restaurant' | 'store';
  description: string;
  address: {
    suburb: string;
    town: string;
    province: string;
  };
  images?: {
    restaurant_logo?: {
      base_url: string;
      filename: string;
    };
  };
}

type StreamChunk =
  | {
      type: 'initial';
      restaurants: BaseRestaurant[];
      total: number;
    }
  | {
      type: 'details-update';
      restaurant: RestaurantDetails;
    }
  | {
      type: 'restaurant-error';
      id: number;
      error: string;
    }
  | {
      type: 'progress';
      completed: number;
      total: number;
    }
  | {
      type: 'conclusion';
      conclusion: string;
    };

const streamBtn = document.getElementById('streamBtn') as HTMLButtonElement;
const statusText = document.getElementById('statusText') as HTMLSpanElement;
const progressText = document.getElementById('progressText') as HTMLSpanElement;
const conclusionText = document.getElementById('conclusionText') as HTMLSpanElement;
const tableBody = document.querySelector('tbody') as HTMLTableSectionElement;

streamBtn?.addEventListener('click', async () => {
  resetUi();

  statusText.textContent = 'Loading restaurants...';
  streamBtn.disabled = true;

  try {
    const response = await fetch('/api/restaurants/stream');

    if (!response.ok) {
      throw new Error(`Stream failed with status ${response.status}`);
    }

    if (!response.body) {
      throw new Error('Response body is null');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split('\n');
      buffer = lines[lines.length - 1];

      for (let i = 0; i < lines.length - 1; i++) {
        const line = lines[i].trim();

        if (!line) continue;

        try {
          const chunk = JSON.parse(line) as StreamChunk;
          processChunk(chunk);
        } catch (error) {
          console.error('Failed to parse stream chunk:', line, error);
        }
      }
    }

    statusText.textContent = 'Completed';
  } catch (error) {
    statusText.textContent = 'Error';
    conclusionText.textContent =
      error instanceof Error ? error.message : 'Unknown streaming error';
    console.error('Streaming error:', error);
  } finally {
    streamBtn.disabled = false;
  }
});

function processChunk(chunk: StreamChunk) {
  switch (chunk.type) {
    case 'initial':
      renderInitialRestaurants(chunk.restaurants);
      progressText.textContent = `0 / ${chunk.total} loaded`;
      conclusionText.textContent = '-';
      break;

    case 'details-update':
      updateRestaurantRow(chunk.restaurant);
      break;

    case 'restaurant-error':
      markRestaurantError(chunk.id, chunk.error);
      break;

    case 'progress':
      progressText.textContent = `${chunk.completed} / ${chunk.total} loaded`;
      break;

    case 'conclusion':
      conclusionText.textContent = chunk.conclusion;
      break;
  }
}

function renderInitialRestaurants(restaurants: BaseRestaurant[]) {
  const rows = restaurants.map((restaurant) => {
    return `
      <tr id="restaurant-${restaurant.id}">
        <td>
          <strong>${escapeHtml(restaurant.name)}</strong>
          <div class="muted">${escapeHtml(restaurant.vertical)}</div>
        </td>

        <td>${escapeHtml(restaurant.suburb)}</td>

        <td class="logo-cell">
          <span class="muted">Loading...</span>
        </td>

        <td class="status-cell">
          <span class="status loading">Loading</span>
          <div class="muted">Fetching details...</div>
        </td>
      </tr>
    `;
  });

  tableBody.innerHTML = rows.join('');
}

function updateRestaurantRow(restaurant: RestaurantDetails) {
  const row = document.getElementById(`restaurant-${restaurant.id}`);

  if (!row) return;

  const locationCell = row.children[1];
  const logoCell = row.children[2];
  const statusCell = row.children[3];

  locationCell.textContent = [
    restaurant.address?.suburb,
    restaurant.address?.town,
    restaurant.address?.province,
  ]
    .filter(Boolean)
    .join(', ');

  logoCell.innerHTML = renderLogo(restaurant);
  statusCell.innerHTML = `
    <span class="status success">Loaded</span>
    <div class="muted">${escapeHtml(restaurant.description || 'No description available')}</div>
  `;
}

function markRestaurantError(id: number, error: string) {
  const row = document.getElementById(`restaurant-${id}`);

  if (!row) return;

  const logoCell = row.children[2];
  const statusCell = row.children[3];

  logoCell.innerHTML = `
    <span class="muted">Unavailable</span>
  `;

  statusCell.innerHTML = `
    <span class="status error">Failed</span>
    <div class="muted">${escapeHtml(error)}</div>
  `;
}

function renderLogo(restaurant: RestaurantDetails): string {
  const logo = restaurant.images?.restaurant_logo;

  if (!logo?.base_url || !logo?.filename) {
    return '<span class="muted">No logo</span>';
  }

  const src = `${logo.base_url}${logo.filename}`;

  return `<img class="restaurant-logo" src="${escapeAttribute(src)}" alt="${escapeAttribute(restaurant.name)} logo" />`;
}

function resetUi() {
  tableBody.innerHTML = '';
  statusText.textContent = 'Ready';
  progressText.textContent = '-';
  conclusionText.textContent = '-';

  tableBody.innerHTML = '';
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };

    return entities[character];
  });
}

function escapeAttribute(value: string): string {
  return escapeHtml(value);
}

console.log('Restaurant loader client loaded successfully!');