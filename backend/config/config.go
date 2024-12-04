// backend/config/config.go
package config

import (
	"encoding/json"
	"os"
	"path/filepath"
)

type Settings struct {
	ModRootPath    string `json:"modRootPath"`
	Theme          string `json:"theme"`
	Language       string `json:"language"`
	ShowFolderIcon bool   `json:"showFolderIcon"`
}

func getSettingsPath() string {
	return filepath.Join(".", "conf.json")
}

func Load() (Settings, error) {
	var settings Settings
	settingsPath := getSettingsPath()

	data, err := os.ReadFile(settingsPath)
	if err != nil {
		if os.IsNotExist(err) {
			return Settings{}, nil
		}
		return settings, err
	}

	err = json.Unmarshal(data, &settings)
	return settings, err
}

func Save(settings Settings) error {
	settingsPath := getSettingsPath()

	err := os.MkdirAll(filepath.Dir(settingsPath), 0755)
	if err != nil {
		return err
	}

	data, err := json.MarshalIndent(settings, "", "    ")
	if err != nil {
		return err
	}

	return os.WriteFile(settingsPath, data, 0644)
}

func SaveTheme(theme string) error {
	settings, err := Load()
	if err != nil {
		settings = Settings{}
	}
	settings.Theme = theme
	return Save(settings)
}

func GetTheme() (string, error) {
	settings, err := Load()
	if err != nil {
		return "", err
	}
	return settings.Theme, nil
}

func SaveModRootPath(path string) error {
	settings, err := Load()
	if err != nil {
		settings = Settings{}
	}
	settings.ModRootPath = path
	return Save(settings)
}

func GetModRootPath() (string, error) {
	settings, err := Load()
	if err != nil {
		return "", err
	}
	return settings.ModRootPath, nil
}

func SaveShowFolderIcon(show bool) error {
	settings, err := Load()
	if err != nil {
		settings = Settings{}
	}
	settings.ShowFolderIcon = show
	return Save(settings)
}

func GetShowFolderIcon() (bool, error) {
	settings, err := Load()
	if err != nil {
		return false, err
	}
	return settings.ShowFolderIcon, nil
}
