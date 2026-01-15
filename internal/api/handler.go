// Package api handles the routing of the api endpoints and serves the static assets
package api

import "net/http"

// Handle serves the static assets and htmls
func Handle(mux *http.ServeMux) {
	mux.Handle("/static/",
		http.StripPrefix("/static/",
			http.FileServer(http.Dir("web/static")),
		),
	)

	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "web/templates/index.html")
	})

	mux.HandleFunc("/game", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "web/templates/game.html")
	})

	mux.HandleFunc("/victory", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "web/templates/victory.html")
	})

	mux.HandleFunc("/game-over", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "web/templates/game_over.html")
	})
}
