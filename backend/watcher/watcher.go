// backend/watcher/watcher.go
package watcher

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
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

func (w *Watcher) WatchOneLevel(path, eventKey string) error {
	w.mu.Lock()
	defer w.mu.Unlock()

	// Watch the parent directory
	if err := w.fsWatcher.Add(path); err != nil {
		return fmt.Errorf("failed to watch path %s: %w", path, err)
	}
	w.paths[path] = eventKey

	// Find and watch all immediate subdirectories
	entries, err := os.ReadDir(path)
	if err != nil {
		w.fsWatcher.Remove(path)
		delete(w.paths, path)
		return fmt.Errorf("failed to read directory %s: %w", path, err)
	}

	for _, entry := range entries {
		if entry.IsDir() {
			subpath := filepath.Join(path, entry.Name())
			if err := w.fsWatcher.Add(subpath); err != nil {
				continue // Skip if we can't watch this subdirectory
			}
			w.paths[subpath] = eventKey
		}
	}

	// Modify watchLoop to handle more events
	go func() {
		for {
			select {
			case event, ok := <-w.fsWatcher.Events:
				if !ok {
					return
				}

				// Get the directory containing the changed file/directory
				dir := filepath.Dir(event.Name)

				w.mu.RLock()
				eventKeyForDir, exists := w.paths[dir]
				w.mu.RUnlock()

				// If this is a directory we're watching
				if exists {
					// Handle creation of new directories
					if event.Has(fsnotify.Create) {
						if info, err := os.Stat(event.Name); err == nil && info.IsDir() {
							w.mu.Lock()
							// Add the new directory to watch list if it's an immediate child
							if filepath.Dir(event.Name) == path {
								if err := w.fsWatcher.Add(event.Name); err == nil {
									w.paths[event.Name] = eventKey
								}
							}
							w.mu.Unlock()
						}
					}

					// Emit events for all relevant file system operations
					if event.Has(fsnotify.Create) ||
						event.Has(fsnotify.Remove) ||
						event.Has(fsnotify.Rename) ||
						event.Has(fsnotify.Write) {
						runtime.EventsEmit(w.ctx, eventKeyForDir, event.Name, event.Op.String())
					}
				}

				// Handle removal of watched directories
				if event.Has(fsnotify.Remove) || event.Has(fsnotify.Rename) {
					w.mu.Lock()
					if _, exists := w.paths[event.Name]; exists {
						w.fsWatcher.Remove(event.Name)
						delete(w.paths, event.Name)
					}
					w.mu.Unlock()
				}

			case err, ok := <-w.fsWatcher.Errors:
				if !ok {
					return
				}
				runtime.EventsEmit(w.ctx, "watcher-error", err.Error())
			}
		}
	}()

	return nil
}
