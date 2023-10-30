const YearSlider = ({ selectedYear, handleYearChange }) => {
    return (
        <div style={{ display: 'flex', justifyContent: 'center', height: '200vh',}}>
            <div style={{ marginTop: '50px' }}>
                <input
                    className="slider"
                    type="range" 
                    min="1996"
                    max="2023" // Set the max year as needed
                    step="1"
                    value={selectedYear}
                    onChange={handleYearChange}
                />
                <div className="sliderticks">
                    <span>1996</span>
                    <span>2023</span>
                </div>
                <p style={{textAlign: 'center'}}>Selected year: {selectedYear}</p>
            </div>
        </div>
    );
};

export default YearSlider;