// backend/backend.go
package backend

import (
	"mod_manager_next/backend/config"
	"mod_manager_next/backend/fs"
)

type Backend struct {
	Config *ConfigManager
	FS     *FSManager
}

type ConfigManager struct{}
type FSManager struct{}

func New() *Backend {
	return &Backend{
		Config: &ConfigManager{},
		FS:     &FSManager{},
	}
}

func (cm *ConfigManager) SaveModRootPath(path string) error {
	return config.SaveModRootPath(path)
}

func (cm *ConfigManager) GetModRootPath() (string, error) {
	return config.GetModRootPath()
}

func (cm *ConfigManager) SaveTheme(theme string) error {
	return config.SaveTheme(theme)
}

func (cm *ConfigManager) GetTheme() (string, error) {
	return config.GetTheme()
}

func (fm *FSManager) GetModFolders() ([]string, error) {
	return fs.GetModFolders()
}

func (fm *FSManager) GetCharMods(path string) ([]fs.ModInfo, error) { return fs.GetCharMods(path) }

func (fm *FSManager) SwitchModStatus(path string) error { return fs.SwitchModStatus(path) }
