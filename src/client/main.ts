// Example client-side TypeScript code
import './styles.css';

interface ApiResponse {
  message: string;
}

interface StreamChunk {
  type: 'progress' | 'conclusion'; // consider adding 'initial' and replacing 'progress' with 'details-update' and 'menu-update'
  progress?: number;
  conclusion?: string;
  // add more fields here as needed for different chunk types
}

const testBtn = document.getElementById('testBtn') as HTMLButtonElement;
const resultDiv = document.getElementById('result') as HTMLDivElement;
const streamBtn = document.getElementById('streamBtn') as HTMLButtonElement;
const statusText = document.getElementById('statusText') as HTMLSpanElement;
const progressText = document.getElementById('progressText') as HTMLSpanElement;
const conclusionText = document.getElementById('conclusionText') as HTMLSpanElement;

testBtn?.addEventListener('click', async () => {
  try {
    const response = await fetch('/api/hello');
    const data: ApiResponse = await response.json();
    resultDiv.textContent = `API Response: ${data.message}`;
  } catch (error) {
    resultDiv.textContent = 'Error calling API';
    console.error('Error:', error);
  }
});

streamBtn?.addEventListener('click', async () => {
  statusText.textContent = 'Streaming...';
  progressText.textContent = '-';
  conclusionText.textContent = '-';
  streamBtn.disabled = true;

  try {
    const response = await fetch('/api/stream');
    if (!response.body) {
      throw new Error('Response body is null');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      // Decode the chunk and add to buffer
      buffer += decoder.decode(value, { stream: true });

      // Split by newlines and process complete JSON objects
      const lines = buffer.split('\n');
      buffer = lines[lines.length - 1]; // Keep incomplete line in buffer

      for (let i = 0; i < lines.length - 1; i++) {
        const line = lines[i].trim();
        if (line) {
          try {
            const chunk: StreamChunk = JSON.parse(line);
            chunkProcessor(chunk);
          } catch (parseError) {
            console.error('Failed to parse chunk:', line, parseError);
          }
        }
      }
    }

    statusText.textContent = 'Completed';
    streamBtn.disabled = false;
  } catch (error) {
    statusText.textContent = 'Error';
    console.error('Streaming error:', error);
    streamBtn.disabled = false;
  }
});

function chunkProcessor(chunk: StreamChunk) {
  if (chunk.type === 'progress' && chunk.progress !== undefined) {
    progressText.textContent = `${chunk.progress} updates received`;
  } else if (chunk.type === 'conclusion' && chunk.conclusion) {
    conclusionText.textContent = chunk.conclusion;
  }
}

console.log('Client-side TypeScript loaded successfully!');
