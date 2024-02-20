import React, { Component } from 'react'
import axios from 'axios'
import PoissonDistResults from './PoissonDistResults'

class PostForm extends Component {
    constructor(props) {
      super(props)
    
      this.state = {
         city:'',
         minutes:'',
         player_name: '',
         bookLine:'',
         predictedPoints : null,
         poissonDistResults: null,
         error: null
      }
    }
    
    changeHandler = (e) => {
        this.setState({[e.target.id]: e.target.value})
    }
    
    submitHandler = e => {
        e.preventDefault()
        const { city, minutes, player_name, bookLine } = this.state;
        const data = {
            city: city,
            minutes: parseFloat(minutes),
        };
        console.log(this.state)
        axios.post(`http://127.0.0.1:5000/points-prediction/${player_name}`, data).then(response =>{const predictedPoints = response.data.projected_points;this.setState({ predictedPoints})
          axios.post('http://127.0.0.1:5000/poisson_dist', { predictedPoints, bookLine })
            .then(response => {
                const poissonDistResults = response.data;
                this.setState({ poissonDistResults, error: null });
            })
            .catch(error => {
                this.setState({ error: 'An error occurred while fetching data', poissonDistResults: null });
                console.error('Error:', error);
            });
          }).catch(error =>{this.setState({ error: 'An error occurred while fetching data', predictedPoints: null });
        console.error('Error:', error);})
    }
    
  render() {
    const {city,minutes,player_name, bookLine, predictedPoints, poissonDistResults, error} = this.state
    return (
      <div>
        <form onSubmit={this.submitHandler} className='model-inputs'>
            <div className='input-row'>
                <label htmlFor='player_name'>Player Name</label>
                <input type='text' id="player_name" value={player_name} onChange={this.changeHandler} />
            </div>
            <div className='input-row'>
                <label htmlFor='Opponent City'>Opponent City</label>
                <input type='text' id="city" value={city} onChange={this.changeHandler} />
            </div>
            <div className='input-row'>
                <label htmlFor='Projected Minutes'>Projected Minutes</label>
                <input type='number' id="minutes" value={minutes} onChange={this.changeHandler}/>
            </div>
            <div className='input-row'>
                <label htmlFor='bookLine'>Book Line</label>
                <input type='number' id='bookLine' value={bookLine} onChange={this.changeHandler} />
            </div>
            <button type='submit' className='btn'>Predict</button>
        </form>
        {predictedPoints !== null && (
          <div className='result'>
              <h2>Predicted Points:</h2>
              <p>{predictedPoints}</p>
          </div>
        )}
        {poissonDistResults !== null && (
          <PoissonDistResults
            lessThan={poissonDistResults.less}
            greaterThan={poissonDistResults.greater}
            bookLine={bookLine}
          />
        )}
        {error && <p className='error'>{error}</p>}
      </div>
    )
  }
}

export default PostForm