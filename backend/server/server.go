// backend/server/server.go
package server

import (
	"context"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/compress"
)

type Server struct {
	app  *fiber.App
	port string
}

func New(port string) *Server {
	app := fiber.New(fiber.Config{
		// 큰 파일 처리를 위한 설정
		StreamRequestBody: true,
		BodyLimit:         100 * 1024 * 1024, // 100MB
	})

	// GZIP 압축 활성화
	app.Use(compress.New(compress.Config{
		Level: compress.LevelBestSpeed,
	}))

	return &Server{
		app:  app,
		port: port,
	}
}

func (s *Server) Start(ctx context.Context) error {
	s.setupRoutes()

	// 컨텍스트 취소시 서버 종료
	go func() {
		<-ctx.Done()
		s.app.Shutdown()
	}()

	return s.app.Listen(":" + s.port)
}

func (s *Server) setupRoutes() {
	s.app.Get("/api/img", s.handleImage)
	s.app.Get("/api/nahida", s.handleNahida)
}

func (s *Server) handleImage(c *fiber.Ctx) error {
	imagePath := c.Query("path")
	if imagePath == "" {
		return c.Status(fiber.StatusBadRequest).SendString("Image path is required")
	}

	// 파일을 메모리에 읽어들임
	data, err := os.ReadFile(imagePath)
	if err != nil {
		return c.Status(fiber.StatusNotFound).SendString("Image not found")
	}

	// 메모리에서 직접 전송
	return c.Send(data)
}

// func (s *Server) handleImage(c *fiber.Ctx) error {
// 	imagePath := c.Query("path")
// 	if imagePath == "" {
// 		return c.Status(fiber.StatusBadRequest).SendString("Image path is required")
// 	}

// 	// 읽기 잠금 획득
// 	unlock := fs.LockForRead(imagePath)
// 	defer unlock()

// 	// 파일 존재 확인
// 	if _, err := os.Stat(imagePath); os.IsNotExist(err) {
// 		return c.Status(fiber.StatusNotFound).SendString("Image not found")
// 	}

// 	return c.SendFile(imagePath, true)
// }

func (s *Server) handleNahida(c *fiber.Ctx) error {
	return nil
}
