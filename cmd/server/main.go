package main

import (
	"log"
	"net/http"

	"github.com/maxkoste/Break-Even/internal/api"
)

func main() {
	mux := http.NewServeMux()
	
	api.Register(mux)

	mux.Handle("/static/",
		http.StripPrefix("/static/",
			http.FileServer(http.Dir("web/static")),
		),
	)

	mux.HandleFunc("/", func (w http.ResponseWriter, r *http.Request)  {
		http.ServeFile(w,r, "web/templates/index.html")
	})

	mux.HandleFunc("/game", func (w http.ResponseWriter, r *http.Request)  {
		http.ServeFile(w,r, "web/templates/game.html")
	})

	mux.HandleFunc("/victory", func (w http.ResponseWriter, r *http.Request)  {
		http.ServeFile(w,r, "web/templates/victory.html")
	})

	mux.HandleFunc("/game-over", func (w http.ResponseWriter, r *http.Request)  {
		http.ServeFile(w,r, "web/templates/game_over.html")
	})

	log.Println("Server Running on http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", mux))
}
