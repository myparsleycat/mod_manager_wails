package main

import (
	"embed"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/logger"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/options/windows"
)

//go:embed all:frontend/dist
var assets embed.FS

// //go:embed build/appicon.png
// var icon []byte

type FileLoader struct {
	http.Handler
}

func NewFileLoader() *FileLoader {
	return &FileLoader{}
}

func (h *FileLoader) ServeHTTP(res http.ResponseWriter, req *http.Request) {
	var err error
	requestedFilename := strings.TrimPrefix(req.URL.Path, "/")
	println("Requesting file:", requestedFilename)
	fileData, err := os.ReadFile(requestedFilename)
	if err != nil {
		res.WriteHeader(http.StatusBadRequest)
		res.Write([]byte(fmt.Sprintf("Could not load file %s", requestedFilename)))
	}

	res.Write(fileData)
}

func main() {
	// Create an instance of the app structure
	app := NewApp()

	modRoot, _ := app.GetModRootPath()

	// Create application with options
	err := wails.Run(&options.App{
		Title:  "mod_manager_next",
		Width:  1024,
		Height: 768,
		// MinWidth:          1024,
		// MinHeight:         768,
		//MaxWidth:          1280,
		//MaxHeight:         800,
		DisableResize:     false,
		Fullscreen:        false,
		Frameless:         false,
		StartHidden:       false,
		HideWindowOnClose: false,
		BackgroundColour:  &options.RGBA{R: 0, G: 0, B: 0, A: 255},
		AssetServer: &assetserver.Options{
			Assets: assets,
			//Handler: NewFileLoader(),
			Handler: http.FileServer(http.Dir(modRoot)),
		},
		Menu:             nil,
		Logger:           nil,
		LogLevel:         logger.DEBUG,
		OnStartup:        app.startup,
		OnDomReady:       app.domReady,
		OnBeforeClose:    app.beforeClose,
		OnShutdown:       app.shutdown,
		WindowStartState: options.Normal,
		Bind: []interface{}{
			app,
		},
		// Windows platform specific options
		Windows: &windows.Options{
			WebviewIsTransparent: false,
			WindowIsTranslucent:  false,
			DisableWindowIcon:    false,
			// DisableFramelessWindowDecorations: false,
			WebviewUserDataPath: "",
			ZoomFactor:          1.0,
		},
		// Mac platform specific options
		// Mac: &mac.Options{
		// 	TitleBar: &mac.TitleBar{
		// 		TitlebarAppearsTransparent: true,
		// 		HideTitle:                  false,
		// 		HideTitleBar:               false,
		// 		FullSizeContent:            false,
		// 		UseToolbar:                 false,
		// 		HideToolbarSeparator:       true,
		// 	},
		// 	Appearance:           mac.NSAppearanceNameDarkAqua,
		// 	WebviewIsTransparent: true,
		// 	WindowIsTranslucent:  true,
		// 	About: &mac.AboutInfo{
		// 		Title:   "mod_manager_next",
		// 		Message: "",
		// 		Icon:    icon,
		// 	},
		// },
	})

	if err != nil {
		log.Fatal(err)
	}
}
