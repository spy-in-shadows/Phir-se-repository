import threading
import queue
import random
import time

class Worker(threading.Thread):
    def __init__(self, task_queue, result_queue):
        super().__init__()
        self.task_queue = task_queue
        self.result_queue = result_queue

    def run(self):
        while True:
            try:
                task = self.task_queue.get(timeout=1)
            except queue.Empty:
                break
            result = self.process(task)
            self.result_queue.put((self.name, task, result))
            self.task_queue.task_done()

    def process(self, task):
        time.sleep(random.uniform(0.1, 0.5))
        return sum(x ** 2 for x in task)

def generate_tasks(num_tasks, task_size):
    return [random.sample(range(1, 100), task_size) for _ in range(num_tasks)]

def main():
    num_workers = 5
    num_tasks = 20
    task_size = 10

    tasks = generate_tasks(num_tasks, task_size)
    task_queue = queue.Queue()
    result_queue = queue.Queue()

    for task in tasks:
        task_queue.put(task)

    workers = [Worker(task_queue, result_queue) for _ in range(num_workers)]
    for worker in workers:
        worker.start()

    task_queue.join()

    results = []
    while not result_queue.empty():
        results.append(result_queue.get())

    for worker in workers:
        worker.join()

    for worker_name, task, result in results:
        print(f"{worker_name} processed {task} -> {result}")

if __name__ == "__main__":
    main()