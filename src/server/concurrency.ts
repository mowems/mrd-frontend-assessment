type Task<T> = () => Promise<T>;

export async function runWithConcurrency<T>(
  tasks: Task<T>[],
  concurrencyLimit: number,
  onTaskComplete?: (result: T) => void,
  onTaskError?: (error: unknown, index: number) => void,
): Promise<void> {
  let nextTaskIndex = 0;

  async function worker() {
    while (nextTaskIndex < tasks.length) {
      const currentIndex = nextTaskIndex++;
      const task = tasks[currentIndex];

      try {
        const result = await task();

        if (onTaskComplete) {
          onTaskComplete(result);
        }
      } catch (error) {
        if (onTaskError) {
          onTaskError(error, currentIndex);
        }
      }
    }
  }

  const workers = Array.from(
    { length: concurrencyLimit },
    () => worker(),
  );

  await Promise.all(workers);
}