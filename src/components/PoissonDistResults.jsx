import React from 'react';

const PoissonDistResults = ({ lessThan, greaterThan, bookLine }) => {
    // Convert lessThan and greaterThan values to percentages
    const lessThanPercentage = (lessThan * 100).toFixed(2);
    const greaterThanPercentage = (greaterThan * 100).toFixed(2);

    return (
        <div className='result'>
            <h2>Poisson Distribution Results:</h2>
            <p>Less Than {bookLine}: {lessThanPercentage}%</p>
            <p>Greater Than {bookLine} : {greaterThanPercentage}%</p>
        </div>
    );
};

export default PoissonDistResults;
