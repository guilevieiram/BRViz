const serverAddress = "http://localhost:4444";

const getData = async ({
    tableName, 
    columns, 
    format,
    aggregate,
    filterColumn,
    filterValue,
}) => {

    // default params
    if(!format) format = "json"
    if(!columns) columns = []

    const parameters = [
        `format=${format}`,
        columns
            .map(col => "column=" + col)
            .join("&"),
    ] 

    if(aggregate)
      parameters.push(`aggregate=${aggregate}`)

    if(filterValue && filterColumn){
      parameters.push(`filterValue=${filterValue}`)
      parameters.push(`filterColumn=${filterColumn}`)
    }

    const param = parameters.join('&');
    const endpoint = `${serverAddress}/${tableName}?${param}`;
    const response = await fetch(endpoint);
    const json = await response.json();
    return json;
};

export {getData};
