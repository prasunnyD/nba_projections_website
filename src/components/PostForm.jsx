import React, { Component } from 'react'
import axios from 'axios'
class PostForm extends Component {
    constructor(props) {
      super(props)
    
      this.state = {
         OEFG:'',
         OFTR:'',
         OREB:'',
         PACE:'',
         minutes:'',
         player_name: '',
         predictedPoints : null,
         error: null
      }
    }
    
    changeHandler = (e) => {
        this.setState({[e.target.id]: e.target.value})
    }
    
    submitHandler = e => {
        e.preventDefault()
        const { OEFG, OFTR, OREB, PACE, minutes, player_name } = this.state;
        const data = {
            OEFG: parseFloat(OEFG),
            OFTR: parseFloat(OFTR),
            OREB: parseFloat(OREB),
            PACE: parseFloat(PACE),
            minutes: parseFloat(minutes)
        };
        console.log(this.state)
        axios.post(`http://127.0.0.1:5000/points-prediction/${player_name}`, this.state).then(response =>{this.setState({ predictedPoints: response.data.projected_points, error: null });}).catch(error =>{this.setState({ error: 'An error occurred while fetching data', predictedPoints: null });
        console.error('Error:', error);})
    }
    
  render() {
    const {OEFG,OFTR,OREB,PACE,minutes,player_name, predictedPoints, error} = this.state
    return (
      <div>
        <form onSubmit={this.submitHandler} className='model-inputs'>
            <div className='input-row'>
                <label htmlFor='player_name'>Player Name</label>
                <input type='text' id="player_name" value={player_name} onChange={this.changeHandler} />
            </div>
            <div className='input-row'>
                <label htmlFor='Opponent effective field goal'>Opponent Effective Field Goal</label>
                <input type='number' id="OEFG" value={OEFG} onChange={this.changeHandler}/>
            </div>
            <div className='input-row'>
                <label htmlFor='Opponent free throw rate'>Opponent Free Throw Rate</label>
                <input type='number' id="OFTR" value={OFTR} onChange={this.changeHandler}/>
            </div>
             <div className='input-row'>
                <label htmlFor='Opponent Rebouding rate'>Opponent Rebounding Rate</label>
                <input type='number' id="OREB" value={OREB} onChange={this.changeHandler}/>
            </div>
            <div className='input-row'>
                 <label htmlFor='PACE'>PACE</label>
                <input type='number' id="PACE" value={PACE} onChange={this.changeHandler}/>
            </div>
            <div className='input-row'>
                <label htmlFor='Projected Minutes'>Projected Minutes</label>
                <input type='number' id="minutes" value={minutes} onChange={this.changeHandler}/>
            </div>
            <button type='submit' className='btn'>Predict</button>
        </form>
        {predictedPoints !== null && (
          <div className='result'>
              <h2>Predicted Points:</h2>
              <p>{predictedPoints}</p>
          </div>
        )}
        {error && <p className='error'>{error}</p>}
      </div>
    )
  }
}

export default PostForm