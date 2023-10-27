package main

import (
    "encoding/csv"
    "encoding/json"
    "fmt"
    "os"
    "io"
    "net/http"
    "errors"
)

// column indexed
type CSV struct {
    name string
    columns []string
    values *[][]string // col, row
    numberRows int
    numberColumns int
} 

func (csv CSV) getColumn(columnName string) ([]string, error){
    columnIndex, err := findIndex(csv.columns, columnName)
    if err != nil {
        fmt.Println(columnName, csv.columns, columnIndex)
        return nil, errors.New("Column not present.")
    }
    return (*csv.values)[columnIndex], nil
}


func (csv CSV) getData (w http.ResponseWriter, r *http.Request){
    if r.Method != http.MethodGet {
        http.Error(w, "Only GET method is supported", http.StatusMethodNotAllowed)
        return
    }
    query := r.URL.Query()

    columnNames := query["column"]

    fmt.Println("Get request for table ", csv.name, " and columns: ", columnNames)

    var columns [][]string

    for _, colName := range columnNames{
        columnValue, err := csv.getColumn(colName)
        if err != nil{
            fmt.Println("Error in getting column ", err)
            return
        }
        columns = append(columns, columnValue)
    }

    // converting the format
    mapping := make([]map[string]string, csv.numberRows)

    for rowIdx := range mapping {
        rowElem := make(map[string]string)

        for j := range columns {
            rowElem[columnNames[j]] = columns[j][rowIdx]
        }

        mapping[rowIdx] = rowElem
    }

    w.Header().Set("Content-Type", "application/json")
    w.Header().Set("Access-Control-Allow-Origin", "*")
    json.NewEncoder(w).Encode(mapping)
    
    fmt.Println(
        "Get request completed, sending ", 
        len(columns), 
        " columns and ", 
        len(columns[0]), 
        " lines",
    )
}

func findIndex (values []string, key string) (int, error) {
    for i, v := range values {
        if key == v {
            return i, nil
        }
    }
    return -1, errors.New("Key not present in values.")
}

func getInfo(filePath string) (numberLines int, columns []string){

    fileDescriptor, error := os.Open(filePath)
    if error != nil {
        fmt.Println("Error while opening file :", error)
    }
    defer fileDescriptor.Close()

    csvReader := csv.NewReader(fileDescriptor)
    csvReader.Comma = ';'
    csvReader.ReuseRecord = true

    row, error := csvReader.Read()
    columns = make([]string, len(row))
    copy(columns, row)

    for numberLines = 0 ;; numberLines++ {
        _, error = csvReader.Read()
        if error == io.EOF {
            break
        }
    }

    return
}

func readCsv(filePath string, name string) (CSV) {
    numberLines, columns := getInfo(filePath)

    values := make([][]string, len(columns))
    for i := range values {
        values[i] = make([]string, numberLines)
    }
    
    // actually reading file contents
    fileDescriptor, error := os.Open(filePath)
    if error != nil {
        fmt.Println("Error while opening file :", error)
    }
    defer fileDescriptor.Close()

    csvReader := csv.NewReader(fileDescriptor)
    csvReader.Comma = ';'
    csvReader.ReuseRecord = true
    csvReader.Read() // first row of column names

    var row []string
    for i := 0; ; i++{
        row, error = csvReader.Read()
        if error == io.EOF {
            break
        }
        for colCount := range columns {
            values[colCount][i] = row[colCount]
        }
    }

    return CSV {
        name, 
        columns,
        &values,
        numberLines, 
        len(columns),
    }
}

func initializeEndpoints (csvs []CSV) {
    for _, csv := range csvs {
        http.HandleFunc("/" + csv.name, csv.getData)
    }
}

func main(){
    port := ":4444"
    fmt.Println("Starting a server.")

    countries := readCsv("data/PAIS.csv", "countries")
    exports := readCsv("data/BRAZIL_EXP_COMPLETE_1.csv", "exports")
    initializeEndpoints([]CSV{countries, exports})

    fmt.Println("Listening on port ", port)

    err := http.ListenAndServe(port, nil)

    if err != nil {
        fmt.Println("Error on server.", err)
    }
}   
