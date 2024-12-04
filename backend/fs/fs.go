// backend/fs/fs.go
package fs

import (
	"errors"
	"fmt"
	"io/fs"
	"mod_manager_next/backend/config"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
	"sync"
)

type DirectoryManager struct {
	locks sync.Map
}

var defaultManager = &DirectoryManager{}

func (dm *DirectoryManager) getLock(path string) *sync.RWMutex {
	dirPath := filepath.Dir(path)
	actual, _ := dm.locks.LoadOrStore(dirPath, &sync.RWMutex{})
	return actual.(*sync.RWMutex)
}

// LockDirectory 디렉토리에 대한 쓰기 잠금을 획득
func (dm *DirectoryManager) LockDirectory(path string) func() {
	dm.getLock(path).Lock()
	return func() { dm.getLock(path).Unlock() }
}

// RLockDirectory 디렉토리에 대한 읽기 잠금을 획득
func (dm *DirectoryManager) RLockDirectory(path string) func() {
	dm.getLock(path).RLock()
	return func() { dm.getLock(path).RUnlock() }
}

// LockForRead 파일 읽기를 위한 잠금 획득 (exported function)
func LockForRead(path string) func() {
	return defaultManager.RLockDirectory(path)
}

type ModFolder struct {
	Name string
	Path string
}

func GetModFolders() ([]ModFolder, error) {
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

	var folders []ModFolder
	for _, entry := range entries {
		if entry.IsDir() {
			folders = append(folders, ModFolder{
				Name: entry.Name(),
				Path: filepath.Join(rootPath, entry.Name()),
			})
		}
	}

	return folders, nil
}

type PreviewImage struct {
	Name string
	Path string
}

type ModInfo struct {
	Name    string
	Path    string
	Preview PreviewImage
}

func findPreviewImage(dirPath string) (PreviewImage, error) {
	var preview PreviewImage
	err := filepath.WalkDir(dirPath, func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}

		if !d.IsDir() {
			name := strings.ToLower(d.Name())
			ext := filepath.Ext(name)

			if strings.HasPrefix(name, "preview") && isSupportedImageExt(ext) {
				// 전체 경로를 사용
				preview = PreviewImage{
					Name: d.Name(),
					Path: path, // 여기가 변경된 부분입니다
				}
				return &fs.PathError{Op: "found", Err: nil}
			}
		}
		return nil
	})

	var perr *fs.PathError
	if errors.As(err, &perr) && perr.Op == "found" {
		return preview, nil
	}
	if err != nil {
		return preview, err
	}
	return preview, nil
}

func isSupportedImageExt(ext string) bool {
	supportedExts := map[string]bool{
		".jpg":  true,
		".jpeg": true,
		".png":  true,
		".webp": true,
		".avif": true,
		".gif":  true,
	}
	return supportedExts[strings.ToLower(ext)]
}

func GetCharMods(path string) ([]ModInfo, error) {
	entries, err := os.ReadDir(path)
	if err != nil {
		return []ModInfo{}, fmt.Errorf("failed to read directory: %w", err)
	}

	var mods []ModInfo
	for _, entry := range entries {
		if entry.IsDir() {
			modPath := filepath.Join(path, entry.Name())
			preview, _ := findPreviewImage(modPath)

			mod := ModInfo{
				Name:    entry.Name(),
				Path:    modPath,
				Preview: preview,
			}
			mods = append(mods, mod)
		}
	}

	return mods, nil
}

// var (
// 	kernel32  = syscall.NewLazyDLL("kernel32.dll")
// 	moveFileW = kernel32.NewProc("MoveFileW")
// )

// func utf16PtrFromString(s string) *uint16 {
// 	p, _ := syscall.UTF16PtrFromString(s)
// 	return p
// }

// func SwitchModStatus(path string) error {
// 	// 디렉토리 존재 확인
// 	if _, err := os.Stat(path); os.IsNotExist(err) {
// 		return fmt.Errorf("directory does not exist: %s", path)
// 	}

// 	dir := filepath.Base(path)
// 	parentDir := filepath.Dir(path)

// 	const prefix = "disabled "
// 	hasPrefix := strings.HasPrefix(strings.ToLower(dir), strings.ToLower(prefix))

// 	var newPath string
// 	if hasPrefix {
// 		idx := len(prefix)
// 		newPath = filepath.Join(parentDir, dir[idx:])
// 	} else {
// 		newPath = filepath.Join(parentDir, "DISABLED "+dir)
// 	}

// 	// Windows API를 직접 호출
// 	lpExistingFileName := utf16PtrFromString(path)
// 	lpNewFileName := utf16PtrFromString(newPath)

// 	ret, _, err := moveFileW.Call(
// 		uintptr(unsafe.Pointer(lpExistingFileName)),
// 		uintptr(unsafe.Pointer(lpNewFileName)),
// 	)

// 	if ret == 0 {
// 		return fmt.Errorf("failed to rename directory using Windows API: %v", err)
// 	}

// 	return nil
// }

func SwitchModStatus(path string) error {
	// 디렉토리가 존재하는지 확인
	if _, err := os.Stat(path); os.IsNotExist(err) {
		return fmt.Errorf("directory does not exist: %s", path)
	}

	// 마지막 디렉토리 이름 추출
	dir := filepath.Base(path)
	parentDir := filepath.Dir(path)

	// 대소문자 구분없이 "disabled " 접두어 확인
	const prefix = "disabled "
	hasPrefix := strings.HasPrefix(strings.ToLower(dir), strings.ToLower(prefix))

	var newPath string
	if hasPrefix {
		// "disabled " 제거 (원래 대소문자 상관없이)
		idx := len(prefix)
		newPath = filepath.Join(parentDir, dir[idx:])
	} else {
		// "DISABLED " 추가
		newPath = filepath.Join(parentDir, "DISABLED "+dir)
	}

	// 디렉토리 이름 변경
	err := os.Rename(path, newPath)
	if err != nil {
		return fmt.Errorf("failed to rename directory: %w", err)
	}

	return nil
}

// func SwitchModStatus(path string) error {
// 	unlock := defaultManager.LockDirectory(path)
// 	defer unlock()

// 	if _, err := os.Stat(path); os.IsNotExist(err) {
// 		return fmt.Errorf("directory does not exist: %s", path)
// 	}

// 	dir := filepath.Base(path)
// 	parentDir := filepath.Dir(path)

// 	const prefix = "disabled "
// 	hasPrefix := strings.HasPrefix(strings.ToLower(dir), strings.ToLower(prefix))

// 	var newPath string
// 	if hasPrefix {
// 		idx := len(prefix)
// 		newPath = filepath.Join(parentDir, dir[idx:])
// 	} else {
// 		newPath = filepath.Join(parentDir, "DISABLED "+dir)
// 	}

// 	return os.Rename(path, newPath)
// }

func OpenFolder(path string) error {
	var cmd *exec.Cmd

	switch runtime.GOOS {
	case "windows":
		cmd = exec.Command("explorer", "/root,", path)
	case "darwin":
		cmd = exec.Command("open", path)
	default:
		return fmt.Errorf("unsupported operating system: %s", runtime.GOOS)
	}

	err := cmd.Start()
	if err != nil {
		return fmt.Errorf("failed to open folder: %v", err)
	}

	return nil
}

func DeleteFolder(path string) error {
	err := os.RemoveAll(path)
	if err != nil {
		return fmt.Errorf("폴더 삭제 중 오류 발생: %v", err)
	}
	return nil
}
