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

	log.Println("Server Running on http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", mux))
}
