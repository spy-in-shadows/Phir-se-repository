class EventEmitter {
    constructor() {
        this.events = {};
    }
    on(event, listener) {
        if (!this.events[event]) this.events[event] = [];
        this.events[event].push(listener);
    }
    off(event, listener) {
        if (!this.events[event]) return;
        this.events[event] = this.events[event].filter(l => l !== listener);
    }
    emit(event, ...args) {
        if (!this.events[event]) return;
        for (const listener of this.events[event]) {
            listener(...args);
        }
    }
}

class TaskQueue {
    constructor(concurrency = 2) {
        this.queue = [];
        this.running = 0;
        this.concurrency = concurrency;
        this.emitter = new EventEmitter();
    }
    add(task) {
        this.queue.push(task);
        this.next();
    }
    next() {
        while (this.running < this.concurrency && this.queue.length) {
            const task = this.queue.shift();
            this.running++;
            Promise.resolve(task())
                .then(result => {
                    this.emitter.emit('success', result);
                })
                .catch(err => {
                    this.emitter.emit('error', err);
                })
                .finally(() => {
                    this.running--;
                    this.next();
                });
        }
    }
    onSuccess(listener) {
        this.emitter.on('success', listener);
    }
    onError(listener) {
        this.emitter.on('error', listener);
    }
}

// Example usage:
const queue = new TaskQueue(3);

queue.onSuccess(result => console.log('Task success:', result));
queue.onError(err => console.error('Task error:', err));

for (let i = 1; i <= 10; i++) {
    queue.add(() => new Promise((resolve, reject) => {
        setTimeout(() => {
            if (Math.random() > 0.2) resolve(`Task ${i} done`);
            else reject(`Task ${i} failed`);
        }, Math.random() * 1000);
    }));
}