// backend/fs/fs.go
package fs

import (
	"fmt"
	"mod_manager_next/backend/config"
	"os"
)

func GetModFolders() ([]string, error) {
	rootPath, err := config.GetModRootPath()
	if err != nil {
		return nil, fmt.Errorf("failed to get mod root path: %w", err)
	}

	if rootPath == "" {
		return nil, fmt.Errorf("mod root path is not set")
	}

	entries, err := os.ReadDir(rootPath)
	if err != nil {
		return nil, fmt.Errorf("failed to read directory: %w", err)
	}

	var folders []string
	for _, entry := range entries {
		if entry.IsDir() {
			folders = append(folders, entry.Name())
		}
	}

	return folders, nil
}
