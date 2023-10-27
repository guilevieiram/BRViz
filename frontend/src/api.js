const serverAddress = "http://localhost:4444";

const getData = async ({
    tableName, columns
}) => {
    const parameters = columns.map(col => "column=" + col).join("&");
    const endpoint = `${serverAddress}/${tableName}?${parameters}`;
    const response = await fetch(endpoint);
    const json = await response.json();
    return json;
};

export {getData};
