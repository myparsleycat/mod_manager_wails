// backend/watcher/watcher.go
package watcher

import (
	"context"
	"fmt"
	"sync"

	"github.com/fsnotify/fsnotify"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type Watcher struct {
	ctx       context.Context
	fsWatcher *fsnotify.Watcher
	paths     map[string]string // maps paths to their event keys
	mu        sync.RWMutex
}

func NewWatcher(ctx context.Context) (*Watcher, error) {
	fsWatcher, err := fsnotify.NewWatcher()
	if err != nil {
		return nil, fmt.Errorf("failed to create watcher: %w", err)
	}

	w := &Watcher{
		ctx:       ctx,
		fsWatcher: fsWatcher,
		paths:     make(map[string]string),
	}

	go w.watchLoop()

	return w, nil
}

func (w *Watcher) watchLoop() {
	for {
		select {
		case event, ok := <-w.fsWatcher.Events:
			if !ok {
				return
			}
			if event.Has(fsnotify.Create) || event.Has(fsnotify.Remove) || event.Has(fsnotify.Rename) {
				w.mu.RLock()
				if eventKey, exists := w.paths[event.Name]; exists {
					runtime.EventsEmit(w.ctx, eventKey)
				}
				w.mu.RUnlock()
			}
		case err, ok := <-w.fsWatcher.Errors:
			if !ok {
				return
			}
			runtime.EventsEmit(w.ctx, "watcher-error", err.Error())
		}
	}
}

func (w *Watcher) Watch(path, eventKey string) error {
	w.mu.Lock()
	defer w.mu.Unlock()

	if err := w.fsWatcher.Add(path); err != nil {
		return fmt.Errorf("failed to watch path %s: %w", path, err)
	}

	w.paths[path] = eventKey
	return nil
}

func (w *Watcher) Unwatch(path string) error {
	w.mu.Lock()
	defer w.mu.Unlock()

	if err := w.fsWatcher.Remove(path); err != nil {
		return fmt.Errorf("failed to unwatch path %s: %w", path, err)
	}

	delete(w.paths, path)
	return nil
}

func (w *Watcher) Close() error {
	w.mu.Lock()
	defer w.mu.Unlock()

	return w.fsWatcher.Close()
}
