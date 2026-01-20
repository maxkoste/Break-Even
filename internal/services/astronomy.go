// Package services does services for human kind
package services

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"
)

type CelestialData struct {
	Bodies map[string]string
	MoonPhase string
}

func FetchCelestialData() (*CelestialData, error) {
    appID := os.Getenv("ASTRONOMY_APP_ID")
    appSecret := os.Getenv("ASTRONOMY_APP_SECRET")

    if appID == "" || appSecret == "" {
        return nil, fmt.Errorf("ASTRONOMY_APP_ID or ASTRONOMY_APP_SECRET not set")
    }

	authStr := base64.StdEncoding.EncodeToString([]byte(fmt.Sprintf("%s:%s", appID, appSecret)))
    url := "https://api.astronomyapi.com/api/v2/bodies/positions"

    today := time.Now().Format("2006-01-02")
    currentTime := time.Now().Format("15:04:05")

    req, err := http.NewRequest("GET", url, nil)
    if err != nil {
        return nil, err
    }

    q := req.URL.Query()
    q.Add("latitude", "55.6050")
    q.Add("longitude", "13.0038")
    q.Add("elevation", "12")
    q.Add("from_date", today)
    q.Add("to_date", today)
    q.Add("time", currentTime)
    req.URL.RawQuery = q.Encode()

    req.Header.Set("Authorization", "Basic "+authStr)

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()

    body, _ := io.ReadAll(resp.Body)

    var jsonResp map[string]any
    if err := json.Unmarshal(body, &jsonResp); err != nil {
        return nil, err
    }

    results := make(map[string]string)
    moonPhase := ""

	data := getMap(jsonResp["data"])
	table := getMap(data["table"])
	rows := getSlice(table["rows"])

	for _, row := range rows {
		r := getMap(row)
		entry := getMap(r["entry"])
		name := getString(entry["name"])
		results[name] = ""

		cells := getSlice(r["cells"])
		if len(cells) == 0 {
			continue
		}

		cell := getMap(cells[0])
		pos := getMap(cell["position"])
		constel := getString(getMap(pos["constellation"])["name"])
		results[name] = constel

		if entry["id"] == "moon" {
			extraInfo := getMap(cell["extraInfo"])
			phase := getString(getMap(extraInfo["phase"])["string"])
			if phase != "" {
				moonPhase = phase
			}
		}
	}

    return &CelestialData{
        Bodies:    results,
        MoonPhase: moonPhase,
    }, nil
}

func getMap(m any) map[string]any {
    if m2, ok := m.(map[string]any); ok {
        return m2
    }
    return nil
}

func getSlice(s any) []any {
    if s2, ok := s.([]any); ok {
        return s2
    }
    return nil
}

func getString(s any) string {
    if str, ok := s.(string); ok {
        return str
    }
    return ""
}
