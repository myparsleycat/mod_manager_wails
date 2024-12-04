// app/app.go
package main

import (
	"context"
	"mod_manager_next/backend"
	"mod_manager_next/backend/fs"
	"mod_manager_next/backend/server"
	"mod_manager_next/backend/watcher"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type App struct {
	ctx     context.Context
	backend *backend.Backend
	watcher *watcher.Watcher
}

func NewApp() *App {
	return &App{
		backend: backend.New(),
	}
}

func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	w, err := watcher.NewWatcher(ctx)
	if err != nil {
		runtime.LogError(ctx, "Failed to initialize watcher: "+err.Error())
		return
	}
	a.watcher = w

	srv := server.New("24312")
	go func() {
		if err := srv.Start(ctx); err != nil {
			runtime.LogError(ctx, "Server error: "+err.Error())
		}
	}()
}

func (a App) domReady(ctx context.Context) {
}

func (a *App) beforeClose(ctx context.Context) (prevent bool) {
	return false
}

func (a *App) shutdown(ctx context.Context) {
	if a.watcher != nil {
		if err := a.watcher.Close(); err != nil {
			runtime.LogError(ctx, "Failed to close watcher: "+err.Error())
		}
	}
}

func (a *App) SelectDirectory() (string, error) {
	options := runtime.OpenDialogOptions{
		Title:            "폴더 선택",
		DefaultDirectory: "",
	}
	return runtime.OpenDirectoryDialog(a.ctx, options)
}

func (a *App) SaveModRootPath(path string) error {
	return a.backend.Config.SaveModRootPath(path)
}

func (a *App) GetModRootPath() (string, error) {
	return a.backend.Config.GetModRootPath()
}

func (a *App) SaveTheme(theme string) error {
	return a.backend.Config.SaveTheme(theme)
}

func (a *App) GetTheme() (string, error) {
	return a.backend.Config.GetTheme()
}

func (a *App) GetModFolders() ([]string, error) {
	return a.backend.FS.GetModFolders()
}

func (a *App) StartWatchingMods() error {
	rootPath, err := a.backend.Config.GetModRootPath()
	if err != nil {
		return err
	}

	return a.watcher.Watch(rootPath, "mods-changed")
}

func (a *App) GetCharMods(path string) ([]fs.ModInfo, error) { return a.backend.FS.GetCharMods(path) }
