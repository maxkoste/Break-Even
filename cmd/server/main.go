package main

import (
	"log"
	"net/http"
)

func main() {
	mux := http.NewServeMux()

	mux.HandleFunc("/api/ping", func(writer http.ResponseWriter, request *http.Request) {
		writer.Header().Set("Content-Type", "application/json")
		writer.Write([]byte(`{"status":"ok"}`))
	})

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
