package main


import (
    "encoding/csv"
    "fmt"
    "os"
    "io"
    "errors"
    "strings"
    "strconv"
)

// column indexed
type DataFrame struct {
    name string
    columns []string
    values *[][]string // col, row
    numberRows int
    numberColumns int
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

func readCsv(filePath string, name string, separator rune) (DataFrame) {
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
    csvReader.Comma = separator
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

    return DataFrame {
        name, 
        columns,
        &values,
        numberLines, 
        len(columns),
    }
}



func (df DataFrame) getColumn(columnName string) ([]string, error){
    columnIndex, err := findIndex(df.columns, columnName)
    if err != nil {
        return nil, errors.New("Column not present.")
    }
    return (*df.values)[columnIndex], nil
}

func (df DataFrame) filterColumns(columnNames []string) (DataFrame, error){
    // filter the columns in csv to a subset
    columns := make([][]string, len(columnNames)) // column, row
    for i, colName := range columnNames {
        columnValue, err := df.getColumn(colName)
        if err != nil{
            fmt.Println("Error in getting column ", err)
            return df, err
        }
        columns[i] = columnValue
    }

    return DataFrame {
        df.name,
        columnNames,
        &columns,
        df.numberRows,
        len(columnNames),
    }, nil
}


func (df DataFrame) filter(column string, value string) (DataFrame, error){
    // filter csv over a column where items have desired value
    columnIndex, err := findIndex(df.columns, column) 

    if err != nil {
        return df, errors.New("Column not found on filter")
    }

    values := make([][]string, df.numberColumns)

    rows := 0
    for row := 0; row < df.numberRows; row++{
        if (*df.values)[columnIndex][row] != value {
            continue
        }

        rows ++
        for col := 0; col < df.numberColumns; col++{
            values[col] = append(values[col], (*df.values)[col][row])
        }
    }
    
    return DataFrame{
        df.name,
        df.columns,
        &values,
        rows,
        df.numberColumns,
    }, nil
}

func (df DataFrame) aggregate(column string) (DataFrame, error){
    // aggregate csv over a column
    aggregationIndex, err := findIndex(df.columns, column)
    if err != nil {
        return df, errors.New("Aggregation column not available")
    }

    // find the columns indexes to aggregate on 
    columnsIndexes := []int{}
    for col := 0; col < df.numberColumns ; col++{
        if df.columns[col] == column {
            continue
        }
        columnsIndexes = append(columnsIndexes, col)
    }


    // map keys are a string representation of the indexing column
    // because we cannot use the slices as keys
    aggregationMap := make(map[string][]string)
    
    // filling in the map
    for row := 0; row < df.numberRows; row++{
        columns := []string{}
        for _, colIndex := range columnsIndexes {
            columns = append(columns, (*df.values)[colIndex][row])
        }
        colKey := strings.Join(columns, "|")
        aggregationMap[colKey] = append(
            aggregationMap[colKey], 
            (*df.values)[aggregationIndex][row],
        )
    }

    aggregate := make(map[string]string)

    // aggregating the values
    for columns, values := range aggregationMap {
        var sum float64 = 0
        for _, value := range values {
            if val, err := strconv.ParseFloat(value, 64); 
              err == nil {
                sum += val
            }
        }
        aggregate[columns] = fmt.Sprintf("%f", sum)
    }

    // crating the new csv
    values := make([][]string, df.numberColumns)
    numberRows := len(aggregate)
    for col := range df.columns {
        values[col] = make([]string, numberRows)
    }

    row := 0
    for columns, value := range aggregate {
        // filling the cols
        var cols []string = strings.Split(columns, "|")
        for i, colIdx := range columnsIndexes {
            values[colIdx][row] = cols[i]
        }

        // filling the agg col
        values[aggregationIndex][row] = value
        row ++ 
    }
    
    return DataFrame{
        df.name,
        df.columns,
        &values,
        numberRows,
        df.numberColumns,
    }, nil
}

func (df DataFrame) toMap() ([]map[string]string){
    mapping := make([]map[string]string, df.numberRows)

    for rowIdx := range mapping {
        rowElem := make(map[string]string)

        for j := 0; j < df.numberColumns ; j++{
            rowElem[df.columns[j]] = (*df.values)[j][rowIdx]
        }

        mapping[rowIdx] = rowElem
    }
    return mapping
}

func (csv DataFrame) toCsv() (string){
    var rows []string 
    rows = append(rows, strings.Join(csv.columns, ","))
    for row :=0 ; row < csv.numberRows ; row++{
        var buffer []string;
        for col := 0; col < csv.numberColumns; col++ {
            buffer = append(buffer, (*csv.values)[col][row])
        }
        rows = append(rows, strings.Join(buffer, ","))
    }
    return strings.Join(rows, "\n")
}
