// backend/server/server.go

package server

import (
	"context"
	"io"
	"net/http"
	"os"
)

type Server struct {
	server *http.Server
	port   string
}

// New creates a new server instance
func New(port string) *Server {
	return &Server{
		port: port,
	}
}

// Start begins the server
func (s *Server) Start(ctx context.Context) error {
	mux := http.NewServeMux()

	mux.HandleFunc("/api/img", s.handleImage)
	mux.HandleFunc("/api/nahida", s.handleNahida)

	s.server = &http.Server{
		Addr:    ":" + s.port,
		Handler: mux,
	}

	// 서버 종료 처리
	go func() {
		<-ctx.Done()
		s.server.Shutdown(context.Background())
	}()

	// 서버 시작
	if err := s.server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		return err
	}

	return nil
}

// handleImage handles image requests
func (s *Server) handleImage(w http.ResponseWriter, r *http.Request) {
	imagePath := r.URL.Query().Get("path")
	if imagePath == "" {
		http.Error(w, "Image path is required", http.StatusBadRequest)
		return
	}

	// 파일 존재 여부 확인
	if _, err := os.Stat(imagePath); os.IsNotExist(err) {
		http.Error(w, "Image not found", http.StatusNotFound)
		return
	}

	// 파일 읽기
	file, err := os.Open(imagePath)
	if err != nil {
		http.Error(w, "Failed to open image", http.StatusInternalServerError)
		return
	}
	defer file.Close()

	// 이미지 타입 감지
	buffer := make([]byte, 512)
	_, err = file.Read(buffer)
	if err != nil {
		http.Error(w, "Failed to read image", http.StatusInternalServerError)
		return
	}
	contentType := http.DetectContentType(buffer)

	// 파일 포인터를 다시 처음으로
	file.Seek(0, 0)

	// 응답 헤더 설정
	w.Header().Set("Content-Type", contentType)

	// 이미지 데이터 전송
	io.Copy(w, file)
}

func (s *Server) handleNahida(w http.ResponseWriter, r *http.Request) {

}
